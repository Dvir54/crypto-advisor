import React from 'react';
import type { NewsItem } from '../../types/content';
import ContentState from './ContentState';
import VoteButtons from '../VoteButtons';

interface NewsSectionProps {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
  getVote: (contentType: string, contentId: string) => boolean | null;
  updateVote: (contentType: string, contentId: string, isUpvote: boolean | null) => void;
}

/**
 * Section component for displaying cryptocurrency news
 */
const NewsSection: React.FC<NewsSectionProps> = ({
  news,
  loading,
  error,
  getVote,
  updateVote,
}) => {
  return (
    <div className="dashboard-section news-section">
      <div className="section-header">
        <h3>📰 Market News</h3>
        <span className="section-badge">Latest</span>
      </div>
      <div className="section-content">
        <ContentState
          loading={loading}
          error={error}
          isEmpty={news.length === 0}
          loadingMessage="Loading market news..."
          emptyMessage="No news available"
          emptyIcon="📰"
        >
          <div className="news-list">
            {news.map((item) => (
              <div key={item.id} className="news-item-wrapper">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-item"
                >
                  <div className="news-content">
                    <h4 className="news-title">{item.title}</h4>
                    <div className="news-meta">
                      <span className="news-source">{item.source}</span>
                      <span className="news-separator">•</span>
                      <span className="news-time">
                        {new Date(item.published_at).toLocaleDateString()}
                      </span>
                      {item.currencies.length > 0 && (
                        <>
                          <span className="news-separator">•</span>
                          <div className="news-currencies">
                            {item.currencies.slice(0, 3).map((currency) => (
                              <span key={currency} className="currency-tag">
                                {currency}
                              </span>
                            ))}
                            {item.currencies.length > 3 && (
                              <span className="currency-tag">
                                +{item.currencies.length - 3}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="news-arrow">→</span>
                </a>
                <div className="news-vote-container" onClick={(e) => e.stopPropagation()}>
                  <VoteButtons
                    contentType="news"
                    contentId={item.id}
                    initialVote={getVote('news', item.id)}
                    onVoteChange={(isUpvote) => updateVote('news', item.id, isUpvote)}
                  />
                </div>
              </div>
            ))}
          </div>
        </ContentState>
      </div>
    </div>
  );
};

export default NewsSection;

