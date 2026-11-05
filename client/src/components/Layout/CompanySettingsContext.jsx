/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadFromStorage, saveToStorage } from '../../core/storage/localStorageAdapter';
import { getPaletteById, applyPalette, DEFAULT_PALETTE_ID } from '../../core/theme/palettes';
import { useAuth } from '../../modules/auth';
import { updateCompanyAssetsApi } from '../../api/authApi';

// Settings keys mirrored to the server so emailed PDFs use them
const SERVER_ASSET_KEYS = [
  'logo', 'esign', 'stamp',
  'companyName', 'phone', 'email', 'address',
  'bankName', 'ifscCode', 'branchName', 'accountNumber', 'accountName',
  'invoicePrefix', 'proformaPrefix',
];

const BASE_STORAGE_KEY = 'invosaas_company_settings';

/** Returns a per-user storage key so settings never bleed across accounts */
const getStorageKey = (userId) =>
  userId ? `${BASE_STORAGE_KEY}_${userId}` : BASE_STORAGE_KEY;

export const defaultSettings = {
  // Branding
  companyName: 'InvoSaaS',
  tagline: 'Enterprise Billing',
  logo: null,
  colorPalette: DEFAULT_PALETTE_ID,

  // Contact
  phone: '',
  email: '',
  address: '',

  // Bank Details
  bankName: '',
  ifscCode: '',
  branchName: '',
  accountNumber: '',
  accountName: '',

  // Document numbering (blank = default)
  invoicePrefix: '',
  proformaPrefix: '',

  // Documents
  esign: null,
  stamp: null,
};

const CompanySettingsContext = createContext(null);

export const CompanySettingsProvider = ({ children }) => {
  const { user, token } = useAuth();
  const userId = user?.id ?? null;
  const storageKey = getStorageKey(userId);

  const [prevUserId, setPrevUserId] = useState(userId);
  const [settings, setSettings] = useState(() => {
    const loaded = loadFromStorage(storageKey, defaultSettings);
    applyPalette(getPaletteById(loaded.colorPalette ?? DEFAULT_PALETTE_ID));
    return loaded;
  });

  // Synchronize state during render when user account changes (login/logout/switch)
  if (prevUserId !== userId) {
    setPrevUserId(userId);
    const loaded = userId ? loadFromStorage(getStorageKey(userId), defaultSettings) : defaultSettings;
    setSettings(loaded);
  }

  // Re-apply palette whenever it changes within a session
  useEffect(() => {
    applyPalette(getPaletteById(settings.colorPalette ?? DEFAULT_PALETTE_ID));
  }, [settings.colorPalette]);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveToStorage(storageKey, next);
      return next;
    });

    const assets = {};
    SERVER_ASSET_KEYS.forEach((key) => {
      if (updates[key] !== undefined) assets[key] = updates[key] || null;
    });
    if (token && Object.keys(assets).length > 0) {
      updateCompanyAssetsApi(assets, token).catch((err) =>
        console.warn('[CompanySettings] Could not sync logo/e-sign/stamp to server:', err.message)
      );
    }
  }, [storageKey, token]);

  return (
    <CompanySettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </CompanySettingsContext.Provider>
  );
};

export const useCompanySettings = () => {
  const ctx = useContext(CompanySettingsContext);
  if (!ctx) throw new Error('useCompanySettings must be used within CompanySettingsProvider');
  return ctx;
};

export default CompanySettingsContext;
