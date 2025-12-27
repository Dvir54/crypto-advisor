import React, { useState } from 'react';
import { submitVote } from '../services/voteService';
import type { ContentType } from '../types/vote';
import './VoteButtons.css';

interface VoteButtonsProps {
  contentType: ContentType;
  contentId: string;
  initialVote?: boolean | null; // true = upvote, false = downvote, null = no vote
  onVoteChange?: (isUpvote: boolean | null) => void;
}

/**
 * VoteButtons Component
 * Displays thumbs up/down buttons for voting on content
 */
const VoteButtons: React.FC<VoteButtonsProps> = ({
  contentType,
  contentId,
  initialVote = null,
  onVoteChange,
}) => {
  const [currentVote, setCurrentVote] = useState<boolean | null>(initialVote);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async (isUpvote: boolean) => {
    // If clicking the same vote, toggle it off (remove vote)
    // For now, we'll just update to the new vote
    // Note: Backend doesn't support removing votes, only updating
    
    setIsLoading(true);
    try {
      await submitVote({
        content_type: contentType,
        content_id: contentId,
        is_upvote: isUpvote,
      });
      
      setCurrentVote(isUpvote);
      onVoteChange?.(isUpvote);
    } catch (error) {
      console.error('Failed to submit vote:', error);
      // Optionally show error toast/notification
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vote-buttons" role="group" aria-label="Vote on this content">
      <button
        className={`vote-button vote-up ${currentVote === true ? 'active' : ''}`}
        onClick={() => handleVote(true)}
        disabled={isLoading}
        title="Thumbs up"
        aria-label={currentVote === true ? "Upvoted" : "Upvote"}
        aria-pressed={currentVote === true}
      >
        👍
      </button>
      <button
        className={`vote-button vote-down ${currentVote === false ? 'active' : ''}`}
        onClick={() => handleVote(false)}
        disabled={isLoading}
        title="Thumbs down"
        aria-label={currentVote === false ? "Downvoted" : "Downvote"}
        aria-pressed={currentVote === false}
      >
        👎
      </button>
    </div>
  );
};

export default VoteButtons;

