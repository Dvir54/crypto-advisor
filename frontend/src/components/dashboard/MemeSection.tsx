import React from 'react';
import type { Meme } from '../../types/content';
import ContentState from './ContentState';
import VoteButtons from '../VoteButtons';

interface MemeSectionProps {
  meme: Meme | null;
  loading: boolean;
  error: string | null;
  getVote: (contentType: string, contentId: string) => boolean | null;
  updateVote: (contentType: string, contentId: string, isUpvote: boolean | null) => void;
}

/**
 * Section component for displaying crypto memes
 */
const MemeSection: React.FC<MemeSectionProps> = ({
  meme,
  loading,
  error,
  getVote,
  updateVote,
}) => {
  return (
    <div className="dashboard-section meme-section">
      <div className="section-header">
        <h3>😂 Crypto Meme</h3>
        <span className="section-badge">Fun</span>
      </div>
      <div className="section-content">
        <ContentState
          loading={loading}
          error={error}
          isEmpty={!meme}
          loadingMessage="Loading meme..."
          emptyMessage="No meme available"
          emptyIcon="😂"
        >
          {meme && (
            <div className="meme-card">
              <div className="meme-image-container">
                <img 
                  src={meme.image_url} 
                  alt={meme.title} 
                  className="meme-image"
                  loading="lazy"
                />
              </div>
              <div className="meme-info">
                <h4 className="meme-title">{meme.title}</h4>
                <p className="meme-caption">{meme.caption}</p>
                {meme.tags.length > 0 && (
                  <div className="meme-tags">
                    {meme.tags.map((tag) => (
                      <span key={tag} className="meme-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="meme-vote-container">
                <VoteButtons
                  contentType="meme"
                  contentId={meme.id}
                  initialVote={getVote('meme', meme.id)}
                  onVoteChange={(isUpvote) => updateVote('meme', meme.id, isUpvote)}
                />
              </div>
            </div>
          )}
        </ContentState>
      </div>
    </div>
  );
};

export default MemeSection;

