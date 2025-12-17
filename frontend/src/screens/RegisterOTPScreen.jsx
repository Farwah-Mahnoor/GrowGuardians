import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { authService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import LanguageToggle from '../components/LanguageToggle';
import './RegisterOTPScreen.css';

const RegisterOTPScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserData } = useUser();
  const { language } = useLanguage();
  const userData = location.state || {};
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (value && !/^[0-9]$/.test(value)) {
      return;
    }
    
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');
    
    try {
      const response = await authService.resendOTP(userData.mobileNumber, 'registration');
      
      if (response.success) {
        setShowToast(true);
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
        
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  const handleRegister = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) return;

    setLoading(true);
    setError('');

    try {
      // Register user with backend
      const response = await authService.register(userData, otpString);
      
      if (response.success) {
        // Store user data in context
        setUserData(response.user);
        // Navigate to login screen after successful registration
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-otp-screen">
      <div className="register-otp-header">
        <div className="register-otp-header-spacer"></div>
        <LanguageToggle />
      </div>
      
      <div className="otp-card">
        <h2 className="otp-header">{getTranslation('registerOtp', 'header', language)}</h2>
        <p className="otp-description">
          {getTranslation('registerOtp', 'description', language)}
        </p>

        <div className="otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="tel"
              maxLength={1}
              className="otp-box"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading || isResending}
            />
          ))}
        </div>

        {error && (
          <div style={{ color: '#ff4444', marginTop: '15px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button
          className={`register-otp-button ${isOtpComplete ? 'active' : ''}`}
          onClick={handleRegister}
          disabled={!isOtpComplete || loading}
        >
          {loading ? getTranslation('registerOtp', 'registering', language) : getTranslation('registerOtp', 'registerButton', language)}
        </button>

        <p 
          className={`resend-text ${isResending ? 'resending' : ''}`}
          onClick={!isResending ? handleResendOTP : undefined}
        >
          {isResending ? getTranslation('registerOtp', 'resending', language) : getTranslation('registerOtp', 'resendOtp', language)}
        </p>
      </div>

      {showToast && (
        <div className="toast">
          {getTranslation('registerOtp', 'otpResent', language)}
        </div>
      )}
    </div>
  );
};

export default RegisterOTPScreen;
