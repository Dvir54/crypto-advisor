import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type {
  User,
  LoginCredentials,
  SignupCredentials,
  AuthContextType,
} from '../types/auth';
import {
  loginUser,
  signupUser,
  getCurrentUser,
  setToken,
  getToken,
  removeToken,
} from '../services/authService';

//create a new context (the storage box)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

//create a new provider (the box that holds the data)
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load user data from token on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to load user:', error);
          // If token is invalid, remove it
          removeToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login user with email and password
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      const tokenResponse = await loginUser(credentials);
      setToken(tokenResponse.access_token);
      
      // Fetch user data
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Register new user
   */
  const signup = async (credentials: SignupCredentials): Promise<void> => {
    try {
      const tokenResponse = await signupUser(credentials);
      setToken(tokenResponse.access_token);
      
      // Fetch user data
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = (): void => {
    removeToken();
    setUser(null);
  };

  /**
   * Refresh user data
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout
      logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

