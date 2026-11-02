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

/** Fetch the SAC code master list */
export const fetchSacCodes = () =>
  fetch(`${BASE}/api/sac-codes`, {
    headers: getAuthHeaders(),
  }).then(handle);
