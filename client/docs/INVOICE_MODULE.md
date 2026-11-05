# Invoice Module Documentation

**Location**: `src/modules/invoice/`  
**Routes**: 
- `/invoice` — Invoice list, filtering, search, metrics, and create modal
- `/invoice/:id` — Invoice detail view & print preview
- `/invoice/:id/edit` — Invoice edit form  
**Status**: Production Ready — MongoDB persistence + Atomic Counter + Server-side sequencing + JWT Auth  

---

## 1. Overview

The **Invoice Module** manages the lifecycle of tax invoices in InvoSaaS. It provides comprehensive invoice generation, dynamic line-item SAC mapping, automated GST computation (CGST + SGST vs. IGST based on client state code), PDF print styling, status synchronization, and Excel export.

All invoice operations synchronize with the MongoDB backend API via `/api/invoices` and are strictly isolated to the authenticated user (`userId`).

---

## 2. Directory Structure

```text
src/modules/invoice/
├── components/
│   ├── InvoiceForm.jsx         # Client-filtering & proforma reference binder
│   ├── InvoicePreview.jsx      # Adapter component wrapping DocumentPreview
│   └── InvoiceTable.jsx        # Adapter component wrapping DocumentTable
├── context/
│   └── InvoiceContext.jsx      # Invoice state, MongoDB API sync & offline cache
├── pages/
│   ├── InvoiceDetailPage.jsx   # Detailed printable invoice view
│   ├── InvoiceEditPage.jsx     # Edit page for an existing invoice
│   └── InvoicePage.jsx         # Listing, filtering, search, pagination, and modal creation
├── utils/
│   ├── invoiceNumber.js        # Formatting helper
│   └── storage.js              # LocalStorage cache fallback
├── invoiceConfig.js            # Default configuration (prefixes, currency, metadata)
└── index.js                    # Barrel exports
```

---

## 3. Configuration: `invoiceConfig.js`

Configures defaults, prefix, and schema rules for the invoice engine:

```javascript
const invoiceConfig = {
  title: "Invoice",
  localStorageKey: "invoices",
  numberPrefix: "FS/26-27/",
  currency: "₹",
  companyDetails: {
    name: "Futentia Solutions Private Limited",
    address: "SWC Hub, 106, Futentia Solutions, Vasna-Bhayli Main Rd, opp. Rajpath Complex, Bhayli, Vadodara, Gujarat - 391410.",
    email: "info@futentia.com",
    phone: "+91 7990321150",
    website: "www.futentia.com",
    gstin: "24AAGCF9740H1ZI",
  },
  fields: [
    "invoiceNumber",
    "referenceNo",
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
| `addInvoice(invoiceData)` | `Async Function` | Posts to MongoDB API; sequence number (`FS/26-27/xxxx`) is generated atomically by the server |
| `updateInvoice(id, data)` | `Async Function` | Updates invoice in MongoDB and local state |
| `deleteInvoice(id)` | `Async Function` | Deletes invoice from MongoDB and local state |
| `getInvoice(id)` | `Function` | Finds an invoice by `_id` or `invoiceNumber` |
| `reload()` | `Async Function` | Re-fetches all invoices from the server |

### Atomic Server-Side Sequencing
To eliminate duplicate IDs and race conditions, invoice numbers are **not** generated on the client. 
When `POST /api/invoices` is executed, the backend increments an atomic counter (`counters` collection, key: `invoice_{userId}`) using MongoDB's `findOneAndUpdate` with `$inc: { seq: 1 }`. The resulting formatted number (e.g., `FS/26-27/0001`, `FS/26-27/0002`) is assigned authoritatively.

---

## 5. Proforma Linking & Duplicate Protection

When creating an invoice from client proformas:
1. `InvoiceForm.jsx` scans all existing invoices for:
   - `proformaRefs` (array of linked proforma numbers)
   - `referenceNo` (comma-separated reference list)
   - `sourceProformaNumber` (single reference from 1-click conversion)
2. In `DocumentForm.jsx`, proformas that are:
   - Status: `Approved` or `Paid`, OR
   - Already linked to an existing invoice
   are separated into `invoicedProformas`.
3. In the UI:
   - **Available Proformas**: Displayed as selectable cards with check boxes.
   - **Invoiced Proformas**: Collapsed under an accordion, rendered in a muted gray container with a lock icon (`FiLock`), tooltip explanation, and `pointer-events-none` so they cannot be selected again.

---

## 6. Invoice Data Schema

```typescript
interface Invoice {
  _id: string;               // MongoDB document ID
  id?: string;               // Normalized ID
  userId: string;            // Owner user ID (multi-tenancy)
  invoiceNumber: string;     // e.g. "FS/26-27/0001" (server-generated)
  referenceNo?: string;      // Comma-separated proforma numbers or PO numbers
  proformaRefs?: string[];   // Array of referenced proforma numbers
  sourceProformaNumber?: string; // Direct source proforma if converted
  selectedClientId?: string; // Client reference ID
  clientId?: string;         // e.g. "CLT0001"
  name: string;              // Client business name
  email: string;             // Client email address
  phone: string;             // Client phone number
  address: string;           // Client billing address
  gstin?: string;            // Client GSTIN
  createdDate: string;       // YYYY-MM-DD
  dueDate: string;           // YYYY-MM-DD
  lineItems: Array<{
    sacId?: string;          // _id of the sac_codes master record
    sacCode?: string;        // SAC code (e.g. "998314")
    sacDescription?: string; // Master description
    description: string;     // Line item description
    qty: string | number;    // Quantity
    rate: string | number;   // Unit rate
    amount?: number;         // qty * rate
  }>;
  adjustment?: number;       // Discount / Adjustment amount
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  createdAt: string;         // ISO timestamp
  updatedAt: string;         // ISO timestamp
}
```

---

## 7. Page Workflows

### 1. `InvoicePage.jsx` (`/invoice`)
- Shows summary KPI cards: Total Revenue, Paid Invoices, Pending Invoices, and Overdue count.
- Search by customer name, email, or invoice number.
- Filter by fiscal year and created date.
- Modal invoice creation supporting client auto-fill and proforma multi-selection.
- Export to Excel via `ExportButton`.

### 2. `InvoiceDetailPage.jsx` (`/invoice/:id`)
- Rendered using `DocumentPreview`.
- Displays company header, client billing details, line items table, statutory SAC breakdown, GST summary (CGST/SGST or IGST based on state code), amount in words, bank details, and digital signature.
- Includes **Print / Save as PDF** styling via `@media print`.
- "Send Email" action dispatches formatted invoice directly to customer's email via backend SMTP.

### 3. `InvoiceEditPage.jsx` (`/invoice/:id/edit`)
- Fetches invoice by route parameter `:id`.
- Pre-populates `DocumentForm`. Note: The invoice's own `invoiceNumber` remains immutable.
- Saves updates directly to MongoDB.
