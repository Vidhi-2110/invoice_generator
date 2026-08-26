/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage } from '../../../core/storage';
import { generateNextNumber } from '../../../core/utils';
import defaultInvoiceConfig from '../invoiceConfig';

const InvoiceContext = createContext();

export const useInvoices = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoices must be used within an InvoiceProvider');
  }
  return context;
};

export const InvoiceProvider = ({ children, config = defaultInvoiceConfig }) => {
  const storageKey = config.localStorageKey || 'invoices';
  const [invoices, setInvoices] = useState(() => loadFromStorage(storageKey, []));

  useEffect(() => {
    saveToStorage(storageKey, invoices);
  }, [storageKey, invoices]);

  const addInvoice = (invoiceData) => {
    const nextNumber = generateNextNumber(invoices, config.numberPrefix);
    const newInvoice = {
      ...invoiceData,
      id: Date.now().toString(),
      invoiceNumber: nextNumber,
      rate: parseFloat(invoiceData.rate) || 0,
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = (id, updatedData) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              ...updatedData,
              id,
              invoiceNumber: inv.invoiceNumber,
              rate: parseFloat(updatedData.rate) || 0,
            }
          : inv
      )
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
