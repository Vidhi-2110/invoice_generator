# Reusable Module System Documentation

Welcome to the **Invoice, Proforma, and Dashboard Reusable React Modules** documentation. This document provides a complete guide for developers looking to understand, customize, or integrate these independent React modules into any React + Tailwind CSS application.

---

## 1. Overview

### Purpose
The goal of this module architecture is to provide **self-contained, reusable, and configurable business modules** (Dashboard, Invoice, and Proforma Invoice). Each module operates independently, encapsulated within its own folder under `src/modules/`. 

Developers can copy any module directory (`src/modules/invoice`, `src/modules/proforma`, or `src/modules/dashboard`) directly into a different React project without rewriting core logic, altering components, or depending on global app state.

### Technologies Used
* **Framework**: [React](https://react.dev/) (v19)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4)
* **Routing**: [React Router DOM](https://reactrouter.com/) (v7)
* **Icons**: [React Icons](https://react-icons.github.io/react-icons/) (v5 - Feather Icons `fi`)
* **State Management**: React Context API & `localStorage`
* **Build Tool**: [Vite](https://vitejs.dev/)

---

## 2. Module Structure

All reusable feature modules reside inside `src/modules/`. Each module is structured like a mini package containing its own components, context, pages, utilities, configuration, and a central `index.js` entrypoint.

```text
src/modules/
├── dashboard/        # Overview statistics & recent invoice analytics
├── invoice/          # Comprehensive standard billing & invoicing CRUD module
└── proforma/         # Preliminary estimate & proforma invoice CRUD module
```

### Module Responsibilities
* **`dashboard`**: Receives invoice and proforma arrays as props and displays high-level metrics, total calculations, pending indicators, and recent table records. Completely decoupled from contexts.
* **`invoice`**: Manages standard corporate invoice generation, numbering (`FS/26-27/0001`), tax calculation, printing, editing, deletion, and local storage persistence.
* **`proforma`**: Manages preliminary estimate generation, numbering (`FSP/26-27/0001`), validity tracking, printing, editing, deletion, and local storage persistence.

---

## 3. Folder Structure

Below is the complete tree layout of the application showing how the modules fit into the codebase:

```text
src/
├── modules/
│   ├── dashboard/
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx
│   │   ├── dashboardConfig.js
│   │   └── index.js
│   │
│   ├── invoice/
│   │   ├── components/
│   │   │   ├── InvoiceForm.jsx
│   │   │   ├── InvoicePreview.jsx
│   │   │   └── InvoiceTable.jsx
│   │   ├── context/
│   │   │   └── InvoiceContext.jsx
│   │   ├── pages/
│   │   │   ├── InvoiceDetailPage.jsx
│   │   │   ├── InvoiceEditPage.jsx
│   │   │   └── InvoicePage.jsx
│   │   ├── utils/
│   │   │   ├── invoiceNumber.js
│   │   │   └── storage.js
│   │   ├── index.js
│   │   └── invoiceConfig.js
│   │
│   └── proforma/
│       ├── components/
│       │   ├── ProformaForm.jsx
│       │   ├── ProformaPreview.jsx
│       │   └── ProformaTable.jsx
│       ├── context/
│       │   └── ProformaContext.jsx
│       ├── pages/
│       │   ├── ProformaDetailPage.jsx
│       │   ├── ProformaEditPage.jsx
│       │   └── ProformaPage.jsx
│       ├── utils/
│       │   ├── invoiceNumber.js
│       │   └── storage.js
│       ├── index.js
│       └── proformaConfig.js
│
├── components/
│   └── layout/
│       ├── Layout.jsx
│       ├── Navbar.jsx
│       └── Sidebar.jsx
├── routes/
│   └── AppRoutes.jsx
├── App.jsx
├── index.css
└── main.jsx
```

---

## 4. Installation & Requirements

To use these modules in another React application, ensure the following dependencies are installed in your target project:

### Package Dependencies (`package.json`)
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-icons": "^5.0.0",
    "react-router-dom": "^7.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

### Installation Command
```bash
npm install react react-dom react-router-dom react-icons tailwindcss
```

---

## 5. Invoice Module

The **Invoice Module** handles end-to-end standard corporate invoice management.

### Features
* Dynamic form validation (GSTIN, Phone, Email, Dates, Amounts).
* Optional Reference Number field (`referenceNo`).
* Dynamic serial number generation (e.g. `FS/26-27/0001`).
* Automatic subtotal, 18% GST, and total due calculation.
* Clean print & PDF export support with `@media print` rules.
* Click-to-toggle payment status (`Paid` / `Pending` / `Overdue`).
* Confirmation dialogs for deletion.

### Available Exports (`src/modules/invoice/index.js`)

| Export Symbol | Type | Description |
| :--- | :--- | :--- |
| `InvoiceProvider` | Context Provider | Wraps application subtree to supply state, actions, and config. |
| `useInvoices` | Hook | React hook to access `invoices`, `addInvoice`, `updateInvoice`, `deleteInvoice`, `getInvoice`, `config`. |
| `InvoiceForm` | Component | Controlled creation and edit form. |
| `InvoiceTable` | Component | Responsive table listing issued invoices with search/actions. |
| `InvoicePreview` | Component | Print-ready A4 document sheet with corporate headers. |
| `InvoicePage` | Page Component | Full page view toggling between table and creation form. |
| `InvoiceDetailPage` | Page Component | Route view for `/invoice/:id`. |
| `InvoiceEditPage` | Page Component | Route view for `/invoice/:id/edit`. |
| `invoiceConfig` | Object | Default configuration object for standard invoices. |
| `generateNextInvoiceNumber` | Utility | Generates next sequential invoice ID given a prefix. |

### How to Import and Use

```jsx
import { 
  InvoiceProvider, 
  InvoiceForm, 
  InvoiceTable 
} from './modules/invoice';

function MyInvoiceApp() {
  return (
    <InvoiceProvider>
      <div className="p-8 space-y-6">
        <InvoiceForm onSave={(data) => console.log('Saved:', data)} />
        <InvoiceTable />
      </div>
    </InvoiceProvider>
  );
}
```

---

## 6. Proforma Invoice Module

The **Proforma Invoice Module** handles preliminary price estimates and quotes given to clients prior to formal invoicing.

### Features
* Custom estimate form omitting reference numbers.
* Auto-generated estimate numbering (e.g. `FSP/26-27/0001`).
* "Valid Until" date tracking.
* Status indicator badge (`Approved` / `Pending` / `Expired`).
* Standard 18% GST estimation summaries.
* Printable estimate sheet formatting.

### Available Exports (`src/modules/proforma/index.js`)

| Export Symbol | Type | Description |
| :--- | :--- | :--- |
| `ProformaProvider` | Context Provider | Wraps application subtree to supply proforma state and actions. |
| `useProforma` | Hook | Hook to access `proformaInvoices`, `addProforma`, `updateProforma`, `deleteProforma`, `getProforma`, `config`. |
| `useProformaInvoices` | Hook | Alias for `useProforma`. |
| `ProformaForm` | Component | Creation and edit form for estimates. |
| `ProformaTable` | Component | List table showing active estimates. |
| `ProformaPreview` | Component | Printable proforma estimate sheet. |
| `ProformaPage` | Page Component | Main page view for `/proforma-invoice`. |
| `ProformaDetailPage` | Page Component | Route view for `/proforma-invoice/:id`. |
| `ProformaEditPage` | Page Component | Route view for `/proforma-invoice/:id/edit`. |
| `proformaConfig` | Object | Default configuration object for proformas. |
| `generateNextProformaNumber` | Utility | Generates next sequential proforma ID. |

### How to Import and Use

```jsx
import { 
  ProformaProvider, 
  ProformaPage 
} from './modules/proforma';

function MyProformaApp() {
  return (
    <ProformaProvider>
      <ProformaPage />
    </ProformaProvider>
  );
}
```

---

## 7. Dashboard Module

The **Dashboard Module** is an analytics component that displays summary statistics and recent records.

### Features
* 5-column responsive statistics grid:
  1. Total Invoices Count
  2. Total Proformas Count
  3. Total Invoice Amount Sum (`₹`)
  4. Total Proforma Amount Sum (`₹`)
  5. Pending Invoices Count
* Recent 5 invoices quick-access data table.
* Completely decoupled from state contexts (takes raw arrays as props).

### Available Exports (`src/modules/dashboard/index.js`)

| Export Symbol | Type | Description |
| :--- | :--- | :--- |
| `DashboardPage` | Page Component | Dashboard view taking `invoices`, `proformaInvoices`, and `config` as props. |
| `dashboardConfig` | Object | Default configuration holding titles and route paths. |

### How it receives Data (Props API)

```jsx
<DashboardPage 
  invoices={invoiceArray} 
  proformaInvoices={proformaArray} 
  config={customDashboardConfig}
/>
```

---

## 8. Using Modules in Another Project

Here is how you can import and compose the modules in a third-party project:

```jsx
import React from 'react';
import { InvoiceProvider, InvoiceTable, InvoiceForm } from './modules/invoice';
import { ProformaProvider, ProformaTable } from './modules/proforma';

export default function IntegratedApp() {
  return (
    <InvoiceProvider>
      <ProformaProvider>
        <div className="p-8 space-y-12">
          <section>
            <h1 className="text-2xl font-bold mb-4">Invoices Section</h1>
            <InvoiceTable />
          </section>

          <section>
            <h1 className="text-2xl font-bold mb-4">Proformas Section</h1>
            <ProformaTable />
          </section>
        </div>
      </ProformaProvider>
    </InvoiceProvider>
  );
}
```

---

## 9. Configuration

Customizable values are extracted into configuration files. You can pass a custom `config` prop to `InvoiceProvider` or `ProformaProvider` to override defaults without modifying core component logic.

### Invoice Configuration Schema (`src/modules/invoice/invoiceConfig.js`)

```javascript
const invoiceConfig = {
  title: "Invoice",                  // Module display title
  localStorageKey: "invoices",        // LocalStorage key name
  numberPrefix: "FS/26-27/",          // Serial ID prefix
  currency: "₹",                      // Currency symbol
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

### Passing a Custom Config Override

```jsx
const myCustomInvoiceConfig = {
  ...invoiceConfig,
  title: "Tax Invoice",
  numberPrefix: "ACME/2026/",
  currency: "$",
  localStorageKey: "acme_invoices_v1",
  companyDetails: {
    name: "Acme Corporation Inc.",
    address: "100 Tech Blvd, San Francisco, CA 94107",
    email: "billing@acme.com",
    phone: "+1 (555) 019-2834",
    website: "www.acme.com",
    gstin: "US-987654321",
  }
};

function App() {
  return (
    <InvoiceProvider config={myCustomInvoiceConfig}>
      <InvoicePage />
    </InvoiceProvider>
  );
}
```

---

## 10. Data Structure

### Invoice Object Structure
```json
{
  "id": "1787556000000",
  "invoiceNumber": "FS/26-27/0001",
  "referenceNo": "PO-99482",
  "name": "Acme Systems Ltd",
  "email": "client@acme.com",
  "phone": "+91 9876543210",
  "address": "12 Tech Park, Outer Ring Road, Bengaluru, Karnataka - 560103",
  "gstin": "29ABCDE1234F1Z5",
  "createdDate": "2026-08-24",
  "dueDate": "2026-08-31",
  "description": "Cloud Architecture & Consulting Services - Q3",
  "rate": 45000,
  "status": "Pending"
}
```

### Proforma Invoice Object Structure
```json
{
  "id": "1787556000001",
  "invoiceNumber": "FSP/26-27/0001",
  "name": "Starlight Interactive",
  "email": "contact@starlight.io",
  "phone": "+91 8899776655",
  "address": "45 Creative Hub, Bandra West, Mumbai, Maharashtra - 400050",
  "gstin": "27AAACG1111A1Z2",
  "createdDate": "2026-08-24",
  "dueDate": "2026-08-31",
  "description": "Preliminary Mobile App Development Estimate",
  "rate": 75000,
  "status": "Pending"
}
```

---

## 11. Routing

To add module routes to your application, wire the exported page components inside React Router DOM:

```jsx
import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from './modules/dashboard';
import { 
  InvoicePage, 
  InvoiceDetailPage, 
  InvoiceEditPage, 
  useInvoices 
} from './modules/invoice';
import { 
  ProformaPage, 
  ProformaDetailPage, 
  ProformaEditPage, 
  useProforma 
} from './modules/proforma';

function DashboardRouteWrapper() {
  const { invoices } = useInvoices();
  const { proformaInvoices } = useProforma();
  return <DashboardPage invoices={invoices} proformaInvoices={proformaInvoices} />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardRouteWrapper />} />
      
      {/* Invoice Routes */}
      <Route path="/invoice" element={<InvoicePage />} />
      <Route path="/invoice/:id" element={<InvoiceDetailPage />} />
      <Route path="/invoice/:id/edit" element={<InvoiceEditPage />} />
      
      {/* Proforma Routes */}
      <Route path="/proforma-invoice" element={<ProformaPage />} />
      <Route path="/proforma-invoice/:id" element={<ProformaDetailPage />} />
      <Route path="/proforma-invoice/:id/edit" element={<ProformaEditPage />} />
    </Routes>
  );
}
```

---

## 12. LocalStorage

Data persistence is handled by custom storage utilities inside each module (`utils/storage.js`).

### Storage Keys
* **Invoices Default Key**: `'invoices'`
* **Proforma Default Key**: `'proforma_invoices'`

### Customizing Keys
You can change storage keys without modifying code by changing `localStorageKey` in the module config:
```javascript
const customConfig = {
  ...invoiceConfig,
  localStorageKey: 'my_company_invoices_2026'
};
```

---

## 13. Customization & Styling

All visual styles are built using standard **Tailwind CSS utility classes**. 

* **No external CSS files**: Styling relies entirely on utility classes (e.g. `bg-white`, `border-slate-200`, `text-indigo-600`, `rounded-2xl`).
* **Theme Adaptations**: You can change colors across a module by adjusting Tailwind utility names in the components (e.g. replacing `indigo-600` with `emerald-600` or `blue-600`).
* **Print Styles**: `@media print` utilities (`print:hidden`, `print:p-0`, `print:shadow-none`) ensure elements like navbars, buttons, and sidebars are excluded during printing.

---

## 14. API / Backend Integration Guide

Currently, records are stored in browser `localStorage`. To replace `localStorage` with a REST or GraphQL API backend:

1. Open `src/modules/invoice/context/InvoiceContext.jsx` (or `ProformaContext.jsx`).
2. Replace `useState(() => loadFromStorage(...))` with an `useEffect` API fetch call:

```javascript
// Example API Integration in InvoiceContext.jsx
export const InvoiceProvider = ({ children, config = defaultInvoiceConfig }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/invoices')
      .then((res) => res.json())
      .then((data) => {
        setInvoices(data);
        setLoading(false);
      });
  }, []);

  const addInvoice = async (invoiceData) => {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    });
    const newInvoice = await res.json();
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  // ... updateInvoice & deleteInvoice API calls
};
```

---

## 15. Reusable Module Complete Example

Here is a complete standalone example showing how to mount all 3 modules in a blank React + Tailwind application:

```jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  InvoiceProvider, 
  InvoicePage, 
  InvoiceDetailPage, 
  InvoiceEditPage,
  useInvoices 
} from './modules/invoice';
import { 
  ProformaProvider, 
  ProformaPage, 
  ProformaDetailPage, 
  ProformaEditPage,
  useProforma 
} from './modules/proforma';
import { DashboardPage } from './modules/dashboard';

function DashboardConnector() {
  const { invoices } = useInvoices();
  const { proformaInvoices } = useProforma();
  return <DashboardPage invoices={invoices} proformaInvoices={proformaInvoices} />;
}

export default function App() {
  return (
    <Router>
      <InvoiceProvider>
        <ProformaProvider>
          <div className="min-h-screen bg-slate-50 text-slate-800">
            {/* Header Nav */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex gap-6">
              <Link to="/dashboard" className="font-bold text-slate-700 hover:text-indigo-600">Dashboard</Link>
              <Link to="/invoice" className="font-bold text-slate-700 hover:text-indigo-600">Invoices</Link>
              <Link to="/proforma-invoice" className="font-bold text-slate-700 hover:text-indigo-600">Proformas</Link>
            </header>

            {/* Viewport */}
            <main className="p-8">
              <Routes>
                <Route path="/dashboard" element={<DashboardConnector />} />
                <Route path="/invoice" element={<InvoicePage />} />
                <Route path="/invoice/:id" element={<InvoiceDetailPage />} />
                <Route path="/invoice/:id/edit" element={<InvoiceEditPage />} />
                <Route path="/proforma-invoice" element={<ProformaPage />} />
                <Route path="/proforma-invoice/:id" element={<ProformaDetailPage />} />
                <Route path="/proforma-invoice/:id/edit" element={<ProformaEditPage />} />
              </Routes>
            </main>
          </div>
        </ProformaProvider>
      </InvoiceProvider>
    </Router>
  );
}
```

---

## 16. Best Practices

1. **Keep Contexts at Module Root**: Always wrap components consuming `useInvoices` or `useProforma` inside their respective `InvoiceProvider` or `ProformaProvider`.
2. **Do Not Hardcode Vendor Profiles**: Store logo URLs, addresses, email, GSTIN, and seller names in `config.companyDetails`.
3. **Use Barrel Exports**: Always import module symbols from `./modules/invoice` or `./modules/proforma` rather than importing deeply nested internal paths.
4. **Preserve Responsive Layouts**: Use Tailwind's grid breakpoints (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) to maintain mobile responsiveness.
5. **Set Button Types Explicitly**: Always specify `type="button"` on non-submitting action triggers to avoid accidental form submissions.

---

## 17. Troubleshooting

| Symptom / Error | Cause | Solution |
| :--- | :--- | :--- |
| `useInvoices must be used within an InvoiceProvider` | Component using `useInvoices()` is rendered outside of `<InvoiceProvider>`. | Wrap the top-level page or route inside `<InvoiceProvider>`. |
| Tailwind styles missing or unstyled HTML | Target project Tailwind scanner configuration is missing `src/modules/` path. | In `tailwind.config.js`, verify `content` includes `'./src/**/*.{js,jsx,ts,tsx}'`. |
| Navigation hooks (`useNavigate`, `useParams`) fail | Module page rendered outside of React Router context. | Ensure your root app is wrapped in `<BrowserRouter>` or `<HashRouter>`. |
| Serial ID resets back to `0001` | Prefix string changed without updating existing storage records. | Update `numberPrefix` in `invoiceConfig.js` to match existing stored record patterns. |
