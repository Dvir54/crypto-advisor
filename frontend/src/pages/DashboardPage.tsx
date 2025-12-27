import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getPreferences } from '../services/preferencesService';
import { getCoinPrices, getNews, getInsight, getMeme } from '../services/contentService';
import { useContentData } from '../hooks/useContentData';
import {
  CoinPricesSection,
  NewsSection,
  InsightSection,
  MemeSection,
} from '../components/dashboard';
import './DashboardPage.css';

/**
 * Main Dashboard Page Component
 * Displays personalized cryptocurrency content in a 4-section grid layout
 */
const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  // Fetch all dashboard content using custom hook
  const coinPricesData = useContentData(
    async () => {
      const response = await getCoinPrices();
      return response.data;
    },
    []
  );

  const newsData = useContentData(
    async () => {
      const response = await getNews(undefined, 10);
      return response.data;
    },
    []
  );

  const insightData = useContentData(
    async () => {
      const response = await getInsight();
      return response.data;
    },
    null
  );

  const memeData = useContentData(
    async () => {
      const response = await getMeme();
      return response.data;
    },
    null
  );

  // Check user preferences on mount
  useEffect(() => {
    const checkPreferences = async () => {
      try {
        await getPreferences();
        setHasPreferences(true);
        setShowBanner(false);
      } catch (error) {
        // No preferences found - user skipped onboarding
        setHasPreferences(false);
        setShowBanner(true);
      }
    };
    
    checkPreferences();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Preferences Banner */}
      {showBanner && (
        <div className="preferences-banner">
          <div className="banner-content">
            <span className="banner-icon">⚠️</span>
            <div className="banner-text">
              <strong>Complete your preferences</strong>
              <p>Get personalized content tailored to your interests</p>
            </div>
          </div>
          <div className="banner-actions">
            <button 
              onClick={() => navigate('/onboarding')} 
              className="banner-button-primary"
            >
              Complete Now
            </button>
            <button 
              onClick={() => setShowBanner(false)} 
              className="banner-button-secondary"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Welcome to Crypto Advisor</h1>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/onboarding')} 
            className="preferences-button"
          >
            ⚙️ Edit Preferences
          </button>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Content - 4 Section Grid */}
      <div className="dashboard-content">
        {/* Welcome Header */}
        <div className="welcome-header">
          <h2>Hello, {user?.name}! 👋</h2>
          <p className="welcome-subtext">
            {hasPreferences === null ? (
              <span className="status-loading">Loading preferences...</span>
            ) : hasPreferences ? (
              <span className="status-complete">✓ Your personalized crypto dashboard</span>
            ) : (
              <span className="status-pending">⚠️ Viewing default content</span>
            )}
          </p>
        </div>

        {/* 4-Section Grid */}
        <div className="dashboard-grid">
          <CoinPricesSection
            coinPrices={coinPricesData.data}
            loading={coinPricesData.loading}
            error={coinPricesData.error}
          />

          <NewsSection
            news={newsData.data}
            loading={newsData.loading}
            error={newsData.error}
          />

          <InsightSection
            insight={insightData.data}
            loading={insightData.loading}
            error={insightData.error}
          />

          <MemeSection
            meme={memeData.data}
            loading={memeData.loading}
            error={memeData.error}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

