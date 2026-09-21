const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
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

/** Fetch all proforma invoices for authenticated user */
export const fetchProformas = () =>
  fetch(`${BASE}/api/proformas`, {
    headers: getAuthHeaders(),
  }).then(handle);

/** Create a new proforma invoice */
export const createProforma = (proforma) =>
  fetch(`${BASE}/api/proformas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(proforma),
  }).then(handle);

/** Update an existing proforma invoice by id */
export const updateProformaApi = (id, data) =>
  fetch(`${BASE}/api/proformas/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }).then(handle);

/** Delete a proforma invoice by id */
export const deleteProformaApi = (id) =>
  fetch(`${BASE}/api/proformas/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(handle);
