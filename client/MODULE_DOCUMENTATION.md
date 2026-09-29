# InvoSaaS — Client Application Documentation

> **Last Updated**: 2026-09-29  
> **Version**: Production (MongoDB + JWT Auth fully integrated)  
> **Build Tool**: Vite + React 19

---

## Overview

**InvoSaaS** is a full-stack, multi-user SaaS invoicing platform built with React 19 (Vite) on the frontend and a Node.js / Express / MongoDB backend. Each user's data is completely isolated by JWT authentication — all invoices, proformas, and clients are stored in MongoDB and scoped to the authenticated user.

The architecture follows a **modular, plug-and-play design**: each feature area (`invoice`, `proforma`, `dashboard`, `client`, `auth`, `settings`) lives in its own folder under `src/modules/`, and a shared `src/core/` layer provides document rendering, UI primitives, utilities, and theming.

---

## Documentation Index

Per-module documentation files live in the `docs/` folder next to this file:

| File | Covers |
|------|--------|
| **This file** | Architecture overview, folder tree, provider hierarchy, route map |
| [`docs/AUTH_MODULE.md`](./docs/AUTH_MODULE.md) | Auth module — login, register, JWT, ProtectedRoute |
| [`docs/INVOICE_MODULE.md`](./docs/INVOICE_MODULE.md) | Invoice module — CRUD, config, exports, data model |
| [`docs/PROFORMA_MODULE.md`](./docs/PROFORMA_MODULE.md) | Proforma module — CRUD, config, exports, convert-to-invoice |
| [`docs/DASHBOARD_MODULE.md`](./docs/DASHBOARD_MODULE.md) | Dashboard module — analytics, stat cards, export |
| [`docs/CLIENT_MODULE.md`](./docs/CLIENT_MODULE.md) | Client management — contact directory, auto-fill |
| [`docs/SETTINGS_MODULE.md`](./docs/SETTINGS_MODULE.md) | Settings page — branding, bank details, e-sign, color theme |
| [`docs/CORE_ENGINE.md`](./docs/CORE_ENGINE.md) | Shared core — DocumentEngine, UI components, utils, theme |
| [`docs/API_LAYER.md`](./docs/API_LAYER.md) | REST API layer — all HTTP calls and JWT attachment |
| [`docs/LAYOUT.md`](./docs/LAYOUT.md) | Layout system — Sidebar, Navbar, CompanySettingsContext |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build Tool | Vite |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS v4 + Vanilla CSS (hybrid) |
| Icons | React Icons v5 (Feather `fi`) |
| State Management | React Context API + `localStorage` (offline fallback) |
| Backend API | Node.js / Express (default port `5001`) |
| Database | MongoDB (per-user data isolation) |
| Authentication | JWT Bearer tokens (stored in `localStorage`) |
| Export | CSV/Excel via browser Blob download |

---

## Complete Folder Structure

```text
client/
├── index.html
├── vite.config.js
├── package.json
├── .env                            # VITE_API_URL=http://localhost:5001
├── MODULE_DOCUMENTATION.md         # This file
├── docs/                           # Per-module documentation
│   ├── AUTH_MODULE.md
│   ├── INVOICE_MODULE.md
│   ├── PROFORMA_MODULE.md
│   ├── DASHBOARD_MODULE.md
│   ├── CLIENT_MODULE.md
│   ├── SETTINGS_MODULE.md
│   ├── CORE_ENGINE.md
│   ├── API_LAYER.md
│   └── LAYOUT.md
└── src/
    ├── main.jsx                    # ReactDOM.createRoot entry
    ├── App.jsx                     # Provider hierarchy root
    ├── index.css                   # Global CSS + Tailwind directives
    │
    ├── api/                        # REST API call functions
    │   ├── authApi.js
    │   ├── clientApi.js
    │   ├── invoiceApi.js
    │   ├── proformaApi.js
    │   └── index.js
    │
    ├── routes/
    │   └── AppRoutes.jsx           # All client-side routes
    │
    ├── components/
    │   ├── ExportButton.jsx        # Shared CSV/Excel export button
    │   └── Layout/
    │       ├── Layout.jsx          # App shell with Sidebar + Navbar
    │       ├── Navbar.jsx
    │       ├── Sidebar.jsx
    │       ├── navConfig.js        # Centralized nav link config
    │       ├── CompanySettingsContext.jsx
    │       └── CompanySettingsModal.jsx
    │
    ├── core/                       # Shared reusable engine layer
    │   ├── documentEngine/         # Generic form, preview, table
    │   │   ├── DocumentForm.jsx
    │   │   ├── DocumentPreview.jsx
    │   │   ├── DocumentTable.jsx
    │   │   └── index.js
    │   ├── components/             # Shared UI primitives
    │   │   ├── Button.jsx
    │   │   ├── Card.jsx
    │   │   ├── InputField.jsx
    │   │   ├── TextAreaField.jsx
    │   │   ├── MultiSelectDropdown.jsx
    │   │   ├── StatusBadge.jsx
    │   │   └── index.js
    │   ├── utils/                  # Business logic utilities
    │   │   ├── taxEngine.js
    │   │   ├── currencyFormatter.js
    │   │   ├── dateUtils.js
    │   │   ├── sequenceGenerator.js
    │   │   ├── numberToWords.js
    │   │   ├── excelExporter.js
    │   │   └── index.js
    │   ├── storage/
    │   │   ├── localStorageAdapter.js
    │   │   └── index.js
    │   └── theme/
    │       └── palettes.js         # CSS variable color palette system
    │
    └── modules/
        ├── auth/
        │   ├── components/
        │   │   ├── AuthCard.jsx
        │   │   ├── ImageCropper.jsx
        │   │   ├── LoginForm.jsx
        │   │   ├── ProtectedRoute.jsx
        │   │   ├── RegisterForm.jsx
        │   │   └── UserDropdown.jsx
        │   ├── context/
        │   │   └── AuthContext.jsx
        │   ├── pages/
        │   │   ├── AuthPage.jsx
        │   │   ├── LoginPage.jsx
        │   │   └── RegisterPage.jsx
        │   ├── services/
        │   │   └── authService.js
        │   └── index.js
        │
        ├── invoice/
        │   ├── components/
        │   │   ├── InvoiceForm.jsx      # Thin wrapper → DocumentForm
        │   │   ├── InvoicePreview.jsx   # Thin wrapper → DocumentPreview
        │   │   └── InvoiceTable.jsx     # Thin wrapper → DocumentTable
        │   ├── context/
        │   │   └── InvoiceContext.jsx   # MongoDB + localStorage fallback
        │   ├── pages/
        │   │   ├── InvoiceDetailPage.jsx
        │   │   ├── InvoiceEditPage.jsx
        │   │   └── InvoicePage.jsx
        │   ├── utils/
        │   │   ├── invoiceNumber.js
        │   │   └── storage.js
        │   ├── invoiceConfig.js
        │   └── index.js
        │
        ├── proforma/
        │   ├── components/
        │   │   ├── ProformaForm.jsx     # Thin wrapper → DocumentForm
        │   │   ├── ProformaPreview.jsx  # Thin wrapper → DocumentPreview
        │   │   └── ProformaTable.jsx    # Thin wrapper → DocumentTable
        │   ├── context/
        │   │   └── ProformaContext.jsx  # MongoDB + localStorage fallback
        │   ├── pages/
        │   │   ├── ProformaDetailPage.jsx
        │   │   ├── ProformaEditPage.jsx
        │   │   └── ProformaPage.jsx     # Convert-to-Invoice feature lives here
        │   ├── utils/
        │   │   ├── invoiceNumber.js
        │   │   └── storage.js
        │   ├── proformaConfig.js
        │   └── index.js
        │
        ├── dashboard/
        │   ├── pages/
        │   │   └── DashboardPage.jsx   # Full analytics view
        │   ├── dashboardConfig.js
        │   └── index.js
        │
        ├── client/
        │   ├── components/
        │   │   ├── ClientFormModal.jsx
        │   │   └── ClientTable.jsx
        │   ├── context/
        │   │   └── ClientContext.jsx
        │   ├── pages/
        │   │   └── ClientPage.jsx
        │   ├── clientConfig.js
        │   └── index.js
        │
        └── settings/
            └── SettingsPage.jsx        # Company profile, bank, e-sign, theme
```

---

## Provider Hierarchy (`App.jsx`)

Providers are nested in this exact order. Inner providers can depend on outer ones:

```jsx
<Router>
  <AuthProvider>                    {/* JWT session, user object */}
    <CompanySettingsProvider>       {/* Branding, color theme */}
      <ClientProvider>              {/* Client/contact directory */}
        <InvoiceProvider>           {/* Invoice CRUD + MongoDB sync */}
          <ProformaProvider>        {/* Proforma CRUD + MongoDB sync */}
            <AppRoutes />
          </ProformaProvider>
        </InvoiceProvider>
      </ClientProvider>
    </CompanySettingsProvider>
  </AuthProvider>
</Router>
```

---

## Route Map

| Path | Component | Auth Required |
|------|-----------|:---:|
| `/login` | `LoginPage` | ❌ |
| `/register` | `RegisterPage` | ❌ |
| `/dashboard` | `DashboardPage` (via `DashboardRoute`) | ✅ |
| `/invoice` | `InvoicePage` | ✅ |
| `/invoice/:id` | `InvoiceDetailPage` | ✅ |
| `/invoice/:id/edit` | `InvoiceEditPage` | ✅ |
| `/proforma-invoice` | `ProformaPage` | ✅ |
| `/proforma-invoice/:id` | `ProformaDetailPage` | ✅ |
| `/proforma-invoice/:id/edit` | `ProformaEditPage` | ✅ |
| `/clients` | `ClientPage` | ✅ |
| `/settings` | `SettingsPage` | ✅ |
| `/` | Redirect → `/dashboard` | ✅ |
| `*` | Redirect → `/dashboard` | ✅ |

All protected routes are wrapped by `<ProtectedRoute>` inside `<Layout>`.

---

## Data & Storage Strategy

| Data Type | Primary Store | Fallback / Cache |
|-----------|--------------|-----------------|
| Invoices | MongoDB (per-user, user-scoped) | `localStorage` key: `invoices_{userId}` |
| Proforma Invoices | MongoDB (per-user, user-scoped) | `localStorage` key: `proforma_invoices_{userId}` |
| Clients | MongoDB (per-user, user-scoped) | `localStorage` (offline) |
| JWT Token | `localStorage` key: `invosaas_auth_token` | — |
| Company Settings | `localStorage` key: `invosaas_company_settings` | — |

Each context loads from the API on mount. If the API is unreachable, it silently falls back to the cached `localStorage` copy.

---

## Environment Variables

Create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:5001
```

The default is `http://localhost:5001` if not set.

---

## Development

```bash
# Install dependencies
npm install

# Start development server (Vite HMR)
npm run dev

# Build for production
npm run build
```
