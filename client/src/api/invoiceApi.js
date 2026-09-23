import authService from '../modules/auth/services/authService';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getAuthHeaders = () => {
  const token = authService.getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API request failed');
  return data;
};

/** Fetch all invoices for the authenticated user */
export const fetchInvoices = () =>
  fetch(`${BASE}/api/invoices`, {
    headers: getAuthHeaders(),
  }).then(handle);

/** Create a new invoice for the authenticated user */
export const createInvoice = (invoice) =>
  fetch(`${BASE}/api/invoices`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(invoice),
  }).then(handle);

/** Update an existing invoice by id */
export const updateInvoiceApi = (id, data) =>
  fetch(`${BASE}/api/invoices/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }).then(handle);

/** Delete an invoice by id */
export const deleteInvoiceApi = (id) =>
  fetch(`${BASE}/api/invoices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(handle);
