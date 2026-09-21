/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { generateNextNumber } from '../../../core/utils';
import { useAuth } from '../../auth';
import defaultClientConfig from '../clientConfig';
import {
  fetchClients,
  createClient,
  updateClientApi,
  deleteClientApi,
} from '../../../api/clientApi';

const ClientContext = createContext();

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

export const useClients = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};

export const ClientProvider = ({ children, config = defaultClientConfig }) => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const storageKey = user?.id
    ? `${config.localStorageKey}_${user.id}`
    : config.localStorageKey;

  // ── Load clients from MongoDB for current user ─────────────────────────────
  const loadClients = useCallback(async () => {
    if (!localStorage.getItem('auth_token')) {
      setClients([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchClients();
      setClients(data);
      saveToStorage(storageKey, data);
    } catch (err) {
      console.warn('⚠️ Could not reach backend, loading from localStorage:', err.message);
      setError(err.message);
      setClients(loadFromStorage(storageKey));
    } finally {
      setIsLoading(false);
    }
  }, [storageKey]);

  useEffect(() => {
    loadClients();
  }, [loadClients, user?.id]);

  // ── Add client (auto generates CLT-0001, CLT-0002 unique ID) ───────────────
  const addClient = async (clientData) => {
    const nextNumber = generateNextNumber(clients, config.numberPrefix);
    const payload = {
      ...clientData,
      clientId: clientData.clientId || nextNumber,
      invoiceNumber: nextNumber,
      createdAt: new Date().toISOString(),
    };

    try {
      const saved = await createClient(payload);
      setClients((prev) => {
        const updated = [saved, ...prev];
        saveToStorage(storageKey, updated);
        return updated;
      });
      return saved;
    } catch (err) {
      console.error('Failed to save client to MongoDB:', err.message);
      const localClient = { ...payload, id: Date.now().toString() };
      setClients((prev) => {
        const updated = [localClient, ...prev];
        saveToStorage(storageKey, updated);
        return updated;
      });
      return localClient;
    }
  };

  // ── Update client ─────────────────────────────────────────────────────────
  const updateClient = async (id, updatedData) => {
    try {
      const saved = await updateClientApi(id, updatedData);
      setClients((prev) => {
        const updated = prev.map((c) => (c.id === id ? saved : c));
        saveToStorage(storageKey, updated);
        return updated;
      });
    } catch (err) {
      console.error('Failed to update client in MongoDB:', err.message);
      setClients((prev) => {
        const updated = prev.map((c) =>
          c.id === id ? { ...c, ...updatedData } : c
        );
        saveToStorage(storageKey, updated);
        return updated;
      });
    }
  };

  // ── Delete client ─────────────────────────────────────────────────────────
  const deleteClient = async (id) => {
    try {
      await deleteClientApi(id);
    } catch (err) {
      console.error('Failed to delete client from MongoDB:', err.message);
    }
    setClients((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveToStorage(storageKey, updated);
      return updated;
    });
  };

  const getClient = (id) => clients.find((c) => c.id === id);

  return (
    <ClientContext.Provider
      value={{
        clients,
        isLoading,
        error,
        addClient,
        updateClient,
        deleteClient,
        getClient,
        config,
        reload: loadClients,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};
