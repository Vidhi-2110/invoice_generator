const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

/**
 * Register a new user account
 * @param {{ name: string, email: string, password: string, company?: string }} payload
 * @returns {{ user: object, token: string }}
 */
export const registerApi = (payload) =>
  fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handle);

/**
 * Sign in with email and password
 * @param {{ email: string, password: string }} payload
 * @returns {{ user: object, token: string }}
 */
export const loginApi = (payload) =>
  fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then(handle);

/**
 * Fetch the current authenticated user using a stored JWT token
 * @param {string} token
 * @returns {{ user: object }}
 */
export const getMeApi = (token) =>
  fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(handle);

/**
 * Update the current user's profile (name, email, password, avatar)
 * @param {object} payload - { name?, email?, currentPassword?, newPassword?, avatar? }
 * @param {string} token
 * @returns {{ user: object }}
 */
export const updateProfileApi = (payload, token) =>
  fetch(`${BASE}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }).then(handle);


/**
 * Save company logo, e-sign and stamp on the server (used in emailed PDFs)
 * @param {object} payload - { logo?, esign?, stamp? } base64 data URLs or null
 * @param {string} token
 * @returns {{ success: boolean }}
 */
export const updateCompanyAssetsApi = (payload, token) =>
  fetch(`${BASE}/api/auth/company-assets`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  }).then(handle);
