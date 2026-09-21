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

/** Fetch all clients for authenticated user */
export const fetchClients = () =>
  fetch(`${BASE}/api/clients`, {
    headers: getAuthHeaders(),
  }).then(handle);

/** Create a new client */
export const createClient = (client) =>
  fetch(`${BASE}/api/clients`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(client),
  }).then(handle);

/** Update an existing client by id */
export const updateClientApi = (id, data) =>
  fetch(`${BASE}/api/clients/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  }).then(handle);

/** Delete a client by id */
export const deleteClientApi = (id) =>
  fetch(`${BASE}/api/clients/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  }).then(handle);
