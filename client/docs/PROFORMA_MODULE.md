# Proforma Invoice Module Documentation

**Location**: `src/modules/proforma/`  
**Routes**: 
- `/proforma-invoice` — Proforma list, create modal & convert workflow
- `/proforma-invoice/:id` — Proforma preview & print
- `/proforma-invoice/:id/edit` — Edit proforma  
**Status**: Fully integrated — MongoDB persistence + localStorage fallback + JWT auth  

---

## 1. Overview

The **Proforma Module** manages preliminary cost estimates and quotations issued to customers before work commences or final tax invoices are generated. It shares the underlying `core/documentEngine/` infrastructure with the Invoice Module, while providing independent sequencing (`FSPI-` prefix) and a specialized **Convert to Invoice** pipeline.

---

## 2. Directory Structure

```text
src/modules/proforma/
├── components/
│   ├── ProformaForm.jsx         # Adapter wrapping DocumentForm
│   ├── ProformaPreview.jsx      # Adapter wrapping DocumentPreview
│   └── ProformaTable.jsx        # Adapter wrapping DocumentTable + "Convert" button
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
| `addProforma(data)` | `Async Function` | Generates sequence number (e.g. `FSPI-001`), saves to MongoDB |
| `updateProforma(id, data)` | `Async Function` | Updates existing proforma document |
| `deleteProforma(id)` | `Async Function` | Deletes proforma document |
| `getProforma(id)` | `Function` | Retrieves proforma by ID from current state |
| `getNextProformaNumber()` | `Function` | Calculates next sequence string |
| `loadProformas()` | `Async Function` | Re-fetches from `/api/proformas` |

---

## 5. The "Convert to Invoice" Workflow

One of the central features of InvoSaaS is the 1-click conversion from a Proforma quotation to an official Tax Invoice:

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
   - Attaches `sourceProformaNumber: proforma.invoiceNumber`
   - Issues a new tax invoice sequence number (e.g. FS/26-27/005)
   - Saves into MongoDB via POST /api/invoices
         │
         ▼ Done
  Redirects user to `/invoice` with newly generated tax invoice
```

### Conversion Code in `ProformaPage.jsx`

```javascript
const handleConfirmConversion = ({ referenceNo, dueDate }) => {
  const invoiceData = {
    name: convertingProforma.name,
    email: convertingProforma.email,
    phone: convertingProforma.phone,
    address: convertingProforma.address,
    gstin: convertingProforma.gstin,
    createdDate: convertingProforma.createdDate,
    dueDate,
    referenceNo,
    rate: convertingProforma.rate,
    lineItems: convertingProforma.lineItems,
    status: 'Pending',
    sourceProformaNumber: convertingProforma.invoiceNumber,
  };
  addInvoice(invoiceData);
};
```

---

## 6. Page Workflows

### 1. `ProformaPage.jsx` (`/proforma-invoice`)
- Full table list of proforma documents.
- Search and status filters.
- Modal creation form (`showForm`).
- Convert to Invoice modal with preview and validation.
- Export to Excel via `ExportButton` (`type="proformas"`).

### 2. `ProformaDetailPage.jsx` (`/proforma-invoice/:id`)
- Printable document preview with "PROFORMA INVOICE" header badge.
- Print / Save as PDF capability.
- Quick navigation to edit or convert.

### 3. `ProformaEditPage.jsx` (`/proforma-invoice/:id/edit`)
- Pre-populated form to edit existing quotations.
- Updates synced directly to MongoDB.
