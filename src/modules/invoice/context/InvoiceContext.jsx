/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { generateNextNumber } from '../../../core/utils';
import defaultInvoiceConfig from '../invoiceConfig';

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
  const [invoices, setInvoices] = useState(() => loadFromStorage(config.localStorageKey));
  const isLoading = false;

  useEffect(() => {
    saveToStorage(config.localStorageKey, invoices);
  }, [invoices, config.localStorageKey]);

  const addInvoice = (invoiceData) => {
    const nextNumber = generateNextNumber(invoices, config.numberPrefix);
    const newInvoice = {
      ...invoiceData,
      id: Date.now().toString(),
      invoiceNumber: nextNumber,
      createdDate: invoiceData.createdDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = (id, updatedData) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, ...updatedData } : inv))
    );
  };

  const deleteInvoice = (id) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  const getInvoice = (id) => {
    return invoices.find((inv) => inv.id === id);
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoices,
        isLoading,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoice,
        config,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};
