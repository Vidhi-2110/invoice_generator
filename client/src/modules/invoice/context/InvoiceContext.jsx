/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth';
import authService from '../../auth/services/authService';
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
    if (!authService.getToken()) {
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
      console.warn('⚠️  Could not reach backend, loading user data from localStorage:', err.message);
      setError(err.message);
      setInvoices(loadFromStorage(storageKey));
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  useEffect(() => {
    let ignore = false;
    if (!authService.getToken()) {
      return;
    }
    fetchInvoices()
      .then((data) => {
        if (!ignore) {
          setInvoices(data);
          saveToStorage(storageKey, data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.warn('⚠️  Could not reach backend, loading user data from localStorage:', err.message);
          setError(err.message);
          setInvoices(loadFromStorage(storageKey));
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [storageKey, user?.id]);

  // ── Add invoice ───────────────────────────────────────────────────────────
  // Invoice number is generated server-side (atomic counter). Do NOT pass
  // invoiceNumber from the client — the server will set it and return it.
  const addInvoice = async (invoiceData) => {
    const payload = {
      ...invoiceData,
      createdDate: invoiceData.createdDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    // Remove any client-generated invoiceNumber so the server owns sequencing
    delete payload.invoiceNumber;

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
      throw err; // surface the error so the form can display it
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

  const getInvoice = (id) => invoices.find((inv) => inv.id === id || inv.invoiceNumber === id);

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
