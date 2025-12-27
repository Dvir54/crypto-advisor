import React from 'react';
import type { CoinPrice } from '../../types/content';
import ContentState from './ContentState';

interface CoinPricesSectionProps {
  coinPrices: CoinPrice[];
  loading: boolean;
  error: string | null;
}

/**
 * Section component for displaying cryptocurrency prices
 */
const CoinPricesSection: React.FC<CoinPricesSectionProps> = ({
  coinPrices,
  loading,
  error,
}) => {
  return (
    <div className="dashboard-section prices-section">
      <div className="section-header">
        <h3>📈 Coin Prices</h3>
        <span className="section-badge">Live</span>
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
          <div className="coins-list">
            {coinPrices.map((coin) => (
              <div key={coin.id} className="coin-item">
                <div className="coin-info">
                  {coin.image && (
                    <img src={coin.image} alt={coin.name} className="coin-icon" />
                  )}
                  <div className="coin-details">
                    <span className="coin-name">{coin.name}</span>
                    <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
                  </div>
                </div>
                <div className="coin-price-info">
                  <span className="coin-price">
                    ${coin.current_price?.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    }) || 'N/A'}
                  </span>
                  {coin.price_change_percentage_24h !== undefined && 
                   coin.price_change_percentage_24h !== null && (
                    <span className={`coin-change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
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
    </div>
  );
};

export default CoinPricesSection;

