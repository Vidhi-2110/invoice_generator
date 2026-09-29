# Client Management Module Documentation

**Location**: `src/modules/client/`  
**Route**: `/clients`  
**Status**: Fully integrated — MongoDB persistence + localStorage fallback + JWT auth  

---

## 1. Overview

The **Client Module** is a centralized customer relationship and billing directory for InvoSaaS. It allows users to store client contact records, tax credentials (GSTIN), and billing addresses. These client profiles can be auto-completed directly into Invoices and Proformas to eliminate repetitive typing.

Each client is assigned a unique, auto-incrementing ID prefixed with `CLT-` (e.g., `CLT-0001`).

---

## 2. Directory Structure

```text
src/modules/client/
├── components/
│   ├── ClientFormModal.jsx     # Modal dialog for creating and editing clients
│   └── ClientTable.jsx         # Responsive table with search, status badges & actions
├── context/
│   └── ClientContext.jsx       # State management, MongoDB sync & offline caching
├── pages/
│   └── ClientPage.jsx          # Top-level view with stat cards, action buttons, table & modal
├── clientConfig.js             # Configuration (prefix 'CLT', route prefix, title)
└── index.js                    # Barrel export
```

---

## 3. Configuration: `clientConfig.js`

```javascript
const defaultClientConfig = {
  title: 'Client',
  numberPrefix: 'CLT',
  localStorageKey: 'invoice_app_clients',
  routePrefix: '/clients',
};

export default defaultClientConfig;
```

---

## 4. State Management: `ClientContext`

Provided by `<ClientProvider>` in `App.jsx`.

### Context Value (`useClients()`)

| Property / Method | Type | Description |
|---|---|---|
| `clients` | `Array<Client>` | List of all clients belonging to the authenticated user |
| `isLoading` | `boolean` | `true` while fetching clients from the backend |
| `error` | `string \| null` | Error string if MongoDB API fails |
| `addClient(clientData)` | `Async Function` | Auto-assigns next `CLT-XXXX` ID and saves to MongoDB |
| `updateClient(id, data)` | `Async Function` | Updates existing client profile in MongoDB and local state |
| `deleteClient(id)` | `Async Function` | Deletes client from MongoDB and local state |
| `getClient(id)` | `Function` | Retrieves client by ID |
| `loadClients()` | `Async Function` | Forces re-sync from `/api/clients` |

---

## 5. Client Data Schema

```typescript
interface Client {
  _id: string;               // MongoDB document ID
  id?: string;               // Normalized identifier
  userId: string;            // Authenticated user ID owner
  clientId: string;          // Auto-generated sequence ID (e.g. "CLT-0001")
  name: string;              // Client Company or Individual Name
  email: string;             // Primary billing email
  phone: string;             // Contact phone number
  address: string;           // Billing address
  gstin?: string;            // 15-character GSTIN (optional)
  status: 'Active' | 'Inactive';
  createdAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
}
```

---

## 6. Page & Component Workflows

### `ClientPage.jsx` (`/clients`)
- **Metric Cards**:
  - *Total Clients*: Total count of records.
  - *Active Accounts*: Clients available for document selection.
  - *Inactive Accounts*: Archived or dormant clients.
- **Header Actions**: "Add New Client" button which opens `ClientFormModal`.
- **ClientTable**:
  - Search filter (matches name, email, phone, or GSTIN).
  - Quick action buttons: Edit (`handleOpenEdit`), Delete with confirmation.
- **ClientFormModal**:
  - Reusable for both create and edit modes.
  - Form validation for required fields (`name`, `email`, `phone`, `address`).
  - Dropdown for account status (`Active` / `Inactive`).

---

## 7. Auto-Fill Integration with Document Forms

When a user creates an Invoice or Proforma in `DocumentForm`, the client dropdown reads from `ClientContext`. Selecting a client auto-populates:
- Client Name
- Billing Address
- Phone Number
- Email
- GSTIN

This ensures consistent tax records and prevents invoicing errors.
