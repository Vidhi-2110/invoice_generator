/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { loadFromStorage, saveToStorage } from '../../core/storage/localStorageAdapter';
import { getPaletteById, applyPalette, DEFAULT_PALETTE_ID } from '../../core/theme/palettes';

const STORAGE_KEY = 'invosaas_company_settings';

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

  // Documents
  esign: null,
  stamp: null,
};

const CompanySettingsContext = createContext(null);

export const CompanySettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const loaded = loadFromStorage(STORAGE_KEY, defaultSettings);
    // Apply saved palette immediately on mount
    applyPalette(getPaletteById(loaded.colorPalette ?? DEFAULT_PALETTE_ID));
    return loaded;
  });

  // Re-apply palette whenever it changes
  useEffect(() => {
    applyPalette(getPaletteById(settings.colorPalette ?? DEFAULT_PALETTE_ID));
  }, [settings.colorPalette]);

  const updateSettings = useCallback((updates) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveToStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

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
