const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API request failed');
  return data;
};

/** Fetch all invoices from the backend */
export const fetchInvoices = () =>
  fetch(`${BASE}/api/invoices`).then(handle);

/** Create a new invoice */
export const createInvoice = (invoice) =>
  fetch(`${BASE}/api/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice),
  }).then(handle);

/** Update an existing invoice by id */
export const updateInvoiceApi = (id, data) =>
  fetch(`${BASE}/api/invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);

/** Delete an invoice by id */
export const deleteInvoiceApi = (id) =>
  fetch(`${BASE}/api/invoices/${id}`, {
    method: 'DELETE',
  }).then(handle);
