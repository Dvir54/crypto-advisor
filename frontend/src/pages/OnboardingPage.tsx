import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { savePreferences, getPreferences } from '../services/preferencesService';
import api from '../services/api';
import type {
  CryptoAssetOption,
  InvestorTypeOption,
  ContentTypeOption,
  PreferencesRequest,
} from '../types/preferences';
import './OnboardingPage.css';

// Available crypto assets
const CRYPTO_ASSETS: CryptoAssetOption[] = [
  { id: 'BTC', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ETH', name: 'Ethereum', symbol: 'ETH' },
  { id: 'SOL', name: 'Solana', symbol: 'SOL' },
  { id: 'ADA', name: 'Cardano', symbol: 'ADA' },
  { id: 'DOGE', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'XRP', name: 'Ripple', symbol: 'XRP' },
  { id: 'DOT', name: 'Polkadot', symbol: 'DOT' },
  { id: 'MATIC', name: 'Polygon', symbol: 'MATIC' },
];

// Investor types
const INVESTOR_TYPES: InvestorTypeOption[] = [
  {
    id: 'hodler',
    name: 'HODLer',
    description: 'Long-term investor who holds assets',
  },
  {
    id: 'daytrader',
    name: 'Day Trader',
    description: 'Active trader looking for short-term gains',
  },
  {
    id: 'nft',
    name: 'NFT Enthusiast',
    description: 'Focused on NFTs and digital collectibles',
  },
];

// Content types
const CONTENT_TYPES: ContentTypeOption[] = [
  {
    id: 'news',
    name: 'Market News',
    description: 'Latest crypto news and updates',
  },
  {
    id: 'charts',
    name: 'Price Charts',
    description: 'Real-time price tracking and analysis',
  },
  {
    id: 'social',
    name: 'Social Sentiment',
    description: 'Community trends and discussions',
  },
  {
    id: 'fun',
    name: 'Memes & Fun',
    description: 'Crypto memes and entertainment',
  },
];

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser, user } = useAuth();

  // Current step (1, 2, or 3)
  const [currentStep, setCurrentStep] = useState(1);

  // Form data
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [investorType, setInvestorType] = useState<string>('');
  const [contentTypes, setContentTypes] = useState<string[]>([]);

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Load existing preferences if user is editing
  useEffect(() => {
    const loadExistingPreferences = async () => {
      if (user?.onboarding_complete) {
        try {
          const existingPrefs = await getPreferences();
          // Pre-fill the form with existing data
          setSelectedAssets(existingPrefs.crypto_assets);
          setInvestorType(existingPrefs.investor_type);
          setContentTypes(existingPrefs.content_types);
        } catch (error) {
          // No preferences found - user skipped previously
          console.log('No existing preferences to load');
        }
      }
    };
    
    loadExistingPreferences();
  }, [user]);

  // Handle crypto asset checkbox
  const handleAssetToggle = (assetId: string) => {
    setSelectedAssets((prev) =>
      prev.includes(assetId)
        ? prev.filter((id) => id !== assetId)
        : [...prev, assetId]
    );
    setError('');
  };

  // Handle investor type selection
  const handleInvestorTypeSelect = (type: string) => {
    setInvestorType(type);
    setError('');
  };

  // Handle content type checkbox
  const handleContentTypeToggle = (contentId: string) => {
    setContentTypes((prev) =>
      prev.includes(contentId)
        ? prev.filter((id) => id !== contentId)
        : [...prev, contentId]
    );
    setError('');
  };

  // Validate current step
  const validateStep = (): boolean => {
    if (currentStep === 1) {
      if (selectedAssets.length === 0) {
        setError('Please select at least one crypto asset');
        return false;
      }
    } else if (currentStep === 2) {
      if (!investorType) {
        setError('Please select an investor type');
        return false;
      }
    } else if (currentStep === 3) {
      if (contentTypes.length === 0) {
        setError('Please select at least one content type');
        return false;
      }
    }
    return true;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
    setError('');
  };

  // Handle skip
  const handleSkip = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Call backend to mark onboarding as complete
      await api.post('/user/skip-onboarding');
      
      // Refresh user data to update onboarding_complete flag
      await refreshUser();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to skip onboarding:', err);
      setError('Failed to skip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const preferences: PreferencesRequest = {
        crypto_assets: selectedAssets,
        investor_type: investorType,
        content_types: contentTypes,
      };

      await savePreferences(preferences);
      
      // Refresh user data to update onboarding_complete status
      await refreshUser();
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Failed to save preferences:', err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Failed to save preferences. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Progress percentage
  const progressPercentage = (currentStep / 3) * 100;

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Header */}
        <div className="onboarding-header">
          <h1>
            {user?.onboarding_complete 
              ? "Update your preferences" 
              : "Welcome! Let's personalize your experience"}
          </h1>
          <p>
            {user?.onboarding_complete
              ? "Adjust your preferences to personalize your dashboard"
              : "Help us tailor content to your interests"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Step {currentStep} of 3
          </div>
        </div>

        {/* Steps indicator */}
        <div className="steps-indicator">
          <div className={`step-indicator ${currentStep >= 1 ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Assets</div>
          </div>
          <div className="step-line"></div>
          <div className={`step-indicator ${currentStep >= 2 ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Type</div>
          </div>
          <div className="step-line"></div>
          <div className={`step-indicator ${currentStep >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Content</div>
          </div>
        </div>

        {/* Step 1: Crypto Assets */}
        {currentStep === 1 && (
          <div className="step-content">
            <h2>Which crypto assets are you interested in?</h2>
            <p className="step-description">Select all that apply</p>

            <div className="options-grid">
              {CRYPTO_ASSETS.map((asset) => (
                <div
                  key={asset.id}
                  className={`option-card ${
                    selectedAssets.includes(asset.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleAssetToggle(asset.id)}
                >
                  <div className="option-checkbox">
                    {selectedAssets.includes(asset.id) && (
                      <span className="checkmark">✓</span>
                    )}
                  </div>
                  <div className="option-content">
                    <div className="option-title">{asset.name}</div>
                    <div className="option-subtitle">{asset.symbol}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Investor Type */}
        {currentStep === 2 && (
          <div className="step-content">
            <h2>What type of investor are you?</h2>
            <p className="step-description">Choose one that best describes you</p>

            <div className="options-list">
              {INVESTOR_TYPES.map((type) => (
                <div
                  key={type.id}
                  className={`option-card-large ${
                    investorType === type.id ? 'selected' : ''
                  }`}
                  onClick={() => handleInvestorTypeSelect(type.id)}
                >
                  <div className="option-radio">
                    {investorType === type.id && (
                      <span className="radio-dot"></span>
                    )}
                  </div>
                  <div className="option-content">
                    <div className="option-title">{type.name}</div>
                    <div className="option-description">{type.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Content Types */}
        {currentStep === 3 && (
          <div className="step-content">
            <h2>What content interests you?</h2>
            <p className="step-description">Select all that apply</p>

            <div className="options-list">
              {CONTENT_TYPES.map((content) => (
                <div
                  key={content.id}
                  className={`option-card-large ${
                    contentTypes.includes(content.id) ? 'selected' : ''
                  }`}
                  onClick={() => handleContentTypeToggle(content.id)}
                >
                  <div className="option-checkbox">
                    {contentTypes.includes(content.id) && (
                      <span className="checkmark">✓</span>
                    )}
                  </div>
                  <div className="option-content">
                    <div className="option-title">{content.name}</div>
                    <div className="option-description">{content.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && <div className="error-message">{error}</div>}

        {/* Navigation buttons */}
        <div className="onboarding-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={user?.onboarding_complete ? () => navigate('/dashboard') : handleSkip}
            disabled={isSubmitting}
          >
            {user?.onboarding_complete ? 'Cancel' : 'Skip for now'}
          </button>

          <div className="navigation-buttons">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn-back"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Back
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                className="btn-primary"
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Complete'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

