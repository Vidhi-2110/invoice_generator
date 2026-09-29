# Layout & Navigation System Documentation

**Location**: `src/components/Layout/`  
**Purpose**: Global app shell, responsive navigation, topbar utilities, and brand customization  

---

## 1. Overview

The **Layout System** wraps all authenticated pages in InvoSaaS. It provides a fixed-width dark sidebar on desktop screens, an off-canvas drawer on mobile devices, a sticky topbar with dynamic page titles, and application-wide theme styling.

---

## 2. Directory Structure

```text
src/components/Layout/
├── Layout.jsx                  # Main wrapper with Sidebar and Navbar
├── Navbar.jsx                  # Sticky top navigation bar
├── Sidebar.jsx                 # Dark theme responsive side navigation
├── navConfig.js                # Central list of navigation routes and icons
├── CompanySettingsContext.jsx  # Global provider for company identity and brand color
└── CompanySettingsModal.jsx    # Quick modal dialog for editing company details
```

---

## 3. Component Details

### 1. `Layout.jsx`
The primary application frame:
- Houses `Sidebar` and `Navbar`.
- Offsets page content by `lg:pl-72` to accommodate the 288px fixed sidebar.
- Renders page routes through `<Outlet />` inside a scrollable `<main>` container.
- Manages `sidebarOpen` state for mobile drawer toggling.

### 2. `Navbar.jsx`
Top horizontal header:
- **Dynamic Title**: Automatically determines page title based on `location.pathname` (e.g. `/invoice/123/edit` -> *"Edit Invoice"*).
- **Date Indicator**: Displays current formatted date (`en-US` format: *"Mon, Sep 29, 2026"*).
- **User Dropdown**: Embeds `<UserDropdown />` from the Auth module, giving direct access to user profile data and logout.
- **Print Friendly**: Has `print:hidden` utility class so it disappears when invoices are printed.

### 3. `Sidebar.jsx`
Branded navigation drawer:
- **Dynamic Brand Header**: Renders the uploaded company logo or a custom colored monogram with the company name and tagline.
- **Navigation Links**:
  - `Dashboard` (`/dashboard`, icon: `FiHome`)
  - `Invoice` (`/invoice`, icon: `FiFileText`)
  - `Proforma Invoice` (`/proforma-invoice`, icon: `FiBookOpen`)
  - `Clients` (`/clients`, icon: `FiUsers`)
- **Active Tab Styling**: Highlights current route using `NavLink` with `--brand-primary` background accents.
- **Footer**: Direct link to `/settings` with gear icon.

### 4. `navConfig.js`
Centralized menu configuration:
```javascript
import { FiHome, FiFileText, FiBookOpen, FiUsers } from 'react-icons/fi';

export const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: FiHome },
  { name: 'Invoice', path: '/invoice', icon: FiFileText },
  { name: 'Proforma Invoice', path: '/proforma-invoice', icon: FiBookOpen },
  { name: 'Clients', path: '/clients', icon: FiUsers },
];
```

---

## 4. `CompanySettingsContext.jsx`

Provides company profile and branding to all components:

### Context Value (`useCompanySettings()`)

| Property | Type | Description |
|---|---|---|
| `settings` | `CompanySettings` | Object containing companyName, tagline, logo, colorPalette, bank details, and signature |
| `updateSettings(updates)` | `Function` | Merges updates into state and persists to `localStorage` |

Whenever `settings.colorPalette` changes, the context calls `applyPalette(...)` to inject CSS properties into `document.documentElement` in real time.
