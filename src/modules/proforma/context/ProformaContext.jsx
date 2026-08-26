/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage } from '../../../core/storage';
import { generateNextNumber } from '../../../core/utils';
import defaultProformaConfig from '../proformaConfig';

const ProformaContext = createContext();

export const useProforma = () => {
  const context = useContext(ProformaContext);
  if (!context) {
    throw new Error('useProforma must be used within a ProformaProvider');
  }
  return context;
};

export const useProformaInvoices = useProforma;

export const ProformaProvider = ({ children, config = defaultProformaConfig }) => {
  const storageKey = config.localStorageKey || 'proforma_invoices';
  const [proformaInvoices, setProformaInvoices] = useState(() =>
    loadFromStorage(storageKey, [])
  );

  useEffect(() => {
    saveToStorage(storageKey, proformaInvoices);
  }, [storageKey, proformaInvoices]);

  const addProforma = (proformaData) => {
    const nextNumber = generateNextNumber(proformaInvoices, config.numberPrefix);
    const newProforma = {
      ...proformaData,
      id: Date.now().toString(),
      invoiceNumber: nextNumber,
      rate: parseFloat(proformaData.rate) || 0,
    };
    setProformaInvoices((prev) => [newProforma, ...prev]);
    return newProforma;
  };

  const updateProforma = (id, updatedData) => {
    setProformaInvoices((prev) =>
      prev.map((pi) =>
        pi.id === id
          ? {
              ...pi,
              ...updatedData,
              id,
              invoiceNumber: pi.invoiceNumber,
              rate: parseFloat(updatedData.rate) || 0,
            }
          : pi
      )
    );
  };

  const deleteProforma = (id) => {
    setProformaInvoices((prev) => prev.filter((pi) => pi.id !== id));
  };

  const getProforma = (id) => {
    return proformaInvoices.find((pi) => pi.id === id);
  };

  return (
    <ProformaContext.Provider
      value={{
        proformaInvoices,
        addProforma,
        updateProforma,
        deleteProforma,
        getProforma,
        config,
      }}
    >
      {children}
    </ProformaContext.Provider>
  );
};
