import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Crypto Advisor</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

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
              <span className="info-label">Onboarding:</span>
              <span className="info-value">
                {user?.onboarding_complete ? (
                  <span className="status-complete">✓ Completed</span>
                ) : (
                  <span className="status-pending">Pending</span>
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
              This is a protected page. Only authenticated users can access this content.
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

