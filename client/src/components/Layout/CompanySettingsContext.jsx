/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { loadFromStorage, saveToStorage } from '../../core/storage/localStorageAdapter';
import { getPaletteById, applyPalette, DEFAULT_PALETTE_ID } from '../../core/theme/palettes';
import { useAuth } from '../../modules/auth';

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

  // Documents
  esign: null,
  stamp: null,
};

const CompanySettingsContext = createContext(null);

export const CompanySettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const storageKey = getStorageKey(userId);

  // Track previous userId to detect account switches
  const prevUserIdRef = useRef(userId);

  const [settings, setSettings] = useState(() => {
    const loaded = loadFromStorage(storageKey, defaultSettings);
    applyPalette(getPaletteById(loaded.colorPalette ?? DEFAULT_PALETTE_ID));
    return loaded;
  });

  // ── React to user account changes (login/logout/switch) ───────────────────
  useEffect(() => {
    if (prevUserIdRef.current === userId) return;
    prevUserIdRef.current = userId;

    if (!userId) {
      // Logged out — wipe to defaults so next user sees a clean slate
      applyPalette(getPaletteById(DEFAULT_PALETTE_ID));
      setSettings(defaultSettings);
      return;
    }

    // Different user logged in — load their own saved settings
    const loaded = loadFromStorage(getStorageKey(userId), defaultSettings);
    applyPalette(getPaletteById(loaded.colorPalette ?? DEFAULT_PALETTE_ID));
    setSettings(loaded);
  }, [userId]);

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
  }, [storageKey]);

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
