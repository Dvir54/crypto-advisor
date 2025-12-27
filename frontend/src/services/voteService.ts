import api from './api';
import type { VoteCreate, Vote } from '../types/vote';

/**
 * Submit a vote for content (creates new or updates existing)
 */
export const submitVote = async (voteData: VoteCreate): Promise<Vote> => {
  const response = await api.post('/vote', voteData);
  return response.data;
};

/**
 * Get all votes for the current user
 */
export const getUserVotes = async (): Promise<Vote[]> => {
  const response = await api.get('/votes');
  return response.data;
};

