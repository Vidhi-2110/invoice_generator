/**
 * Auth Service (Standalone & Reusable)
 * Provides authentication API abstraction with local storage persistence and mock network latency.
 * Can easily be swapped with real REST API or Firebase/Supabase endpoints.
 */

const STORAGE_USERS_KEY = 'invosaas_auth_users';
const STORAGE_SESSION_KEY = 'invosaas_auth_session';

// Default seed user for instant testing
const DEFAULT_USERS = [
  {
    id: 'user-admin-01',
    name: 'Alex Morgan',
    email: 'admin@invosaas.com',
    password: 'password123', // In production, this would be hashed on backend
    role: 'Admin',
    company: 'InvoSaaS Corp',
    avatar: null,
    createdAt: new Date().toISOString()
  }
];

// Helper to get stored users
const getStoredUsers = () => {
  try {
    const data = localStorage.getItem(STORAGE_USERS_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading auth users from localStorage:', err);
    return DEFAULT_USERS;
  }
};

// Helper to save users
const saveStoredUsers = (users) => {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving auth users to localStorage:', err);
  }
};

// Simulated API latency helper
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  /**
   * Log in user with credentials
   */
  login: async ({ email, password, rememberMe = true }) => {
    await delay(350);
    const users = getStoredUsers();
    const cleanEmail = email.trim().toLowerCase();

    const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      throw new Error('No account found with this email address.');
    }

    if (foundUser.password !== password) {
      throw new Error('Invalid email or password.');
    }

    // Strip password before returning user object
    const { password: _, ...userSession } = foundUser;
    const sessionToken = `jwt_mock_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    const sessionData = {
      user: userSession,
      token: sessionToken,
      expiresAt: rememberMe ? Date.now() + 7 * 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000
    };

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(sessionData));
    return sessionData;
  },

  /**
   * Register a new user
   */
  register: async ({ name, email, password, company = '' }) => {
    await delay(450);
    const users = getStoredUsers();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: 'Member',
      company: company.trim() || 'My Business',
      avatar: null,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveStoredUsers(users);

    // Automatically log in after registration
    const { password: _, ...userSession } = newUser;
    const sessionToken = `jwt_mock_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    const sessionData = {
      user: userSession,
      token: sessionToken,
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
    await delay(150);
    localStorage.removeItem(STORAGE_SESSION_KEY);
  },

  /**
   * Update current user profile
   */
  updateProfile: async (updatedData) => {
    await delay(300);
    const session = await authService.getCurrentSession();
    if (!session) throw new Error('No active user session');

    const users = getStoredUsers();
    const userIndex = users.findIndex((u) => u.id === session.user.id);

    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updatedData };
      saveStoredUsers(users);
    }

    const updatedUser = { ...session.user, ...updatedData };
    delete updatedUser.password;

    const newSession = { ...session, user: updatedUser };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(newSession));
    return updatedUser;
  }
};

export default authService;
