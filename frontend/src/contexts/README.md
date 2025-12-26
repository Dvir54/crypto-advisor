# Auth Context

The AuthContext provides authentication state management for the application.

## Features

- User authentication state management
- Login and signup functionality
- Automatic token persistence in localStorage
- Token auto-injection in API requests (via axios interceptor)
- User data fetching and caching
- Logout functionality

## Setup

The AuthProvider is already set up in `main.tsx` wrapping the entire app:

```tsx
import { AuthProvider } from './contexts/AuthContext'

<AuthProvider>
  <App />
</AuthProvider>
```

## Usage

### Using the Auth Hook

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, signup, logout, refreshUser } = useAuth();

  // Check authentication status
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Login Example

```tsx
const handleLogin = async () => {
  try {
    await login({ email: 'user@example.com', password: 'password123' });
    // User is now logged in, navigate or update UI
  } catch (error) {
    console.error('Login failed:', error);
    // Handle error (show message to user)
  }
};
```

### Signup Example

```tsx
const handleSignup = async () => {
  try {
    await signup({ 
      email: 'user@example.com', 
      password: 'password123',
      name: 'John Doe'
    });
    // User is now registered and logged in
  } catch (error) {
    console.error('Signup failed:', error);
    // Handle error (show message to user)
  }
};
```

### Protected Routes Example

```tsx
import { useAuth } from './contexts/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
```

## API Reference

### AuthContext Values

- `user: User | null` - Current authenticated user data
- `isAuthenticated: boolean` - Whether a user is logged in
- `isLoading: boolean` - Whether authentication state is being initialized
- `login(credentials): Promise<void>` - Log in with email and password
- `signup(credentials): Promise<void>` - Register a new user
- `logout(): void` - Log out the current user
- `refreshUser(): Promise<void>` - Refresh current user data

### User Type

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  onboarding_complete: boolean;
  created_at: string;
}
```

## How It Works

1. **Initialization**: On app load, the AuthProvider checks localStorage for a token
2. **Token Found**: If a token exists, it fetches user data from `/auth/me`
3. **Auto-Injection**: The axios interceptor automatically adds the token to all API requests
4. **Login/Signup**: Stores the token and fetches user data
5. **Logout**: Removes the token and clears user data

## Example Component

See `components/AuthExample.tsx` for a complete working example.

