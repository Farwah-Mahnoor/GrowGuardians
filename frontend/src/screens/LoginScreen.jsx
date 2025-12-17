import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import LanguageToggle from '../components/LanguageToggle';
import './LoginScreen.css';

const LoginScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [mobileNumber, setMobileNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Show success message if coming from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setTimeout(() => setSuccessMessage(''), 5000);
    }
  }, [location.state]);

  const handleGenerateOTP = async () => {
    if (mobileNumber.length < 10) return;

    setLoading(true);
    setError('');

    try {
      // Send OTP to mobile number
      const response = await authService.sendLoginOTP(mobileNumber);
      
      if (response.success) {
        // Navigate to login OTP screen
        navigate('/login-otp', { state: { mobileNumber } });
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Login OTP error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-header">
        <button className="back-arrow-login" onClick={() => navigate(-1)}>
          ←
        </button>
        <LanguageToggle />
      </div>

      <div className="login-content">
        <h1 className="login-heading">{getTranslation('login', 'welcomeBack', language)}</h1>

        {successMessage && (
          <div style={{ 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {successMessage}
          </div>
        )}
        
        <img 
          src="/loginpagepic.png" 
          alt="Login Illustration" 
          className="login-illustration"
        />

        <p className="login-text">{getTranslation('login', 'enterMobile', language)}</p>

        <div className="login-input-section">
          <div className="country-code-login">
            +92
          </div>
          <input 
            type="tel"
            placeholder={getTranslation('login', 'mobilePlaceholder', language)}
            className="mobile-input-login"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            maxLength={10}
            disabled={loading}
          />
        </div>

        {error && (
          <div style={{ color: '#ff4444', marginTop: '10px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button 
          className="generate-otp-button"
          onClick={handleGenerateOTP}
          disabled={mobileNumber.length < 10 || loading}
        >
          {loading ? getTranslation('login', 'sendingOtp', language) : getTranslation('login', 'generateOtp', language)}
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
