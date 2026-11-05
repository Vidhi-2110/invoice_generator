# Proforma Invoice Module Documentation

**Location**: `src/modules/proforma/`  
**Routes**: 
- `/proforma-invoice` — Proforma list, creation modal, and convert workflow
- `/proforma-invoice/:id` — Proforma preview & print
- `/proforma-invoice/:id/edit` — Edit proforma  
**Status**: Production Ready — MongoDB persistence + Atomic Counter + Server-side sequencing + Auto-Locking  

---

## 1. Overview

The **Proforma Module** manages preliminary cost estimates and quotations issued to customers before work commences or final tax invoices are generated. It shares the underlying `core/documentEngine/` infrastructure with the Invoice Module while maintaining independent sequential numbering (`FSPI-` prefix) and a specialized **Convert to Invoice** pipeline.

---

## 2. Directory Structure

```text
src/modules/proforma/
├── components/
│   ├── ProformaForm.jsx         # Adapter wrapping DocumentForm
│   ├── ProformaPreview.jsx      # Adapter wrapping DocumentPreview
│   └── ProformaTable.jsx        # Adapter wrapping DocumentTable + "Convert" button & sync
├── context/
│   └── ProformaContext.jsx      # Proforma state, MongoDB API sync & offline cache
├── pages/
│   ├── ProformaDetailPage.jsx   # Dedicated view for previewing & printing proformas
│   ├── ProformaEditPage.jsx     # Form for editing an existing proforma
│   └── ProformaPage.jsx         # Listing, convert-to-invoice modal & creation form
├── utils/
│   ├── invoiceNumber.js         # Proforma sequencing helper
│   └── storage.js               # Offline cache helpers
├── proformaConfig.js            # Configuration (prefix "FSPI-", currency, fields)
└── index.js                     # Barrel exports
```

---

## 3. Configuration: `proformaConfig.js`

```javascript
const proformaConfig = {
  title: "Proforma Invoice",
  localStorageKey: "proforma_invoices",
  numberPrefix: "FSPI-",
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

export default proformaConfig;
```

---

## 4. State Management: `ProformaContext`

Provided by `<ProformaProvider>` in `App.jsx`.

### Context Value (`useProforma()`)

| Property / Method | Type | Description |
|---|---|---|
| `proformaInvoices` | `Array<Proforma>` | All proforma invoices for the logged-in user |
| `isLoading` | `boolean` | `true` while syncing with MongoDB API |
| `error` | `string \| null` | Error message if network request fails |
| `addProforma(data)` | `Async Function` | Generates sequence number (`FSPI-xxxx`) server-side and saves to MongoDB |
| `updateProforma(id, data)` | `Async Function` | Updates existing proforma document (invoiceNumber is protected) |
| `deleteProforma(id)` | `Async Function` | Deletes proforma document |
| `getProforma(id)` | `Function` | Retrieves proforma by ID from current state |
| `reload()` | `Async Function` | Re-fetches from `/api/proformas` |

### Atomic Counter Sequencing
To avoid client-side race conditions, proforma numbering is managed by the backend server via an atomic counter in MongoDB:
`counters` collection, key: `proforma_{userId}`.
Every new proforma receives a guaranteed unique sequential number (`FSPI-0001`, `FSPI-0002`, etc.).

---

## 5. The "Convert to Invoice" Workflow

One of the central features is the 1-click conversion from a Proforma quotation to an official Tax Invoice:

```text
[Proforma List / Detail]
         │
         ▼ Click "Convert to Invoice"
  [ConvertModal]
   - Previews client name, GSTIN, line items, and totals
   - Allows setting reference number (e.g. PO-1234)
   - Allows choosing a new Due Date for the tax invoice
         │
         ▼ Click "Save as Invoice"
  [InvoiceContext.addInvoice()]
   - Attaches `proformaRefs: [proforma.invoiceNumber]`
   - Attaches `sourceProformaNumber: proforma.invoiceNumber`
   - Issues a new tax invoice sequence number (e.g. FS/26-27/0005)
   - Saves into MongoDB via POST /api/invoices
         │
         ▼ Done
  - Automatically updates proforma status to 'Approved'
  - Future invoice drafting recognizes this proforma as already-invoiced and locks it
  - Redirects user to `/invoice`
```

---

## 6. Proforma Data Schema

```typescript
interface Proforma {
  _id: string;               // MongoDB document ID
  id?: string;               // Normalized ID
  userId: string;            // Multi-tenancy user ID
  invoiceNumber: string;     // e.g. "FSPI-0001" (server-assigned)
  selectedClientId?: string; // Client reference ID
  clientId?: string;         // e.g. "CLT0001"
  name: string;              // Client name
  email: string;             // Client email
  phone: string;             // Client phone
  address: string;           // Client address
  gstin?: string;            // Client GSTIN
  createdDate: string;       // YYYY-MM-DD
  dueDate: string;           // Validity / expiry date
  lineItems: Array<{
    sacId?: string;
    sacCode?: string;
    sacDescription?: string;
    description: string;
    qty: string | number;
    rate: string | number;
    amount?: number;
  }>;
  adjustment?: number;
  subtotal?: number;
  taxAmount?: number;
  total?: number;
  status: 'Pending' | 'Approved' | 'Paid';
  createdAt: string;
  updatedAt: string;
}
```

---

## 7. Status Synchronization

In `ProformaTable.jsx`, status transitions are bidirectional:
- Marking a Proforma as **"Approved"** or converting it automatically marks any linked formal invoice as **"Paid"** or sets the proforma to non-selectable in the invoice builder.
- Marking a Proforma as **"Pending"** frees up the estimate if the linked invoice is cancelled or deleted.
