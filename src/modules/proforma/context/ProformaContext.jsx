/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { generateNextNumber } from '../../../core/utils';
import defaultProformaConfig from '../proformaConfig';

const ProformaContext = createContext();

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
  const [proformaInvoices, setProformaInvoices] = useState(() => loadFromStorage(config.localStorageKey));
  const isLoading = false;

  useEffect(() => {
    saveToStorage(config.localStorageKey, proformaInvoices);
  }, [proformaInvoices, config.localStorageKey]);

  const addProforma = (proformaData) => {
    const nextNumber = generateNextNumber(proformaInvoices, config.numberPrefix);
    const newProforma = {
      ...proformaData,
      id: Date.now().toString(),
      invoiceNumber: nextNumber,
      createdDate: proformaData.createdDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setProformaInvoices((prev) => [newProforma, ...prev]);
    return newProforma;
  };

  const updateProforma = (id, updatedData) => {
    setProformaInvoices((prev) =>
      prev.map((pi) => (pi.id === id ? { ...pi, ...updatedData } : pi))
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
        isLoading,
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
