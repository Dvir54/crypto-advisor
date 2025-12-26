import api from './api';
import type { Preferences, PreferencesRequest } from '../types/preferences';

/**
 * Save user preferences
 */
export const savePreferences = async (
  preferences: PreferencesRequest
): Promise<Preferences> => {
  const response = await api.post<Preferences>('/user/preferences', preferences);
  return response.data;
};

/**
 * Get user preferences
 */
export const getPreferences = async (): Promise<Preferences> => {
  const response = await api.get<Preferences>('/user/preferences');
  return response.data;
};

