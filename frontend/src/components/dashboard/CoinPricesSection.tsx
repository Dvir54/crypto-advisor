import React from 'react';
import type { CoinPrice } from '../../types/content';
import ContentState from './ContentState';
import VoteButtons from '../VoteButtons';

interface CoinPricesSectionProps {
  coinPrices: CoinPrice[];
  loading: boolean;
  error: string | null;
  getVote: (contentType: string, contentId: string) => boolean | null;
  updateVote: (contentType: string, contentId: string, isUpvote: boolean | null) => void;
}

/**
 * Section component for displaying cryptocurrency prices
 */
const CoinPricesSection: React.FC<CoinPricesSectionProps> = ({
  coinPrices,
  loading,
  error,
  getVote,
  updateVote,
}) => {
  return (
    <section className="dashboard-section prices-section" aria-labelledby="coin-prices-heading">
      <div className="section-header">
        <h3 id="coin-prices-heading">📈 Coin Prices</h3>
        <div className="section-header-right">
          <span className="section-badge" aria-label="Live data">Live</span>
          <VoteButtons
            contentType="price"
            contentId="price-section"
            initialVote={getVote('price', 'price-section')}
            onVoteChange={(isUpvote) => updateVote('price', 'price-section', isUpvote)}
          />
        </div>
      </div>
      <div className="section-content">
        <ContentState
          loading={loading}
          error={error}
          isEmpty={coinPrices.length === 0}
          loadingMessage="Loading coin prices..."
          emptyMessage="No coin data available"
          emptyIcon="📊"
        >
          <div className="coins-list" role="list">
            {coinPrices.map((coin) => (
              <div key={coin.id} className="coin-item" role="listitem">
                <div className="coin-info">
                  {coin.image && (
                    <img 
                      src={coin.image} 
                      alt={`${coin.name} logo`} 
                      className="coin-icon"
                      loading="lazy"
                    />
                  )}
                  <div className="coin-details">
                    <span className="coin-name">{coin.name}</span>
                    <span className="coin-symbol" aria-label={`Symbol: ${coin.symbol}`}>
                      {coin.symbol.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="coin-price-info">
                  <span className="coin-price" aria-label={`Current price: ${coin.current_price} dollars`}>
                    ${coin.current_price?.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    }) || 'N/A'}
                  </span>
                  {coin.price_change_percentage_24h !== undefined && 
                   coin.price_change_percentage_24h !== null && (
                    <span 
                      className={`coin-change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}
                      aria-label={`24 hour change: ${coin.price_change_percentage_24h >= 0 ? 'up' : 'down'} ${Math.abs(coin.price_change_percentage_24h).toFixed(2)} percent`}
                    >
                      {coin.price_change_percentage_24h >= 0 ? '▲' : '▼'}{' '}
                      {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ContentState>
      </div>
    </section>
  );
};

export default CoinPricesSection;

