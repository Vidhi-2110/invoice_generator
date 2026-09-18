/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateNextNumber } from '../../../core/utils';
import defaultProformaConfig from '../proformaConfig';
import {
  fetchProformas,
  createProforma,
  updateProformaApi,
  deleteProformaApi,
} from '../../../api/proformaApi';

const ProformaContext = createContext();

// ── localStorage helpers (offline fallback) ───────────────────────────────────
const loadFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return [];
  }
};

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

export const useProforma = () => {
  const context = useContext(ProformaContext);
  if (!context) {
    throw new Error('useProforma must be used within a ProformaProvider');
  }
  return context;
};

export const useProformaInvoices = useProforma;

export const ProformaProvider = ({ children, config = defaultProformaConfig }) => {
  const [proformaInvoices, setProformaInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load from MongoDB on mount ────────────────────────────────────────────
  const loadProformas = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProformas();
      setProformaInvoices(data);
      saveToStorage(config.localStorageKey, data);
    } catch (err) {
      console.warn('⚠️ Could not reach backend, loading from localStorage:', err.message);
      setError(err.message);
      setProformaInvoices(loadFromStorage(config.localStorageKey));
    } finally {
      setIsLoading(false);
    }
  }, [config.localStorageKey]);

  useEffect(() => {
    loadProformas();
  }, [loadProformas]);

  // ── Add proforma ──────────────────────────────────────────────────────────
  const addProforma = async (proformaData) => {
    const nextNumber = generateNextNumber(proformaInvoices, config.numberPrefix);
    const payload = {
      ...proformaData,
      invoiceNumber: nextNumber,
      createdDate: proformaData.createdDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = await createProforma(payload);
      setProformaInvoices((prev) => {
        const updated = [saved, ...prev];
        saveToStorage(config.localStorageKey, updated);
        return updated;
      });
      return saved;
    } catch (err) {
      console.error('Failed to save proforma to MongoDB:', err.message);
      const localProforma = { ...payload, id: Date.now().toString() };
      setProformaInvoices((prev) => {
        const updated = [localProforma, ...prev];
        saveToStorage(config.localStorageKey, updated);
        return updated;
      });
      return localProforma;
    }
  };

  // ── Update proforma ───────────────────────────────────────────────────────
  const updateProforma = async (id, updatedData) => {
    try {
      const saved = await updateProformaApi(id, updatedData);
      setProformaInvoices((prev) => {
        const updated = prev.map((pi) => (pi.id === id ? saved : pi));
        saveToStorage(config.localStorageKey, updated);
        return updated;
      });
    } catch (err) {
      console.error('Failed to update proforma in MongoDB:', err.message);
      setProformaInvoices((prev) => {
        const updated = prev.map((pi) =>
          pi.id === id ? { ...pi, ...updatedData } : pi
        );
        saveToStorage(config.localStorageKey, updated);
        return updated;
      });
    }
  };

  // ── Delete proforma ───────────────────────────────────────────────────────
  const deleteProforma = async (id) => {
    try {
      await deleteProformaApi(id);
    } catch (err) {
      console.error('Failed to delete proforma from MongoDB:', err.message);
    }
    setProformaInvoices((prev) => {
      const updated = prev.filter((pi) => pi.id !== id);
      saveToStorage(config.localStorageKey, updated);
      return updated;
    });
  };

  // ── Get single proforma ───────────────────────────────────────────────────
  const getProforma = (id) => proformaInvoices.find((pi) => pi.id === id);

  return (
    <ProformaContext.Provider
      value={{
        proformaInvoices,
        isLoading,
        error,
        addProforma,
        updateProforma,
        deleteProforma,
        getProforma,
        config,
        reload: loadProformas,
      }}
    >
      {children}
    </ProformaContext.Provider>
  );
};
