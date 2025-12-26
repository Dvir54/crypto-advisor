# Components

This directory contains reusable components for the Crypto Advisor application.

## ProtectedRoute

A wrapper component that protects routes requiring authentication.

### Purpose

The `ProtectedRoute` component ensures that only authenticated users can access certain pages. It provides a seamless user experience by:
- Showing a loading state while checking authentication
- Redirecting unauthenticated users to the login page
- Preserving the intended destination for post-login redirect
- Rendering protected content for authenticated users

### Features

- **Authentication Check**: Uses the `useAuth` hook to check if user is authenticated
- **Loading State**: Displays a beautiful loading spinner while checking auth status
- **Automatic Redirect**: Redirects to `/login` if user is not authenticated
- **Location Preservation**: Saves the intended destination in the location state
- **Protected Content**: Renders children only when user is authenticated

### Usage

```tsx
import { ProtectedRoute } from './components';
import { DashboardPage } from './pages';

// Wrap any route that requires authentication
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### How It Works

1. **Loading State**: When the component mounts, it checks `isLoading` from AuthContext
   - If `true`, displays a loading spinner
   - This prevents flickering between states

2. **Authentication Check**: Once loading is complete, it checks `isAuthenticated`
   - If `false`, redirects to `/login`
   - Saves current location in state for post-login redirect

3. **Render Protected Content**: If authenticated, renders the children

### Post-Login Redirect (Future Enhancement)

The component saves the intended destination in the location state:

```tsx
<Navigate to="/login" state={{ from: location }} replace />
```

You can use this in your LoginPage to redirect users back after successful login:

```tsx
const location = useLocation();
const from = location.state?.from?.pathname || '/dashboard';

// After successful login:
navigate(from, { replace: true });
```

### Styling

The loading state uses a gradient background matching the app theme with:
- Centered spinner with smooth rotation animation
- Pulsing "Loading..." text
- Consistent purple gradient (#667eea to #764ba2)

### Example Implementation

```tsx
// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components';
import { LoginPage, DashboardPage, ProfilePage } from './pages';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| children | ReactNode | Yes | The protected content to render when authenticated |

### Dependencies

- `react-router-dom`: For navigation and location handling
- `AuthContext`: For authentication state management

---

## AuthExample

An example component demonstrating how to use the AuthContext in your components.

### Features

- Shows how to access user data
- Demonstrates login/signup functionality
- Shows how to handle logout
- Example of checking authentication status

### Usage

See the component file for implementation details. This is primarily for reference and can be removed in production.

