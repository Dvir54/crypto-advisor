import { useState, useEffect } from 'react';
import { getUserVotes } from '../services/voteService';
import type { Vote } from '../types/vote';

/**
 * Custom hook to fetch and manage user votes
 * Returns a map of votes keyed by "contentType:contentId"
 */
export const useVotes = () => {
  const [votes, setVotes] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const userVotes = await getUserVotes();
        
        // Create a map of votes for quick lookup
        const voteMap = new Map<string, boolean>();
        userVotes.forEach((vote: Vote) => {
          const key = `${vote.content_type}:${vote.content_id}`;
          voteMap.set(key, vote.is_upvote);
        });
        
        setVotes(voteMap);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch votes:', err);
        setError('Failed to load votes');
      } finally {
        setLoading(false);
      }
    };

    fetchVotes();
  }, []);

  /**
   * Get vote for specific content
   * @param contentType - Type of content (news, meme, insight)
   * @param contentId - Unique identifier for the content
   * @returns true for upvote, false for downvote, null for no vote
   */
  const getVote = (contentType: string, contentId: string): boolean | null => {
    const key = `${contentType}:${contentId}`;
    const vote = votes.get(key);
    return vote !== undefined ? vote : null;
  };

  /**
   * Update vote in local state (optimistic update)
   */
  const updateVote = (contentType: string, contentId: string, isUpvote: boolean | null) => {
    const key = `${contentType}:${contentId}`;
    setVotes((prev) => {
      const newVotes = new Map(prev);
      if (isUpvote === null) {
        newVotes.delete(key);
      } else {
        newVotes.set(key, isUpvote);
      }
      return newVotes;
    });
  };

  return { votes, loading, error, getVote, updateVote };
};

