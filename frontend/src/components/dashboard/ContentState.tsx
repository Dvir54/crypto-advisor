import React from 'react';

interface ContentStateProps {
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  emptyIcon?: string;
  children: React.ReactNode;
}

/**
 * Reusable component for handling loading, error, and empty states
 */
const ContentState: React.FC<ContentStateProps> = ({
  loading,
  error,
  isEmpty,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data available',
  emptyIcon = '📊',
  children,
}) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="empty-state">
        <span className="empty-icon">{emptyIcon}</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ContentState;

