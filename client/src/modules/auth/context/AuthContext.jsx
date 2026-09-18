/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Restore session from stored JWT on mount ─────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authService.getCurrentSession();
        if (session) {
          setUser(session.user);
          setToken(session.token);
        }
      } catch (err) {
        console.error('Failed to initialize auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await authService.login({ email, password });
      setUser(session.user);
      setToken(session.token);
      return session.user;
    } catch (err) {
      const msg = err.message || 'Failed to sign in. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const session = await authService.register(userData);
      setUser(session.user);
      setToken(session.token);
      return session.user;
    } catch (err) {
      const msg = err.message || 'Failed to create account. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Update Profile ───────────────────────────────────────────────────────
  const updateProfile = async (data) => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser((prev) => ({ ...prev, ...updatedUser }));
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
