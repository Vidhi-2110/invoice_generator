/**
 * Auth Service (Pure LocalStorage / Standalone)
 * Provides authentication using browser localStorage (No Backend required).
 */

const STORAGE_USERS_KEY = 'invosaas_users_db';
const STORAGE_SESSION_KEY = 'invosaas_auth_session';

const DEFAULT_USERS = [
  {
    id: 'user-admin-1',
    name: 'Admin User',
    email: 'admin@invosaas.com',
    password: 'password123',
    company: 'InvoSaaS Corp'
  }
];

const getStoredUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading users from storage:', err);
    return DEFAULT_USERS;
  }
};

const saveStoredUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to storage:', err);
  }
};

export const authService = {
  /**
   * Log in user with credentials
   */
  login: async ({ email, password, rememberMe = true }) => {
    const users = getStoredUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!user || user.password !== password) {
      throw new Error('Invalid email or password');
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    const sessionData = {
      user: userWithoutPassword,
      token: `mock_jwt_token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      expiresAt: rememberMe ? Date.now() + 7 * 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
    return sessionData;
  },

  /**
   * Register a new user
   */
  register: async ({ name, email, password, company = '' }) => {
    const users = getStoredUsers();
    const existing = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (existing) {
      throw new Error('User with this email already exists.');
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      company: company.trim()
    };

    users.push(newUser);
    saveStoredUsers(users);

    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    const sessionData = {
      user: userWithoutPassword,
      token: `mock_jwt_token_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
    return sessionData;
  },

  /**
   * Get active session from storage
   */
  getCurrentSession: async () => {
    try {
      const data = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!data) return null;

      const session = JSON.parse(data);
      if (session.expiresAt && Date.now() > session.expiresAt) {
        localStorage.removeItem(STORAGE_SESSION_KEY);
        return null;
      }
      return session;
    } catch (err) {
      console.error('Error fetching session:', err);
      return null;
    }
  },

  /**
   * Log out active user
   */
  logout: async () => {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  },

  /**
   * Helper to get Bearer token for authentication state
   */
  getToken: () => {
    try {
      const data = localStorage.getItem(STORAGE_SESSION_KEY);
      if (!data) return null;
      return JSON.parse(data).token;
    } catch {
      return null;
    }
  },

  /**
   * Update user profile information
   */
  updateProfile: async (updatedFields) => {
    const data = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!data) throw new Error('Not authenticated');
    const session = JSON.parse(data);

    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === session.user.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedFields };
      saveStoredUsers(users);
    }

    session.user = { ...session.user, ...updatedFields };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
    return session.user;
  }
};

export default authService;
