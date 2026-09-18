# 🧾 Invoice & Proforma Management System

> A full-stack, enterprise-grade invoicing, proforma estimate generation, and business analytics application built with **React 19**, **Vite**, **Express.js**, and **MongoDB**.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
  - [Directory Structure](#directory-structure)
  - [Modular Frontend Architecture](#modular-frontend-architecture)
  - [Backend Architecture](#backend-architecture)
- [Database & Data Models](#-database--data-models)
- [API Endpoints Reference](#-api-endpoints-reference)
- [Getting Started & Local Setup](#-getting-started--local-setup)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Variables Configuration](#-environment-variables-configuration)
- [Offline Resilience & Hybrid Storage](#-offline-resilience--hybrid-storage)
- [Print & PDF Export Capabilities](#-print--pdf-export-capabilities)
- [Troubleshooting & Common Issues](#-troubleshooting--common-issues)
- [License](#-license)

---

## 🌐 Overview

The **Invoice & Proforma Management System** provides businesses with a seamless, modular, and reliable platform to manage billing documents, estimates, and financial insights.

Designed with a **decoupled domain-driven modular structure** on the frontend and a **RESTful Express/MongoDB architecture** on the backend, the application allows developers to reuse core business modules (Invoice, Proforma, Auth, Dashboard) across different React projects effortlessly.

---

## 🚀 Key Features

- 🔐 **User Authentication & Authorization**: Secure sign up and log in using JSON Web Tokens (JWT) and `bcrypt.js` password hashing.
- 📊 **Executive Business Dashboard**: Overview metrics displaying total revenue, paid vs. pending totals, proforma estimate values, and status distribution charts/tables.
- 📄 **Standard Invoicing Module**:
  - Full CRUD (Create, Read, Update, Delete) operations for invoices.
  - Automatic fiscal-year sequential numbering (e.g., `FS/26-27/0001`).
  - Dynamic line items manager with real-time subtotal, tax rate, and grand total calculations.
- 📝 **Proforma & Quotations Module**:
  - Dedicated preliminary billing estimate management (e.g., `FSP/26-27/0001`).
  - Customizable validity period tracking (e.g., 30 days valid).
- 🖨️ **Print & PDF Exporting**: Clean print-ready stylesheet rules optimized for A4 invoice generation directly from the browser preview.
- ⚡ **Offline Resilience (Hybrid Persistence)**: Automatically syncs with MongoDB via Express API, with automatic fallback to browser `localStorage` when offline or disconnected.
- 🎨 **Modern & Responsive UI**: Styled with Tailwind CSS v4 and React Icons for clean visual feedback across mobile, tablet, and desktop devices.

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Version / Purpose |
| :--- | :--- |
| **React** | v19 - Modern UI Library |
| **Vite** | v8 - Lightning-fast build tool & dev server |
| **Tailwind CSS** | v4 - Utility-first modern CSS framework |
| **React Router DOM** | v7 - Single-page application client routing |
| **React Icons** | v5 - Feather & UI Icon sets |

### **Backend**
| Technology | Version / Purpose |
| :--- | :--- |
| **Node.js** | Runtime environment |
| **Express.js** | v5 - REST API framework |
| **MongoDB Driver** | v7 - Official MongoDB client database driver |
| **JWT (jsonwebtoken)** | v9 - User authentication & token verification |
| **Bcrypt.js** | v3 - Password hashing algorithm |
| **Dotenv & CORS** | Environment configuration and frontend cross-origin sharing |

---

## 📁 Project Architecture

```text
New_Invoice/
├── client/              # React + Vite Frontend Application
│   ├── src/
│   │   ├── api/         # Centralized API service functions (Invoice, Proforma, Auth)
│   │   ├── components/  # App layout (Layout, Navbar, Sidebar)
│   │   ├── core/        # Utility helpers and global constants
│   │   ├── modules/     # Self-contained domain modules
│   │   │   ├── auth/    # Login, Register, Protected routes & Auth Context
│   │   │   ├── dashboard/# Business analytics & revenue metrics page
│   │   │   ├── invoice/ # Invoice Context, Form, Preview, Table & Pages
│   │   │   └── proforma/# Proforma Context, Form, Preview, Table & Pages
│   │   ├── routes/      # App route definitions
│   │   ├── App.jsx      # Core Root Component & Providers
│   │   ├── main.jsx     # Vite DOM Entry Point
│   │   └── index.css    # Tailwind CSS imports & print styles
│   ├── package.json
│   └── vite.config.js
│
└── server/              # Express.js + MongoDB Backend API
    ├── src/
    │   ├── config/      # DB connection pooling (db.js)
    │   ├── controllers/ # Request logic (invoiceController, proformaController, authController)
    │   ├── middleware/  # Auth verification & error handling
    │   ├── models/      # MongoDB collection models (Invoice.js, Proforma.js, User.js)
    │   ├── routes/      # API routes (invoiceRoutes, proformaRoutes, authRoutes)
    │   ├── app.js       # Express application configuration & middleware
    │   └── index.js     # Server entrypoint & HTTP listener
    ├── .env.example
    ├── package.json
    └── README.md
```

### 📦 Modular Frontend Architecture (`src/modules/`)

Each domain module in `src/modules/` is designed as an independent unit containing its own pages, components, context, configuration, and index entrypoint.

- **`auth/`**: Context and services managing authentication tokens, current user session state, and login/register interfaces.
- **`invoice/`**: Invoice context provider managing state sync, auto-incrementing invoice numbers, line items calculations, table view, and detailed invoice preview.
- **`proforma/`**: Independent provider for estimate quotes with validity dates and separate sequence counters.
- **`dashboard/`**: Decoupled component receiving invoice & proforma data to generate real-time metrics cards and status charts.

---

## 🗄️ Database & Data Models

### 1. Invoice Document (`invoices` collection)
```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d1",
  "invoiceNumber": "FS/26-27/0001",
  "clientName": "Acme Corporation",
  "clientEmail": "billing@acme.com",
  "clientAddress": "123 Business Way, Tech City",
  "createdDate": "2026-09-18",
  "dueDate": "2026-10-18",
  "status": "Paid",
  "items": [
    {
      "description": "Web Development Services",
      "quantity": 10,
      "rate": 150,
      "amount": 1500
    }
  ],
  "subtotal": 1500,
  "taxRate": 18,
  "taxAmount": 270,
  "total": 1770,
  "notes": "Thank you for your business!",
  "createdAt": "2026-09-18T10:00:00.000Z"
}
```

### 2. Proforma Document (`proformas` collection)
```json
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d2",
  "proformaNumber": "FSP/26-27/0001",
  "clientName": "Stark Industries",
  "clientEmail": "finance@stark.com",
  "createdDate": "2026-09-18",
  "validityDays": 30,
  "status": "Pending",
  "items": [
    {
      "description": "System Design Consultation",
      "quantity": 5,
      "rate": 200,
      "amount": 1000
    }
  ],
  "subtotal": 1000,
  "taxRate": 18,
  "taxAmount": 180,
  "total": 1180,
  "createdAt": "2026-09-18T10:00:00.000Z"
}
```

---

## 🔌 API Endpoints Reference

### **Health Check**
- `GET /api/health` — Check server status & MongoDB connection state.

### **Invoices API**
- `GET /api/invoices` — Retrieve all invoices.
- `POST /api/invoices` — Create a new invoice document.
- `PUT /api/invoices/:id` — Update an existing invoice by ID.
- `DELETE /api/invoices/:id` — Delete an invoice document by ID.

### **Proforma API**
- `GET /api/proformas` — Retrieve all proforma estimates.
- `POST /api/proformas` — Create a new proforma document.
- `PUT /api/proformas/:id` — Update an existing proforma by ID.
- `DELETE /api/proformas/:id` — Delete a proforma document by ID.

### **Authentication API**
- `POST /api/auth/register` — Create a new user account.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Fetch current logged-in user profile.

---

## 💻 Getting Started & Local Setup

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (Local instance running or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud cluster)

---

### 1. Backend Setup (`/server`)

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `server` directory (or copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure your `.env` variables:
   ```env
   PORT=5001
   FRONTEND_URL=http://localhost:5173
   MONGO_URI=mongodb://localhost:27017/Invoice
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRES_IN=7d
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:5001` and connect to MongoDB.*

---

### 2. Frontend Setup (`/client`)

1. Open a new terminal window and navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit:
   ```
   http://localhost:5173
   ```

---

## 🔐 Environment Variables Configuration

### **Backend (`server/.env`)**
| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `PORT` | Express server HTTP port | `5001` |
| `FRONTEND_URL` | Allowed origin for CORS headers | `http://localhost:5173` |
| `MONGO_URI` | MongoDB Connection URI | `mongodb://localhost:27017/Invoice` |
| `JWT_SECRET` | Secret key used to sign JWT tokens | `your_secret_key` |
| `JWT_EXPIRES_IN` | JWT token validity window | `7d` |

### **Frontend (`client/.env` optional)**
| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for backend Express REST API | `http://localhost:5001` |

---

## ⚡ Offline Resilience & Hybrid Storage

The frontend application uses a **hybrid synchronization layer**:
1. When performing read/write operations, the React contexts (`InvoiceContext` & `ProformaContext`) attempt to communicate with the Express API / MongoDB database.
2. Every successful API fetch updates both component state and browser `localStorage`.
3. If the backend is unreachable or the network drops, the application automatically falls back to `localStorage` without interrupting user workflows, allowing seamless offline creation and editing.

---

## 🖨️ Print & PDF Export Capabilities

- Every invoice detail view (`/invoice/:id`) and proforma detail view (`/proforma-invoice/:id`) includes a dedicated **Print / Export PDF** action.
- Uses CSS `@media print` rules to hide UI controls (sidebars, navbars, action buttons) and formats the invoice into a clean, pixel-perfect A4 printable layout.

---

## ❓ Troubleshooting & Common Issues

- **Backend fails to connect to MongoDB**:
  - Verify that MongoDB is running locally (`mongod`) or check your MongoDB Atlas connection string and network access whitelist in `.env`.
- **CORS Error on Frontend**:
  - Ensure `FRONTEND_URL` in `server/.env` matches your Vite client origin (`http://localhost:5173`).
- **Port Conflict**:
  - If port `5001` or `5173` is in use, change `PORT` in `server/.env` and update `proxy` / `VITE_API_URL` accordingly.

---

## 📜 License

This project is licensed under the **ISC License**. Feel free to customize and integrate these modules into your commercial or personal projects!
