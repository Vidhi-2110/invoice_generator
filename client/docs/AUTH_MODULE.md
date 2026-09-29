# Auth Module Documentation

**Location**: `src/modules/auth/`  
**Route**: `/login`, `/register`  
**Status**: Fully integrated — JWT + MongoDB backend  

---

## 1. Overview

The **Auth Module** provides end-to-end user authentication, profile management, and route protection for the InvoSaaS application. All billing documents (invoices, proformas, clients) are scoped to the authenticated user's ID (`user.id`), ensuring complete tenant data isolation.

### Key Capabilities
- **JWT Session Persistence**: Bearer tokens are stored in `localStorage` under `invosaas_auth_token` and restored on application boot.
- **Auto Header Injection**: Authenticated requests automatically attach the `Authorization: Bearer <token>` header via `authService.getAuthHeaders()`.
- **Protected Routing**: `<ProtectedRoute>` prevents unauthorized access to app routes (`/dashboard`, `/invoice`, etc.), showing a loading spinner during session resolution and redirecting unauthenticated users to `/login`.
- **User Avatar Support**: Registration and profile updates support image uploading and cropping with `react-easy-crop`.
- **Offline / Graceful Fallback**: If backend is unavailable, error states are surfaced cleanly.

---

## 2. Directory Structure

```text
src/modules/auth/
├── components/
│   ├── AuthCard.jsx           # Clean card wrapper with branding for auth pages
│   ├── ImageCropper.jsx       # Modal image cropper based on react-easy-crop
│   ├── LoginForm.jsx          # Email + password form with validation & submit
│   ├── ProtectedRoute.jsx     # Route guard component for React Router
│   ├── RegisterForm.jsx       # Registration form with avatar upload & validation
│   └── UserDropdown.jsx       # Profile avatar dropdown in top navbar (profile, logout)
├── context/
│   └── AuthContext.jsx        # Auth state provider and useAuth hook
├── pages/
│   ├── AuthPage.jsx           # Combined / legacy auth page
│   ├── LoginPage.jsx          # Dedicated login page (/login)
│   └── RegisterPage.jsx       # Dedicated register page (/register)
├── services/
│   └── authService.js         # API communication & localStorage token manager
└── index.js                   # Barrel exports for the module
```

---

## 3. Public API & Barrel Exports (`index.js`)

You can import any part of the auth module directly from `src/modules/auth`:

```javascript
import { 
  AuthProvider, 
  useAuth, 
  authService, 
  ProtectedRoute, 
  LoginForm, 
  RegisterForm, 
  UserDropdown, 
  LoginPage, 
  RegisterPage 
} from '../modules/auth';
```

---

## 4. State Management: `AuthContext`

### Context Value (`useAuth()`)

| Property / Method | Type | Description |
|---|---|---|
| `user` | `Object \| null` | Authenticated user profile `{ id, name, email, avatar, companyName, role, ... }` |
| `token` | `string \| null` | Raw JWT string stored in localStorage |
| `isAuthenticated` | `boolean` | `true` if `user` is non-null |
| `isLoading` | `boolean` | Initializing session or executing async auth request |
| `error` | `string \| null` | Error message from failed login/registration attempt |
| `login(email, password)` | `Function` | Logs in user, saves token, returns user object |
| `register(userData)` | `Function` | Creates new account, saves token, returns user object |
| `logout()` | `Function` | Clears token from localStorage and resets user state to `null` |
| `updateProfile(data)` | `Function` | Sends profile updates to backend and updates context `user` |
| `clearError()` | `Function` | Resets `error` to `null` |

### Usage Example

```jsx
import { useAuth } from '../modules/auth';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Please log in.</p>;
  }

  return (
    <div>
      <p>Welcome back, {user.name} ({user.email})</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
};
```

---

## 5. Service Layer: `authService.js`

`authService` abstracts all HTTP operations to `/api/auth`:

| Method | Endpoint | Description |
|---|---|---|
| `login({ email, password })` | `POST /api/auth/login` | Authenticates credentials, returns `{ token, user }` |
| `register(formData)` | `POST /api/auth/register` | Registers new user, returns `{ token, user }` |
| `getCurrentSession()` | `GET /api/auth/me` | Validates current token, returns refreshed `{ token, user }` |
| `updateProfile(data)` | `PUT /api/auth/profile` | Updates user details (name, company, avatar, etc.) |
| `logout()` | Local storage clear | Removes `invosaas_auth_token` |
| `getToken()` | Local | Returns JWT string from `localStorage` |
| `getAuthHeaders()` | Local | Returns `{ Authorization: 'Bearer <token>', 'Content-Type': 'application/json' }` |

---

## 6. Route Guard: `ProtectedRoute.jsx`

Protects pages requiring an active session:

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
```

---

## 7. Multi-User Isolation Pattern

Other modules (`InvoiceContext`, `ProformaContext`, `ClientContext`) depend on `useAuth()` to isolate data:

```javascript
const { user } = useAuth();
const storageKey = user?.id ? `invoices_${user.id}` : 'invoices';
```

When a user logs out or switches accounts:
1. `user.id` changes.
2. Contexts re-fetch from `/api/invoices`, `/api/proformas`, and `/api/clients`.
3. The server filters documents using `req.user.id` from the JWT token.
4. No user ever sees or modifies another user's financial records.
