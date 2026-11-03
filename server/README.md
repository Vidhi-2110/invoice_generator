# InvoSaaS — Backend API Server

> Production-ready RESTful API server for the **Futentia Invoice & Proforma Management System**, built with **Node.js**, **Express 5**, and native **MongoDB**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Security Implementations](#security-implementations)
- [Atomic Counter System](#atomic-counter-system)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Production Deployment](#production-deployment)

---

## 🎯 Overview

The backend server provides a secure, stateless REST API handling user identity, document creation, atomic sequential numbering, status synchronization, PDF generation, and automated email dispatch via SMTP.

---

## ⚡ Architecture & Tech Stack

- **Runtime**: Node.js v18+ (CommonJS)
- **Framework**: Express.js v5
- **Database**: MongoDB (native driver v7, connection pooling via `app.locals.dbClient`)
- **Authentication**: JWT (JSON Web Tokens) with HMAC-SHA256 signature verification
- **Password Hashing**: `bcryptjs` with 10 salt rounds
- **Email Delivery**: `nodemailer` over TLS/STARTTLS
- **PDF Generation**: `pdfkit` for server-side generation when required

```text
server/
├── src/
│   ├── config/
│   │   └── db.js                # MongoDB connection management & pool
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, profile, assets
│   │   ├── clientController.js   # Client CRUD scoped to user
│   │   ├── invoiceController.js  # Invoice CRUD & atomic counter (FSIN-xxxx)
│   │   ├── proformaController.js # Proforma CRUD & atomic counter (FSPI-xxxx)
│   │   └── sacCodeController.js  # SAC master codes retrieval
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token validation
│   │   └── dbCheck.js            # DB connectivity guard
│   ├── models/
│   │   ├── Client.js             # Data normalization & schemas
│   │   ├── Invoice.js
│   │   ├── Proforma.js
│   │   ├── SacCode.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth
│   │   ├── clientRoutes.js       # /api/clients
│   │   ├── invoiceRoutes.js      # /api/invoices
│   │   ├── proformaRoutes.js     # /api/proformas
│   │   └── sacCodeRoutes.js      # /api/sac-codes
│   ├── services/
│   │   ├── emailService.js       # Nodemailer transport & HTML invoice templates
│   │   └── pdfService.js         # PDF generator
│   ├── app.js                   # Express app config, helmet, cors, rate limit
│   └── index.js                 # HTTP listener & startup database initialization
├── .env.example                 # Sanitized env template
└── package.json
```

---

## 🛡️ Security Implementations

1. **Helmet HTTP Headers**: Guard against XSS, clickjacking, MIME sniffing, and unwanted cross-origin framing.
2. **Rate Limiting**: Protects `/api/auth/*` endpoints (max 20 requests per 15 minutes per IP) to mitigate brute-force password guessing.
3. **User Scoping & Multi-Tenancy**: Every database query filters by `userId: req.user.id` to prevent cross-account data leaks.
4. **Input Sanitization**: Controllers explicitly pick permitted fields and strip client-supplied sequence numbers or IDs.
5. **Secure Connection Lifecycle**: The server listens only after the database connection is verified, with graceful shutdown handlers for `SIGTERM` and `SIGINT`.

---

## 🔢 Atomic Counter System

To prevent duplicate invoice and proforma numbers under high concurrency or race conditions, both controllers utilize a dedicated MongoDB `counters` collection:

- Counter IDs: `invoice_{userId}` and `proforma_{userId}`
- Uses native `findOneAndUpdate({ _id }, { $inc: { seq: 1 } }, { returnDocument: 'after', upsert: true })`
- Formats sequentially: `FSIN-0001`, `FSIN-0002`... / `FSPI-0001`, `FSPI-0002`...

---

## 📡 API Endpoints

### Health Check
- `GET /api/health` — Returns status and MongoDB connection state (`connected` / `disconnected`).

### Authentication (`/api/auth`)
- `POST /register` — Register a new organization account.
- `POST /login` — Authenticate and receive a JWT token.
- `GET /me` *(Protected)* — Retrieve authenticated user profile.
- `PUT /profile` *(Protected)* — Update personal profile details.
- `PUT /company-assets` *(Protected)* — Upload company logo, stamp, or digital signature data URLs.

### Invoices (`/api/invoices`) *(All Protected)*
- `GET /` — List user's invoices (sorted descending by creation date).
- `POST /` — Create an invoice (invoiceNumber assigned atomically server-side).
- `PUT /:id` — Update invoice content (invoiceNumber is immutable).
- `DELETE /:id` — Delete an invoice.

### Proformas (`/api/proformas`) *(All Protected)*
- `GET /` — List user's proforma invoices.
- `POST /` — Create a proforma (proforma number assigned atomically server-side).
- `PUT /:id` — Update proforma details and status (`Pending` / `Approved` / `Paid`).
- `DELETE /:id` — Delete a proforma.

### Clients (`/api/clients`) *(All Protected)*
- `GET /` — List customer directory.
- `POST /` — Add a new client.
- `PUT /:id` — Update client info.
- `DELETE /:id` — Delete client.

### SAC Master Codes (`/api/sac-codes`)
- `GET /` — Retrieve list of statutory Services Accounting Codes.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=5001
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/Invoice?retryWrites=true&w=majority
JWT_SECRET=your-secure-random-secret-key-at-least-32-chars
JWT_EXPIRES_IN=7d

# SMTP (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx

# Company Information
COMPANY_NAME=Futentia Solutions
COMPANY_PHONE=+91 0000000000
COMPANY_ADDRESS=Your full address
```

---

## 🚀 Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Start server in dev mode with hot reload
npm run dev

# 3. Verify health
curl http://localhost:5001/api/health
```

---

## 🌐 Production Deployment (Render / Railway / VPS)

1. **Build Command**: `npm install`
2. **Start Command**: `npm start`
3. **Environment Variables**: Configure all values from `.env` in your host's dashboard. Set `FRONTEND_URL` to your production client URL.
4. **Health Check Endpoint**: `/api/health`

