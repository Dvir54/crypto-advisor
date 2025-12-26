import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Example component demonstrating how to use the AuthContext
 * This shows login, signup, and logout functionality
 */
const AuthExample: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, signup, logout } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignupMode) {
        await signup({ email, password, name });
      } else {
        await login({ email, password });
      }
      // Clear form after successful login/signup
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Authentication failed');
      } else {
        setError('Authentication failed');
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && user) {
    return (
      <div>
        <h2>Welcome, {user.name}!</h2>
        <p>Email: {user.email}</p>
        <p>Onboarding Complete: {user.onboarding_complete ? 'Yes' : 'No'}</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <div>
      <h2>{isSignupMode ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isSignupMode && (
          <div>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
          </div>
        )}
        <div>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">{isSignupMode ? 'Sign Up' : 'Login'}</button>
      </form>
      <button onClick={() => setIsSignupMode(!isSignupMode)}>
        {isSignupMode ? 'Switch to Login' : 'Switch to Sign Up'}
      </button>
    </div>
  );
};

export default AuthExample;

