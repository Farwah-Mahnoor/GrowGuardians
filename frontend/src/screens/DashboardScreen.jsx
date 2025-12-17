import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { authService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import LanguageToggle from '../components/LanguageToggle';
import './DashboardScreen.css';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData: contextUserData } = useUser();
  const { language } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingSuccess, setRatingSuccess] = useState(false);
  
  // Get user data from context first, then location state, then use default values
  const userData = contextUserData || location.state || {
    name: 'User',
    surname: 'Name',
    email: '',
    province: 'Punjab',
    district: '',
    tehsil: 'Sample',
    village: 'Sample Village',
    address: '',
    mobileNumber: '3001234567'
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEditProfile = () => {
    navigate('/profile', { state: userData });
    setIsMenuOpen(false);
  };

  const handleMenuItemClick = (item) => {
    setIsMenuOpen(false);
    if (item === 'All Reports') {
      navigate('/all-reports', { state: userData });
    } else if (item === 'Weather') {
      // Open Google Weather in a new tab
      window.open('https://www.google.com/search?q=weather', '_blank');
    } else if (item === 'Rate us') {
      setShowRatingModal(true);
    } else if (item === 'Logout') {
      handleLogout();
    }
    // Other menu items can be implemented later
  };

  const handleLogout = () => {
    // Clear authentication
    authService.logout();
    // Navigate to login
    navigate('/login');
  };

  const handleDiseaseDetection = () => {
    navigate('/scan-plant', { state: userData });
  };

  const getLocationText = () => {
    const parts = [userData.province, userData.tehsil, userData.village].filter(Boolean);
    return parts.join(', ');
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      setRatingError('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    setRatingError('');

    try {
      // Import the rating service dynamically
      const { ratingService } = await import('../services/api');
      
      const response = await ratingService.submitRating({
        rating,
        feedback: feedback.trim()
      });

      if (response.success) {
        setRatingSuccess(true);
        setTimeout(() => {
          setShowRatingModal(false);
          setRating(0);
          setFeedback('');
          setRatingSuccess(false);
        }, 2000);
      } else {
        setRatingError(response.message || 'Failed to submit rating');
      }
    } catch (err) {
      console.error('Rating submission error:', err);
      setRatingError(err.response?.data?.message || 'Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setRating(0);
    setHoverRating(0);
    setFeedback('');
    setRatingError('');
    setRatingSuccess(false);
  };

  return (
    <div className="dashboard-screen">
      {/* Top Navigation Bar */}
      <div className="top-nav-bar">
        <button className="menu-icon" onClick={handleMenuClick}>
          ☰
        </button>
        <LanguageToggle />
      </div>

      {/* Side Menu Drawer */}
      {isMenuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>
          <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
            <button className="menu-back-arrow" onClick={() => setIsMenuOpen(false)}>
              ←
            </button>

            <div className="menu-profile-card">
              <div className="menu-profile-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M20 5 L15 15 L5 15 L13 22 L10 32 L20 25 L30 32 L27 22 L35 15 L25 15 Z" fill="white"/>
                </svg>
              </div>
              <div className="menu-profile-info">
                <div className="menu-profile-name">{userData.name} {userData.surname}</div>
                <div className="menu-edit-profile" onClick={handleEditProfile}>
                  <span>{getTranslation('dashboard', 'editProfile', language)}</span>
                  <span className="forward-arrow">→</span>
                </div>
              </div>
            </div>

            <div className="menu-items">
              <div className="menu-item" onClick={() => handleMenuItemClick('Weather')}>{getTranslation('dashboard', 'weather', language)}</div>
              <div className="menu-item" onClick={() => handleMenuItemClick('All Reports')}>{getTranslation('dashboard', 'allReports', language)}</div>
              <div className="menu-item" onClick={() => handleMenuItemClick('Rate us')}>{getTranslation('dashboard', 'rateUs', language)}</div>
              <div 
                className="menu-item" 
                onClick={() => handleMenuItemClick('Logout')}
                style={{ 
                  color: '#ff4444',
                  borderTop: '1px solid #eee',
                  marginTop: '10px',
                  paddingTop: '15px'
                }}
              >
                {getTranslation('dashboard', 'logout', language)}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Upper Section */}
      <div className="dashboard-upper">
        <div className="user-profile-card">
          <div className="user-info">
            <div className="user-name">{userData.name} {userData.surname}</div>
            <div className="user-mobile">+92 {userData.mobileNumber}</div>
            <div className="user-location">{getLocationText()}</div>
          </div>
          <div className="user-profile-icon">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <path d="M25 6 L19 19 L6 19 L16 27 L12 40 L25 31 L38 40 L34 27 L44 19 L31 19 Z" fill="white"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Lower Section */}
      <div className="dashboard-lower">
        <div className="feature-cards">
          <div className="feature-card" onClick={handleDiseaseDetection}>
            <div className="feature-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="16" cy="16" r="10" fill="none" stroke="#066F46" strokeWidth="2.5"/>
                <line x1="23" y1="23" x2="32" y2="32" stroke="#066F46" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="feature-text">{getTranslation('dashboard', 'plantDiseaseDetection', language)}</div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="bottom-nav-bar"></div>

      {/* Rating Modal */}
      {showRatingModal && (
        <>
          <div className="rating-overlay" onClick={handleCloseRatingModal}></div>
          <div className="rating-modal">
            <button className="rating-close-btn" onClick={handleCloseRatingModal}>×</button>
            
            <h2 className="rating-title">{language === 'ur' ? 'ہمیں ریٹ کریں' : 'Rate Us'}</h2>
            
            {ratingSuccess ? (
              <div className="rating-success-message">
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>✓</div>
                <p>{language === 'ur' ? 'شکریہ! آپ کی رائے جمع ہو گئی' : 'Thank you! Your rating has been submitted'}</p>
              </div>
            ) : (
              <>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="star-btn"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`Rate ${star} stars`}
                    >
                      <svg
                        width="50"
                        height="50"
                        viewBox="0 0 50 50"
                        fill={star <= (hoverRating || rating) ? '#30E5D0' : 'none'}
                        stroke="#30E5D0"
                        strokeWidth="2"
                      >
                        <path d="M25 5 L19 19 L5 19 L16 27 L12 40 L25 31 L38 40 L34 27 L45 19 L31 19 Z" />
                      </svg>
                    </button>
                  ))}
                </div>

                <textarea
                  className="rating-feedback"
                  placeholder={language === 'ur' ? 'اپنی رائے تفصیل سے لکھیں (اختیاری)' : 'Write your feedback in detail (optional)'}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="4"
                  disabled={submittingRating}
                />

                {ratingError && (
                  <div className="rating-error">
                    {ratingError}
                  </div>
                )}

                <button
                  className="rating-submit-btn"
                  onClick={handleRatingSubmit}
                  disabled={submittingRating || rating === 0}
                >
                  {submittingRating ? (language === 'ur' ? 'جمع ہو رہا ہے...' : 'Submitting...') : (language === 'ur' ? 'جمع کریں' : 'Submit')}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardScreen;
