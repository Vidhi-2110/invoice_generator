# REST API Layer Documentation

**Location**: `src/api/`  
**Base URL**: Configured via `VITE_API_URL` (Defaults to `http://localhost:5001`)  
**Auth Header**: `Authorization: Bearer <token>`  

---

## 1. Overview

The `src/api/` folder houses the HTTP client layer responsible for communicating with the Node.js / Express / MongoDB backend. It automatically pulls JWT tokens from `authService` to authenticate requests and normalizes API error responses.

---

## 2. Directory Structure

```text
src/api/
├── authApi.js          # Authentication & user profile endpoints
├── invoiceApi.js       # Tax invoice CRUD endpoints
├── proformaApi.js      # Proforma estimate CRUD endpoints
├── clientApi.js        # Client directory CRUD endpoints
└── index.js            # Barrel export
```

---

## 3. Architecture & Authentication Pattern

Each module automatically calls `getAuthHeaders()`:

```javascript
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getAuthHeaders = () => {
  const token = authService.getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API request failed');
  return data;
};
```

If the token is present, the backend middleware extracts `req.user.id` and queries only documents owned by that user.

---

## 4. Endpoints Reference

### 1. Authentication (`authApi.js`)

| Function | Method | Endpoint | Request Body | Description |
|---|---|---|---|---|
| `loginApi(payload)` | `POST` | `/api/auth/login` | `{ email, password }` | Authenticates user credentials and returns `{ token, user }` |
| `registerApi(payload)` | `POST` | `/api/auth/register` | `{ name, email, password, company? }` | Registers a new account and returns `{ token, user }` |
| `getMeApi(token)` | `GET` | `/api/auth/me` | *None* | Verifies stored token and returns fresh `{ user }` |
| `updateProfileApi(payload, token)` | `PUT` | `/api/auth/profile` | `{ name?, email?, avatar?, ... }` | Updates profile details |

### 2. Invoices (`invoiceApi.js`)

| Function | Method | Endpoint | Description |
|---|---|---|---|
| `fetchInvoices()` | `GET` | `/api/invoices` | Fetches all tax invoices for the authenticated user |
| `createInvoice(invoice)` | `POST` | `/api/invoices` | Creates a new invoice document |
| `updateInvoiceApi(id, data)` | `PUT` | `/api/invoices/:id` | Updates an existing invoice by `_id` |
| `deleteInvoiceApi(id)` | `DELETE` | `/api/invoices/:id` | Deletes an invoice by `_id` |

### 3. Proforma Invoices (`proformaApi.js`)

| Function | Method | Endpoint | Description |
|---|---|---|---|
| `fetchProformas()` | `GET` | `/api/proformas` | Fetches all proforma estimates for the authenticated user |
| `createProforma(proforma)` | `POST` | `/api/proformas` | Creates a new proforma quotation document |
| `updateProformaApi(id, data)` | `PUT` | `/api/proformas/:id` | Updates an existing proforma by `_id` |
| `deleteProformaApi(id)` | `DELETE` | `/api/proformas/:id` | Deletes a proforma by `_id` |

### 4. Clients (`clientApi.js`)

| Function | Method | Endpoint | Description |
|---|---|---|---|
| `fetchClients()` | `GET` | `/api/clients` | Fetches all client profiles for the authenticated user |
| `createClient(client)` | `POST` | `/api/clients` | Creates a new client profile (auto `CLT-XXXX`) |
| `updateClientApi(id, data)` | `PUT` | `/api/clients/:id` | Updates client contact / tax details |
| `deleteClientApi(id)` | `DELETE` | `/api/clients/:id` | Deletes client profile |

---

## 5. Offline Fallback Strategy

Each frontend context (`InvoiceContext`, `ProformaContext`, `ClientContext`) handles network failures gracefully:
```javascript
try {
  const data = await fetchInvoices();
  setInvoices(data);
  saveToStorage(storageKey, data);
} catch (err) {
  console.warn('⚠️ Could not reach backend, loading from localStorage:', err.message);
  setInvoices(loadFromStorage(storageKey));
}
```

If the API server is restarted or temporarily offline, the user continues working seamlessly with cached data.
