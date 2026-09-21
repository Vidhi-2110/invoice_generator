/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateNextNumber } from '../../../core/utils';
import { useAuth } from '../../auth';
import defaultInvoiceConfig from '../invoiceConfig';
import {
  fetchInvoices,
  createInvoice,
  updateInvoiceApi,
  deleteInvoiceApi,
} from '../../../api/invoiceApi';

const InvoiceContext = createContext();

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
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const storageKey = user?.id
    ? `${config.localStorageKey}_${user.id}`
    : config.localStorageKey;

  // ── Load invoices from MongoDB for current authenticated user ─────────────
  const loadInvoices = useCallback(async () => {
    if (!localStorage.getItem('auth_token')) {
      setInvoices([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchInvoices();
      setInvoices(data);
      saveToStorage(storageKey, data);
    } catch (err) {
      console.warn('⚠️ Could not reach backend, loading user data from localStorage:', err.message);
      setError(err.message);
      setInvoices(loadFromStorage(storageKey));
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices, user?.id]);

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
        saveToStorage(storageKey, updated);
        return updated;
      });
      return saved;
    } catch (err) {
      console.error('Failed to save invoice to MongoDB:', err.message);
      const localInvoice = { ...payload, id: Date.now().toString() };
      setInvoices((prev) => {
        const updated = [localInvoice, ...prev];
        saveToStorage(storageKey, updated);
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
        saveToStorage(storageKey, updated);
        return updated;
      });
    } catch (err) {
      console.error('Failed to update invoice in MongoDB:', err.message);
      setInvoices((prev) => {
        const updated = prev.map((inv) =>
          inv.id === id ? { ...inv, ...updatedData } : inv
        );
        saveToStorage(storageKey, updated);
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
    setInvoices((prev) => {
      const updated = prev.filter((inv) => inv.id !== id);
      saveToStorage(storageKey, updated);
      return updated;
    });
  };

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
