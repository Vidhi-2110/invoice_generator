# 🧾 Futentia Invoice & Proforma Management System (InvoSaaS)

> A full-stack, enterprise-grade invoicing, proforma estimate generation, and business analytics application built with **React 19**, **Vite**, **Express 5**, and **MongoDB**.

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Atomic Counter System](#-atomic-counter-system)
- [Security Hardening](#-security-hardening)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Getting Started & Local Setup](#-getting-started--local-setup)
- [Module Documentation Links](#-module-documentation-links)
- [Production Deployment Guide](#-production-deployment-guide)
- [License](#-license)

---

## 🎯 Overview

The **Futentia Invoice & Proforma Management System** provides businesses with a seamless, modular, and reliable platform to manage billing documents, estimates, and financial insights.

Designed with a **decoupled domain-driven modular structure** on the frontend and a **RESTful Express/MongoDB architecture** on the backend, the application guarantees strict multi-tenancy (per-user data scoping) and sequential document numbering without collisions.

---

## 🚀 Key Features

- 🔐 **User Authentication & Authorization**: Secure registration and login using JSON Web Tokens (JWT) and `bcryptjs` password hashing with rate-limited auth endpoints.
- 📊 **Executive Business Dashboard**: Real-time KPI metrics displaying total revenue, paid vs. pending receivables, active proforma pipelines, and monthly performance.
- 🧾 **Standard Tax Invoicing (`/invoice`)**:
  - Full CRUD operations with server-enforced atomic numbering (`FS/26-27/0001`, `FS/26-27/0002`...).
  - Dynamic line items manager with statutory SAC code lookups, real-time GST computation (CGST+SGST or IGST based on state codes), and amount in words conversion.
  - Multi-proforma linking with automated locking of already-invoiced/approved estimates.
  - Direct customer email dispatch with professional HTML invoice templates via SMTP.
- 📑 **Proforma Quotations (`/proforma-invoice`)**:
  - Dedicated preliminary billing estimate management (`FSPI-0001`, `FSPI-0002`...).
  - 1-click **Convert to Tax Invoice** workflow with line-item porting and duplicate prevention.
  - Validity expiration date tracking.
- 👥 **Customer Directory (`/clients`)**:
  - Customer directory with address and GSTIN storage.
  - Auto-fills billing details and loads relevant proformas instantly when selecting a client in invoice drafting.
- 🖨️ **Print & PDF Exporting**: Clean print-ready stylesheet rules (`@media print`) optimized for A4 document generation directly from the browser preview.
- 📥 **Excel / CSV Export**: Instant table export with custom date and fiscal year filtering.
- 💾 **Offline Resilience (Hybrid Persistence)**: Automatically syncs with MongoDB via Express API, with graceful fallback to browser `localStorage` when offline.
- 🎨 **Modern Responsive UI**: Styled with Tailwind CSS v4, custom brand theme customization (company logo, digital signature, stamp, and brand accent colors).

---

## ⚡ Tech Stack

### **Frontend (`/client`)**
| Technology | Version / Purpose |
| :--- | :--- |
| **React** | v19 — Modern UI component library |
| **Vite** | v8 — Lightning-fast build tool, proxy & dev server |
| **Tailwind CSS** | v4 — High-performance utility CSS engine |
| **React Router DOM** | v7 — Single-page application client routing |
| **React Icons** | v5 — Feather & UI icon sets |

### **Backend (`/server`)**
| Technology | Version / Purpose |
| :--- | :--- |
| **Node.js** | v18+ runtime environment |
| **Express.js** | v5 — Modern REST API framework |
| **MongoDB Driver** | v7 — Official native MongoDB client |
| **Helmet** | HTTP security headers |
| **Express Rate Limit** | Brute-force mitigation on auth routes |
| **JWT (jsonwebtoken)** | v9 — Stateless Bearer token verification |
| **Bcrypt.js** | v3 — Password hashing (10 salt rounds) |
| **Nodemailer** | SMTP email delivery with HTML templates |

---

## 🏗️ Project Architecture

```text
invoice_generator/
├── client/                     # React 19 + Vite Frontend
│   ├── docs/                   # Detailed module documentation (9 files)
│   ├── src/
│   │   ├── api/                # REST API service clients (JWT attached)
│   │   ├── components/         # Layout (Sidebar, Navbar), ExportButton
│   │   ├── core/               # DocumentEngine (Form, Preview, Table), theme, utils
│   │   ├── modules/            # Domain modules (auth, client, dashboard, invoice, proforma, settings)
│   │   └── routes/             # AppRoutes
│   ├── MODULE_DOCUMENTATION.md # Frontend architecture index
│   └── README.md
├── server/                     # Express 5 + MongoDB Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection pool (db.js)
│   │   ├── controllers/        # auth, client, invoice, proforma, sacCode
│   │   ├── middleware/         # authMiddleware, dbCheck
│   │   ├── models/             # Schema definitions & normalizers
│   │   ├── routes/             # Express route routers
│   │   ├── services/           # emailService, pdfService
│   │   ├── app.js              # Express app, helmet, cors, rate-limit, global error handler
│   │   └── index.js            # Server startup & graceful shutdown
│   ├── .env.example            # Sanitized environment template
│   ├── package.json
│   └── README.md
├── .gitignore                  # Clean, unified gitignore
└── README.md                   # This file
```

---

## 🔢 Atomic Counter System

To prevent duplicate invoice and proforma IDs across concurrent sessions:
- Document numbering is generated **server-side** during `POST /api/invoices` and `POST /api/proformas`.
- MongoDB's atomic `findOneAndUpdate` with `$inc: { seq: 1 }` is executed against the `counters` collection.
- Counter keys are scoped per user (`invoice_{userId}` and `proforma_{userId}`), ensuring total data isolation and sequential gaps prevention.
- Client-submitted `invoiceNumber` fields are stripped or overridden by the server.

---

## 🛡️ Security Hardening

- **Helmet**: Injected at the top of the middleware chain for XSS, content-sniffing, and frameguard protections.
- **Rate Limiting**: `express-rate-limit` guards `/api/auth/*` (20 requests per 15 minutes per IP).
- **Graceful Startup & Shutdown**: The server awaits verified MongoDB connection before accepting incoming traffic, and cleanly terminates database connections on `SIGTERM` / `SIGINT`.
- **Global Error Handling**: Unhandled exceptions are caught centrally and logged with stack traces while returning sanitized JSON responses to clients.

---

## 📡 API Endpoints Reference

### **Health Check**
- `GET /api/health` — Check server status & MongoDB connection state.

### **Authentication**
- `POST /api/auth/register` — Create account.
- `POST /api/auth/login` — Login & receive JWT.
- `GET /api/auth/me` *(Protected)* — Current user profile.
- `PUT /api/auth/profile` *(Protected)* — Update profile.
- `PUT /api/auth/company-assets` *(Protected)* — Update logo/stamp/signature.

### **Invoices** *(Protected)*
- `GET /api/invoices` — List invoices.
- `POST /api/invoices` — Create invoice (assigned `FS/26-27/xxxx` automatically).
- `PUT /api/invoices/:id` — Update invoice (number is immutable).
- `DELETE /api/invoices/:id` — Delete invoice.

### **Proformas** *(Protected)*
- `GET /api/proformas` — List proformas.
- `POST /api/proformas` — Create proforma (assigned `FSPI-xxxx` automatically).
- `PUT /api/proformas/:id` — Update proforma.
- `DELETE /api/proformas/:id` — Delete proforma.

### **Clients** *(Protected)*
- `GET /api/clients` — List clients.
- `POST /api/clients` — Add client.
- `PUT /api/clients/:id` — Update client.
- `DELETE /api/clients/:id` — Delete client.

### **SAC Codes**
- `GET /api/sac-codes` — List statutory SAC codes.

---

## 🚀 Getting Started & Local Setup

### 1. Backend Setup (`/server`)
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MONGO_URI, JWT_SECRET, and Gmail SMTP credentials
npm run dev
```

### 2. Frontend Setup (`/client`)
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173).

---

## 📚 Module Documentation Links

- [Client Master Documentation](client/MODULE_DOCUMENTATION.md)
- [Client README](client/README.md)
- [Server README](server/README.md)
- [Auth Module](client/docs/AUTH_MODULE.md)
- [Invoice Module](client/docs/INVOICE_MODULE.md)
- [Proforma Module](client/docs/PROFORMA_MODULE.md)
- [Dashboard Module](client/docs/DASHBOARD_MODULE.md)
- [Client Directory Module](client/docs/CLIENT_MODULE.md)
- [Settings Module](client/docs/SETTINGS_MODULE.md)
- [Core Document Engine](client/docs/CORE_ENGINE.md)
- [API Layer](client/docs/API_LAYER.md)
- [Layout System](client/docs/LAYOUT.md)

---

## 🌐 Production Deployment Guide

### Deploying the Backend (e.g. Render / Railway)
1. Set Root Directory: `server`
2. Build Command: `npm install`
3. Start Command: `npm start`
4. Environment Variables:
   - `PORT`: `5001` (or assigned by host)
   - `FRONTEND_URL`: URL of your deployed frontend (e.g. `https://your-app.vercel.app`)
   - `MONGO_URI`: Your production MongoDB Atlas connection string
   - `JWT_SECRET`: Random 32+ character secret string
   - `JWT_EXPIRES_IN`: `7d`
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: Your organization email
   - `SMTP_PASS`: Your Gmail App Password

### Deploying the Frontend (e.g. Vercel)
1. Set Root Directory: `client`
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://your-api.onrender.com`)

---

## 📄 License

This project is licensed under the **ISC License**. Developed for **Futentia Solutions**.
