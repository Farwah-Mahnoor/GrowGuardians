import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import LanguageToggle from '../components/LanguageToggle';
import './RegisterScreen.css';

const RegisterScreen = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetStarted = async () => {
    if (mobileNumber.length < 10) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send OTP to mobile number
      const response = await authService.sendRegistrationOTP(mobileNumber);
      
      if (response.success) {
        // Navigate to details screen
        navigate('/details', { state: { mobileNumber } });
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Registration OTP error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-screen">
      <div className="register-header">
        <div className="register-header-spacer"></div>
        <LanguageToggle />
      </div>
      
      <div className="register-content">
        <h1 className="register-heading">{getTranslation('register', 'title', language)}</h1>
        
        <img 
          src="/registerimage.png" 
          alt="Registration Illustration" 
          className="register-illustration"
        />

        <div className="register-input-section">
          <p className="register-text">{getTranslation('register', 'enterMobile', language)}</p>
          <p className="register-helper-text">{getTranslation('register', 'verificationText', language)}</p>
          
          <div className="mobile-input-container">
            <div className="country-code-section">
              +92
            </div>
            <div className="divider"></div>
            <input 
              type="tel"
              placeholder={getTranslation('register', 'mobilePlaceholder', language)}
              className="mobile-input"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              maxLength={10}
              disabled={loading}
            />
          </div>

          {error && (
            <div style={{ color: '#ff4444', marginTop: '10px', fontSize: '14px' }}>
              {error.includes('already registered') 
                ? getTranslation('register', 'alreadyRegistered', language)
                : error}
            </div>
          )}

          <button 
            className="get-started-button"
            onClick={handleGetStarted}
            disabled={mobileNumber.length < 10 || loading}
          >
            {getTranslation('register', 'getStarted', language)}
          </button>

          <p className="login-link">
            <span className="gray-text">{getTranslation('register', 'alreadyUser', language)} </span>
            <span className="link-text" onClick={() => navigate('/login')}>
              {getTranslation('register', 'loginHere', language)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;
