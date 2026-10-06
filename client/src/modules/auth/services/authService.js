/**
 * Auth Service — wires the auth API to localStorage session persistence.
 * All user data is stored in MongoDB via the backend.
 * JWT token is stored in localStorage to restore session on page refresh.
 */

import { loginApi, registerApi, getMeApi, updateProfileApi } from '../../../api/authApi';

const STORAGE_TOKEN_KEY = 'invosaas_auth_token';
const BASE_SETTINGS_KEY = 'invosaas_company_settings';

const getStoredToken = () => {
  try {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  } catch {
    return null;
  }
};

const saveToken = (token) => {
  try {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to save token:', err);
  }
};

const clearToken = () => {
  try {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  } catch (err) {
    console.error('Failed to clear token:', err);
  }
};

/** Removes the company settings that were saved for a specific user */
const clearUserSettings = (userId) => {
  try {
    if (userId) {
      localStorage.removeItem(`${BASE_SETTINGS_KEY}_${userId}`);
    }
  } catch (err) {
    console.error('Failed to clear user settings:', err);
  }
};

export const authService = {
  /**
   * Sign in user — calls backend, stores JWT in localStorage
   */
  login: async ({ email, password }) => {
    const data = await loginApi({ email, password });
    saveToken(data.token);
    return { user: data.user, token: data.token };
  },

  /**
   * Register new user — calls backend, stores JWT in localStorage
   */
  register: async ({ name, email, password, company = '' }) => {
    const data = await registerApi({ name, email, password, company });
    saveToken(data.token);
    return { user: data.user, token: data.token };
  },

  /**
   * Restore active session using stored JWT — verifies with backend
   * Returns null if token is missing or expired
   */
  getCurrentSession: async () => {
    const token = getStoredToken();
    if (!token) return null;

    try {
      const data = await getMeApi(token);
      return { user: data.user, token };
    } catch {
      // Token expired or invalid — clean up
      clearToken();
      return null;
    }
  },

  /**
   * Sign out — clears stored token
   */
  logout: async (userId) => {
    // Clear the per-user company settings before removing the token
    // so we still know which key to clean up
    if (userId) clearUserSettings(userId);
    clearToken();
  },

  /**
   * Returns stored JWT token (for attaching to API requests)
   */
  getToken: () => getStoredToken(),

  /**
   * Update user profile — name, email, password, avatar
   */
  updateProfile: async (updatedFields) => {
    const token = getStoredToken();
    if (!token) throw new Error('Not authenticated.');
    const data = await updateProfileApi(updatedFields, token);
    return data.user;
  },
};

export default authService;
