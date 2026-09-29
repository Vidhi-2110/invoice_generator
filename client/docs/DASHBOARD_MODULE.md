# Dashboard Module Documentation

**Location**: `src/modules/dashboard/`  
**Route**: `/dashboard` (default landing route)  
**Status**: Production ready — Real-time reactive analytics  

---

## 1. Overview

The **Dashboard Module** serves as the central command center for InvoSaaS. It aggregates live metrics across invoices and proformas, automatically computes revenue, tracks receivables, and provides immediate navigation to create or inspect documents.

### Key Capabilities
- **De-duplicated Revenue Metric**: Intelligently prevents double-counting between Proformas and their converted Invoices using `proformaRefs`, `referenceNo`, and `sourceProformaNumber`.
- **6 Real-time Analytical Cards**:
  1. *Total Paid Revenue* (Approved proformas + standalone paid invoices)
  2. *Paid Proforma Amt*
  3. *Paid Invoice Amt*
  4. *Total Pending Receivables*
  5. *Invoices Pending*
  6. *Proformas Pending*
- **Recent Activity Ledger**: Tabbed interface switching between the 5 most recent Invoices and Proformas.
- **Direct Exports**: Trigger full workbook export right from the dashboard.

---

## 2. Directory Structure

```text
src/modules/dashboard/
├── pages/
│   └── DashboardPage.jsx       # Main dashboard layout, stat cards & recent activity table
├── dashboardConfig.js          # Default titles and subtitles
└── index.js                    # Module export barrel
```

---

## 3. Financial Calculation Engine

To prevent inflating revenue numbers when a quote is converted to an invoice, `DashboardPage.jsx` implements deduplication logic:

```javascript
// Standalone paid invoices: invoices NOT linked to any proforma
const standalonePaidInvoices = paidInvoices.filter((inv) => {
  const hasRefs = Array.isArray(inv.proformaRefs) && inv.proformaRefs.length > 0;
  const hasRefNo = Boolean(inv.referenceNo);
  const hasSource = Boolean(inv.sourceProformaNumber);
  return !hasRefs && !hasRefNo && !hasSource;
});

// Total Paid Revenue = Approved Proformas + Standalone Paid Invoices (Zero double-counting)
const totalPaidAmt = approvedProformasAmt + standalonePaidInvoices.reduce((s, inv) => s + getItemAmount(inv), 0);
```

### Multi-Item Rate & Quantity Resolver

```javascript
const getItemAmount = (item) => {
  if (!item) return 0;
  if (item.lineItems && Array.isArray(item.lineItems) && item.lineItems.length > 0) {
    const sum = item.lineItems.reduce((acc, line) => {
      const r = parseFloat(line.rate ?? line.amount ?? 0) || 0;
      const q = parseFloat(line.hours ?? line.qty ?? 1) || 1;
      return acc + (r * q);
    }, 0);
    if (sum > 0) return sum;
  }
  return parseFloat(item.rate) || 0;
};
```

---

## 4. Component Interface & Props

```jsx
<DashboardPage 
  invoices={invoices} 
  proformaInvoices={proformaInvoices} 
  config={dashboardConfig} 
/>
```

In `AppRoutes.jsx`, `DashboardRoute` automatically connects `useInvoices()` and `useProforma()` to provide these props:

```jsx
const DashboardRoute = () => {
  const { invoices } = useInvoices();
  const { proformaInvoices } = useProforma();
  return <DashboardPage invoices={invoices} proformaInvoices={proformaInvoices} />;
};
```

---

## 5. UI Sections

1. **Header & Actions**: Welcome banner, page title, and "Export .xlsx" / "Create Invoice" buttons.
2. **Key Metric Grid**: 6 responsive grid cards with hover animations, custom color badges, and trend indicators.
3. **Quick Action Hub**: 1-click links to `/invoice` (New Invoice), `/proforma-invoice` (New Proforma), and `/clients` (Add Client).
4. **Recent Activity Ledger**:
   - Tab toggles: `Invoices (N)` vs `Proformas (M)`
   - Columns: Document Number, Client Name, Date, Amount (formatted in INR `₹`), Status Badge, and View Link (`FiEye`).
