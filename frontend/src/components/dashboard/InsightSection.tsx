import React from 'react';
import type { AIInsight } from '../../types/content';
import ContentState from './ContentState';

interface InsightSectionProps {
  insight: AIInsight | null;
  loading: boolean;
  error: string | null;
}

/**
 * Section component for displaying AI-generated insights
 */
const InsightSection: React.FC<InsightSectionProps> = ({
  insight,
  loading,
  error,
}) => {
  return (
    <div className="dashboard-section insight-section">
      <div className="section-header">
        <h3>🤖 AI Insight</h3>
        <span className="section-badge">AI</span>
      </div>
      <div className="section-content">
        <ContentState
          loading={loading}
          error={error}
          isEmpty={!insight}
          loadingMessage="Generating AI insight..."
          emptyMessage="No insight available"
          emptyIcon="🤖"
        >
          {insight && (
            <div className="insight-card">
              <div className="insight-content">
                <p className="insight-text">{insight.insight}</p>
              </div>
              <div className="insight-footer">
                <div className="insight-meta">
                  <span className="insight-source">
                    {insight.source === 'ai' ? '✨ AI Generated' : '📝 Fallback'}
                  </span>
                  <span className="news-separator">•</span>
                  <span className="insight-model">{insight.model}</span>
                </div>
                {insight.crypto_assets.length > 0 && (
                  <div className="insight-assets">
                    {insight.crypto_assets.map((asset) => (
                      <span key={asset} className="asset-tag">
                        {asset}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </ContentState>
      </div>
    </div>
  );
};

export default InsightSection;

