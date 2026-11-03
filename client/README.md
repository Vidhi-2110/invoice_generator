# InvoSaaS — Client Application

> Frontend web application for the **Futentia Invoice & Proforma Management System**, built with **React 19**, **Vite**, **Tailwind CSS v4**, and **React Router DOM v7**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Module Architecture](#module-architecture)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Documentation Index](#documentation-index)
- [Production Deployment](#production-deployment)

---

## 🎯 Overview

The client is a single-page SaaS application providing multi-user billing, quotation generation, contact management, executive analytics, and settings customization.

### Key Capabilities
- **Invoice Generation (`/invoice`)**: Create, view, edit, print, and export GST-compliant invoices.
- **Proforma Estimates (`/proforma-invoice`)**: Draft client estimates, track approval status, and convert proformas directly to formal tax invoices with automatic item mapping and duplicate protection.
- **Client Directory (`/clients`)**: Manage customer contact information, billing addresses, and GSTIN numbers with instant auto-fill when drafting invoices.
- **Analytics Dashboard (`/dashboard`)**: Track total revenue, paid vs. pending receivables, monthly breakdown, and active proforma pipeline.
- **Company Branding & Settings (`/settings`)**: Customize company profile, address, bank details, authorized digital signature, company stamp, and primary theme color.
- **Security & Multi-Tenancy**: Scoped per user via JWT authentication and isolated MongoDB collections with automatic `localStorage` offline caching fallback.

---

## ⚡ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern UI framework with hooks and functional components |
| **Vite v8** | Next-generation build tool with instant HMR and Rollup bundling |
| **Tailwind CSS v4** | Modern utility-first CSS engine |
| **React Router DOM v7** | Client-side routing, protected routes, and redirects |
| **React Icons v5** | Feather (`fi`) and system icon sets |
| **Canvas-Confetti** | Visual celebration triggers upon proforma conversion / payment |

---

## 🏗️ Module Architecture

The codebase follows domain-driven, decoupled modules:

```text
client/src/
├── api/                  # Centralized REST API service calls (JWT-attached)
├── components/           # Shared presentation components (Layout, Navbar, Sidebar)
├── core/                 # Shared generic document engine
│   ├── components/       # Primitives (Button, InputField, Modal, Dropdown)
│   ├── documentEngine/   # DocumentForm, DocumentPreview, DocumentTable
│   ├── theme/            # Theme context & accent color variables
│   └── utils/            # Calculations, sequence generators, Excel export
├── modules/              # Self-contained domain modules
│   ├── auth/             # Login, Register, AuthContext, ProtectedRoute
│   ├── client/           # Client directory, modal form, context
│   ├── dashboard/        # Metrics cards, charts, summaries
│   ├── invoice/          # Invoice context, form, preview, table, config
│   ├── proforma/         # Proforma context, form, preview, table, config
│   └── settings/         # Company branding, bank details, e-sign
└── routes/               # AppRoutes definition
```

---

## ⚙️ Environment Variables

Create `.env` in the `client/` root for local development, and `.env.production` for production builds:

```env
# URL of your Express API server
VITE_API_URL=http://localhost:5001
```

> **Note**: In local development, `vite.config.js` includes a proxy rule forwarding `/api/*` to `http://localhost:5001`, so CORS is bypassed automatically.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0 or higher)
- **npm** (v9.0 or higher)

### Setup & Run
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Open browser at:
http://localhost:5173
```

---

## 📜 Available Scripts

- `npm run dev`: Starts Vite dev server with Hot Module Replacement (HMR).
- `npm run build`: Bundles production assets into `dist/` with chunk optimization and minification.
- `npm run preview`: Previews the production build locally at `http://localhost:4173`.
- `npm run lint`: Runs ESLint to inspect code for errors and conventions.

---

## 📚 Documentation Index

Detailed architectural documentation for each module is located in `client/docs/`:

- [Module Architecture Master Overview](MODULE_DOCUMENTATION.md)
- [Auth Module](docs/AUTH_MODULE.md)
- [Invoice Module](docs/INVOICE_MODULE.md)
- [Proforma Module](docs/PROFORMA_MODULE.md)
- [Dashboard Module](docs/DASHBOARD_MODULE.md)
- [Client Module](docs/CLIENT_MODULE.md)
- [Settings Module](docs/SETTINGS_MODULE.md)
- [Core Document Engine](docs/CORE_ENGINE.md)
- [API Layer](docs/API_LAYER.md)
- [Layout System](docs/LAYOUT.md)

---

## 🌐 Production Deployment

### Recommended: Vercel / Netlify
1. Connect your Git repository.
2. Set **Root Directory** to `client`.
3. Set **Build Command** to `npm run build`.
4. Set **Output Directory** to `dist`.
5. Add Environment Variable:
   - `VITE_API_URL`: Your live backend URL (e.g. `https://invoice-server-xxx.onrender.com`).
6. Deploy. For client-side routing on Vercel/Netlify, create `client/vercel.json` or `client/public/_redirects`:
   ```text
   /*    /index.html   200
   ```
