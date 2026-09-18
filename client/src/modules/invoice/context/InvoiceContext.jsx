/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateNextNumber } from '../../../core/utils';
import defaultInvoiceConfig from '../invoiceConfig';
import {
  fetchInvoices,
  createInvoice,
  updateInvoiceApi,
  deleteInvoiceApi,
} from '../../../api/invoiceApi';

const InvoiceContext = createContext();

// ── localStorage helpers (offline fallback) ──────────────────────────────────
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

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};

export const InvoiceProvider = ({ children, config = defaultInvoiceConfig }) => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load invoices from MongoDB on mount ──────────────────────────────────
  const loadInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchInvoices();
      setInvoices(data);
      saveToStorage(config.localStorageKey, data); // keep local cache in sync
    } catch (err) {
      console.warn('⚠️ Could not reach backend, loading from localStorage:', err.message);
      setError(err.message);
      // Graceful fallback to localStorage when server is unreachable
      setInvoices(loadFromStorage(config.localStorageKey));
    } finally {
      setIsLoading(false);
    }
  }, [config.localStorageKey]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // ── Add invoice ───────────────────────────────────────────────────────────
  const addInvoice = async (invoiceData) => {
    const nextNumber = generateNextNumber(invoices, config.numberPrefix);
    const payload = {
      ...invoiceData,
      invoiceNumber: nextNumber,
      createdDate: invoiceData.createdDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = await createInvoice(payload);
      setInvoices((prev) => {
        const updated = [saved, ...prev];
        saveToStorage(config.localStorageKey, updated);
        return updated;
      });
      return saved;
    } catch (err) {
      console.error('Failed to save invoice to MongoDB:', err.message);
      // Optimistic local-only fallback
      const localInvoice = { ...payload, id: Date.now().toString() };
      setInvoices((prev) => {
        const updated = [localInvoice, ...prev];
        saveToStorage(config.localStorageKey, updated);
        return updated;
      });
      return localInvoice;
    }
  };

  // ── Update invoice ────────────────────────────────────────────────────────
  const updateInvoice = async (id, updatedData) => {
    try {
      const saved = await updateInvoiceApi(id, updatedData);
      setInvoices((prev) => {
        const updated = prev.map((inv) => (inv.id === id ? saved : inv));
        saveToStorage(config.localStorageKey, updated);
        return updated;
      });
    } catch (err) {
      console.error('Failed to update invoice in MongoDB:', err.message);
      // Optimistic local update
      setInvoices((prev) => {
        const updated = prev.map((inv) =>
          inv.id === id ? { ...inv, ...updatedData } : inv
        );
        saveToStorage(config.localStorageKey, updated);
        return updated;
      });
    }
  };

  // ── Delete invoice ────────────────────────────────────────────────────────
  const deleteInvoice = async (id) => {
    try {
      await deleteInvoiceApi(id);
    } catch (err) {
      console.error('Failed to delete invoice from MongoDB:', err.message);
    }
    // Always remove from local state (optimistic)
    setInvoices((prev) => {
      const updated = prev.filter((inv) => inv.id !== id);
      saveToStorage(config.localStorageKey, updated);
      return updated;
    });
  };

  // ── Get single invoice ────────────────────────────────────────────────────
  const getInvoice = (id) => invoices.find((inv) => inv.id === id);

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        isLoading,
        error,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoice,
        config,
        reload: loadInvoices,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};
