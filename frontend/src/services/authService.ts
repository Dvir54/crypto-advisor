import api from './api';
import { User, LoginCredentials, SignupCredentials, TokenResponse } from '../types/auth';

/**
 * Login user and return access token
 */
export const loginUser = async (credentials: LoginCredentials): Promise<TokenResponse> => {
  const response = await api.post<TokenResponse>('/auth/login', credentials);
  return response.data;
};

/**
 * Register new user and return access token
 */
export const signupUser = async (credentials: SignupCredentials): Promise<TokenResponse> => {
  const response = await api.post<TokenResponse>('/auth/signup', credentials);
  return response.data;
};

/**
 * Get current authenticated user information
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

/**
 * Store token in localStorage
 */
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

