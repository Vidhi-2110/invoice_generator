# Invoice Module Documentation

**Location**: `src/modules/invoice/`  
**Routes**: 
- `/invoice` — Invoice list & quick create
- `/invoice/:id` — Invoice detail view & print preview
- `/invoice/:id/edit` — Invoice edit form  
**Status**: Fully integrated — MongoDB persistence + localStorage fallback + JWT auth  

---

## 1. Overview

The **Invoice Module** manages the lifecycle of tax invoices in InvoSaaS. It provides comprehensive invoice generation, line-item calculations, automated GST computation, PDF print styling, status tracking, and export features.

All invoice operations synchronize with the MongoDB backend API via `/api/invoices` and are isolated to the authenticated user.

---

## 2. Directory Structure

```text
src/modules/invoice/
├── components/
│   ├── InvoiceForm.jsx         # Adapter component wrapping DocumentForm
│   ├── InvoicePreview.jsx      # Adapter component wrapping DocumentPreview
│   └── InvoiceTable.jsx        # Adapter component wrapping DocumentTable
├── context/
│   └── InvoiceContext.jsx      # Invoice state, MongoDB API sync & offline cache
├── pages/
│   ├── InvoiceDetailPage.jsx   # Detailed printable invoice view
│   ├── InvoiceEditPage.jsx     # Edit page for an existing invoice
│   └── InvoicePage.jsx         # Listing, filtering, search, pagination, and modal creation
├── utils/
│   ├── invoiceNumber.js        # Invoice number formatting utilities
│   └── storage.js              # LocalStorage sync helpers
├── invoiceConfig.js            # Default configuration (prefixes, currency, default metadata)
└── index.js                    # Barrel exports
```

---

## 3. Configuration: `invoiceConfig.js`

Configures defaults and naming for the invoice engine:

```javascript
const invoiceConfig = {
  title: "Invoice",
  localStorageKey: "invoices",
  numberPrefix: "FS/26-27/",
  currency: "₹",
  companyDetails: {
    name: "Futentia Solutions Private Limited",
    address: "03, Pratham Meadows, Nr. Navarachana Int. School, Bhayli, Vadodara, Gujarat - 391410.",
    email: "info@futentia.com",
    phone: "+91 8866778903",
    website: "www.futentia.com",
    gstin: "24AAGCF9740H1ZI",
  },
  fields: [
    "invoiceNumber",
    "name",
    "address",
    "phone",
    "gstin",
    "createdDate",
    "dueDate",
    "email",
    "description",
    "rate"
  ]
};

export default invoiceConfig;
```

---

## 4. State Management: `InvoiceContext`

Provided by `<InvoiceProvider>` at the root of the app.

### Context Value (`useInvoices()`)

| Property / Method | Type | Description |
|---|---|---|
| `invoices` | `Array<Invoice>` | List of all invoices for the authenticated user |
| `isLoading` | `boolean` | `true` during API sync |
| `error` | `string \| null` | Error string if API request fails |
| `addInvoice(invoiceData)` | `Async Function` | Generates next sequence number, saves to MongoDB, returns new record |
| `updateInvoice(id, data)` | `Async Function` | Updates invoice in MongoDB and local state |
| `deleteInvoice(id)` | `Async Function` | Deletes invoice from MongoDB and local state |
| `getInvoice(id)` | `Function` | Finds an invoice by `_id` or `id` |
| `getNextInvoiceNumber()` | `Function` | Calculates the next sequential invoice number |
| `loadInvoices()` | `Async Function` | Re-fetches all invoices from the server |

### Auto-Sequencing
Invoice numbers are automatically formatted as `<prefix><3-digit-padded-number>` (e.g. `FS/26-27/001`, `FS/26-27/002`). The sequence increments based on the highest existing number in the user's invoice list.

---

## 5. Invoice Data Schema

```typescript
interface Invoice {
  _id: string;               // MongoDB document ID
  id?: string;               // Fallback ID for offline mode
  userId: string;            // Owner user ID
  invoiceNumber: string;     // e.g. "FS/26-27/001"
  name: string;              // Client business name
  email: string;             // Client email address
  phone: string;             // Client phone number
  address: string;           // Client billing address
  gstin?: string;            // Client GST Identification Number
  createdDate: string;       // YYYY-MM-DD
  dueDate: string;           // YYYY-MM-DD
  description?: string;      // Summary description of work
  rate?: number;             // Legacy single-item rate
  lineItems?: Array<{        // Itemized breakdown
    description: string;
    rate: number;
    quantity?: number;
  }>;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  createdAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
}
```

---

## 6. Page Workflows

### 1. `InvoicePage.jsx` (`/invoice`)
- Displays statistics summary banner.
- Features `DocumentTable` with client search, date range filter, and status filter.
- Top actions:
  - **Create Invoice**: Opens a slide-over/modal with `InvoiceForm`.
  - **Export**: Generates Excel / CSV export of filtered records via `ExportButton`.
- Row actions: View (`/invoice/:id`), Edit (`/invoice/:id/edit`), Delete (with confirmation).

### 2. `InvoiceDetailPage.jsx` (`/invoice/:id`)
- Rendered using `DocumentPreview`.
- Displays company header, client billing details, line items table, GST summary (CGST/SGST or IGST), amount in words, bank details, and digital signature.
- Action Bar:
  - **Print / Save as PDF**: Uses `@media print` CSS styling to produce a clean letterhead.
  - **Edit**: Navigates to `/invoice/:id/edit`.
  - **Back**: Returns to `/invoice`.

### 3. `InvoiceEditPage.jsx` (`/invoice/:id/edit`)
- Fetches invoice by route parameter `:id`.
- Pre-populates `DocumentForm`.
- On submit, calls `updateInvoice(id, formData)` and navigates back to detail or list.

---

## 7. Reusable Component Adapters

The components in `src/modules/invoice/components/` are lightweight adapters connecting `invoiceConfig` and `InvoiceContext` to the generic `src/core/documentEngine/`:

- **`InvoiceForm`**: Supplies `invoiceConfig.fields` to `DocumentForm`.
- **`InvoicePreview`**: Supplies company branding and layout options to `DocumentPreview`.
- **`InvoiceTable`**: Supplies table columns and actions to `DocumentTable`.
