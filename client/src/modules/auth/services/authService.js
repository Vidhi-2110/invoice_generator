/**
 * Auth Service — wires the auth API to localStorage session persistence.
 * All user data is stored in MongoDB via the backend.
 * JWT token is stored in localStorage to restore session on page refresh.
 */

import { loginApi, registerApi, getMeApi } from '../../../api/authApi';

const STORAGE_TOKEN_KEY = 'invosaas_auth_token';

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
  logout: async () => {
    clearToken();
  },

  /**
   * Returns stored JWT token (for attaching to API requests)
   */
  getToken: () => getStoredToken(),

  /**
   * Update user profile — placeholder for future backend integration
   */
  updateProfile: async (updatedFields) => {
    // TODO: implement PUT /api/auth/profile
    console.warn('updateProfile not yet wired to backend:', updatedFields);
    return updatedFields;
  },
};

export default authService;
