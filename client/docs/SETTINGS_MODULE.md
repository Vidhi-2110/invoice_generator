# Settings Module Documentation

**Location**: `src/modules/settings/`  
**Route**: `/settings`  
**Context Provider**: `src/components/Layout/CompanySettingsContext.jsx`  
**Status**: Production ready — Real-time CSS theme injection & profile management  

---

## 1. Overview

The **Settings Module** gives users full customization over their business identity, banking information, printable document stamps/signatures, and interface color themes. 

Settings are stored in `localStorage` under `invosaas_company_settings` and update the entire application in real time without requiring a reload.

---

## 2. Directory Structure

```text
src/
├── modules/
│   └── settings/
│       └── SettingsPage.jsx       # Tabbed settings interface & image cropping modal
└── components/
    └── Layout/
        ├── CompanySettingsContext.jsx  # Context provider for company settings
        └── CompanySettingsModal.jsx    # Quick settings slide-over modal
```

---

## 3. Settings Data Schema

```typescript
interface CompanySettings {
  // Branding
  companyName: string;          // e.g. "Futentia Solutions Private Limited"
  tagline: string;              // e.g. "Enterprise Billing & Consulting"
  logo: string | null;          // Base64 data URL
  colorPalette: string;         // e.g. "indigo", "violet", "emerald", "rose"

  // Contact Information
  phone: string;                // e.g. "+91 8866778903"
  email: string;                // e.g. "info@futentia.com"
  address: string;              // Street address, city, pin code
  gstin?: string;               // Company GSTIN

  // Bank & Wire Transfer Details
  bankName: string;             // e.g. "HDFC Bank"
  accountName: string;          // Beneficiary name
  accountNumber: string;        // Bank account number
  ifscCode: string;             // IFSC routing code
  branchName: string;           // Bank branch location

  // Digital Endorsements
  esign: string | null;         // Base64 cropped signature
  stamp: string | null;         // Base64 cropped circular/square company seal
}
```

---

## 4. Theme Engine & Color Palettes (`src/core/theme/palettes.js`)

InvoSaaS uses dynamic CSS custom properties on `:root` to theme the sidebar, active nav tabs, primary buttons, and badges.

### Available Palettes
- **Indigo Blue** (`indigo`): Classic enterprise blue
- **Royal Violet** (`violet`): Creative and modern violet
- **Rose Red** (`rose`): Bold crimson
- **Emerald Green** (`emerald`): Vibrant growth green
- **Ocean Teal** (`teal`): Serene teal
- **Amber Gold** (`amber`): Warm executive gold
- **Slate Dark** (`slate`): Minimalist monochrome

### Real-Time CSS Injection
When a user selects a palette in `SettingsPage`, `applyPalette()` immediately applies these CSS variables to `document.documentElement`:

```javascript
export function applyPalette(palette) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', palette.primary);
  root.style.setProperty('--brand-primary-hover', palette.primaryHover);
  root.style.setProperty('--brand-primary-light', palette.primaryLight);
  root.style.setProperty('--brand-primary-text', palette.primaryText);
  root.style.setProperty('--brand-primary-muted', palette.primaryMuted);
  root.style.setProperty('--brand-shadow', palette.shadow);
}
```

---

## 5. Interactive Image Cropping (`react-easy-crop`)

Both the **Logo**, **E-Signature**, and **Company Stamp** uploaders include a dedicated modal cropper with:
- Drag-to-position canvas
- Smooth zoom slider (`1x` to `3x`)
- 90° clockwise rotation
- Export to lightweight base64 PNG (`canvas.toDataURL('image/png', 0.95)`)

---

## 6. Document Preview Integration

Changes made in Settings immediately propagate to all printed and previewed documents (`DocumentPreview.jsx`):
1. **Header**: Renders the custom uploaded `logo` and company address.
2. **Bank Details Block**: Automatically formats Bank Name, Account Number, and IFSC code at the bottom of the invoice.
3. **Signature Block**: Displays the cropped `esign` and company `stamp` over the authorized signatory line.
