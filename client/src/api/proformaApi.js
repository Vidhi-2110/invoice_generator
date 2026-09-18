const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API request failed');
  return data;
};

/** Fetch all proforma invoices */
export const fetchProformas = () =>
  fetch(`${BASE}/api/proformas`).then(handle);

/** Create a new proforma invoice */
export const createProforma = (proforma) =>
  fetch(`${BASE}/api/proformas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proforma),
  }).then(handle);

/** Update an existing proforma invoice by id */
export const updateProformaApi = (id, data) =>
  fetch(`${BASE}/api/proformas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handle);

/** Delete a proforma invoice by id */
export const deleteProformaApi = (id) =>
  fetch(`${BASE}/api/proformas/${id}`, {
    method: 'DELETE',
  }).then(handle);
