/**
 * Reusable Auth Module Barrel Export
 * Easily drop this module into any React project.
 */

// Provider & Hook
export { AuthProvider, useAuth } from './context/AuthContext';

// Service API layer
export { default as authService } from './services/authService';

// Route Guard & UI Components
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { default as LoginForm } from './components/LoginForm';
export { default as RegisterForm } from './components/RegisterForm';
export { default as AuthCard } from './components/AuthCard';
export { default as UserDropdown } from './components/UserDropdown';

// Page Views
export { default as LoginPage } from './pages/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage';
export { default as AuthPage } from './pages/AuthPage';
