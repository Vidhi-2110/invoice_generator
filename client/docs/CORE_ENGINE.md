# Core Engine Documentation

**Location**: `src/core/`  
**Purpose**: Shared UI primitives, document rendering, theming, and calculation engines  

---

## 1. Overview

The `src/core/` directory contains the foundational, module-agnostic building blocks of InvoSaaS. Neither the `invoice` nor `proforma` modules implement their own layout algorithms, printable views, or calculations from scratch; instead, they instantiate components and utilities from `core/`.

---

## 2. Directory Structure

```text
src/core/
├── documentEngine/             # Core document processing & layout components
│   ├── DocumentForm.jsx        # Configurable document editor form with line items
│   ├── DocumentPreview.jsx     # Production printable letterhead template
│   ├── DocumentTable.jsx       # Generic paginated, searchable data table
│   └── index.js
│
├── components/                 # Atom and molecule UI primitives
│   ├── Button.jsx              # Button component with variants & loading state
│   ├── Card.jsx                # Container card with borders and elevation
│   ├── InputField.jsx          # Form input with floating labels & validation
│   ├── TextAreaField.jsx       # Multi-line text field
│   ├── MultiSelectDropdown.jsx # Checkbox dropdown with selected item chips
│   ├── StatusBadge.jsx         # Status badge (Paid, Pending, Approved, etc.)
│   └── index.js
│
├── utils/                      # Pure business logic functions
│   ├── taxEngine.js            # GST calculation (CGST, SGST, IGST)
│   ├── currencyFormatter.js    # Currency symbol & decimal formatting (INR, USD)
│   ├── dateUtils.js            # Date formatting and overdue calculations
│   ├── sequenceGenerator.js    # Padded incremental document ID generator
│   ├── numberToWords.js        # Indian numbering system amount-to-words converter
│   ├── excelExporter.js        # Client-side workbook / CSV exporter
│   └── index.js
│
├── storage/                    # Local storage wrapper
│   ├── localStorageAdapter.js  # Safe JSON get/set operations
│   └── index.js
│
└── theme/                      # Dynamic color theming
    └── palettes.js             # CSS variable palette definitions
```

---

## 3. Document Engine (`src/core/documentEngine/`)

### `DocumentForm.jsx`
Configurable editor for Invoices and Proformas:
- Dynamically displays fields according to `config.fields`.
- **Client Auto-Fill**: Integrates with `useClients()` to populate addresses, GSTIN, phone, and email in one click.
- **Dynamic Line Items**: Allows adding, removing, and re-ordering line items with description, quantity, and rate.
- **Real-Time Tax Preview**: Calculates subtotal, GST (18%), and grand total as the user types.

### `DocumentPreview.jsx`
High-fidelity, printable document viewer designed to match strict corporate letterhead standards:
- **Print Optimization**: Uses `@media print` rules to hide navigation, action bars, and buttons when printing or saving as PDF.
- **GST Tax Breakdown**: Separates tax into CGST (9%) + SGST (9%) or IGST (18%).
- **Amount in Words**: Converts the grand total into spoken words (e.g. *"Rupees Twelve Thousand Five Hundred Only"*).
- **Company Branding & Seal**: Displays the company logo, bank transfer details, digital e-signature, and circular stamp configured in Settings.

### `DocumentTable.jsx`
Searchable, filterable, and paginated data table:
- Search by document number, client name, or email.
- Date range filtering and status dropdowns.
- Row action menus: View, Edit, Convert, and Delete.

---

## 4. Business Logic Utilities (`src/core/utils/`)

### 1. `taxEngine.js`
Calculates tax amounts according to Indian GST rules:
```javascript
import { calculateTax } from '../core/utils';

// Returns { subtotal, cgst, sgst, igst, totalTax, grandTotal }
const taxSummary = calculateTax(lineItems, { taxRate: 18, isInterState: false });
```

### 2. `numberToWords.js`
Converts currency amounts into legal financial words using the Indian numbering format (Lakhs and Crores):
```javascript
import { convertNumberToWords } from '../core/utils';

convertNumberToWords(125000); 
// => "One Lakh Twenty-Five Thousand Rupees Only"
```

### 3. `sequenceGenerator.js`
Analyzes existing document records and computes the next alphanumeric identifier:
```javascript
import { generateNextNumber } from '../core/utils';

const nextInvoiceNo = generateNextNumber(existingInvoices, 'FS/26-27/');
// If existing max is FS/26-27/004, returns "FS/26-27/005"
```

### 4. `currencyFormatter.js`
Formats numeric values into localized currency strings with standard thousand separators:
```javascript
import { formatCurrency } from '../core/utils';

formatCurrency(24500, '₹'); // => "₹ 24,500.00"
```

### 5. `excelExporter.js`
Generates downloadable spreadsheets directly in the browser via Blob URLs without third-party backend dependencies.

---

## 5. UI Primitives (`src/core/components/`)

- `<Button variant="primary | secondary | danger | ghost" isLoading={bool} icon={FiPlus}>`: Standardized button with loading spinners and hover effects.
- `<StatusBadge status="Paid | Pending | Approved | Overdue | Draft">`: Semantic color-coded pill badge.
- `<InputField label="Client Name" error="Required field" ...>`: Controlled text field with focus rings and error states.
- `<Card className="...">`: Rounded border container with elevation.
- `<MultiSelectDropdown>`: Dropdown with multiselection chips and search filter.
