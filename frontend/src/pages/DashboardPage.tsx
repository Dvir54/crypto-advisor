import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getPreferences } from '../services/preferencesService';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [hasPreferences, setHasPreferences] = useState<boolean | null>(null);
  const [showBanner, setShowBanner] = useState(false);

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

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Hello, {user?.name}! 👋</h2>
          <p className="user-email">{user?.email}</p>
          
          <div className="user-info">
            <div className="info-item">
              <span className="info-label">Account Status:</span>
              <span className="info-value">Active</span>
            </div>
            <div className="info-item">
              <span className="info-label">Preferences:</span>
              <span className="info-value">
                {hasPreferences === null ? (
                  <span className="status-loading">Loading...</span>
                ) : hasPreferences ? (
                  <span className="status-complete">✓ Configured</span>
                ) : (
                  <span className="status-pending">⚠️ Not Set</span>
                )}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Member Since:</span>
              <span className="info-value">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="dashboard-message">
            <p>
              {hasPreferences 
                ? "Your dashboard is personalized based on your preferences!" 
                : "You're viewing default content. Complete preferences for a personalized experience."}
            </p>
            <p className="coming-soon">
              🚀 Dashboard features coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

