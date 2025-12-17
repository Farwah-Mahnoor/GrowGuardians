import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { authService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import LanguageToggle from '../components/LanguageToggle';
import './LoginOTPScreen.css';

const LoginOTPScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUserData } = useUser();
  const { language } = useLanguage();
  const mobileNumber = location.state?.mobileNumber || '';
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isResending, setIsResending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [showToast, setShowToast] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
      const response = await authService.resendOTP(mobileNumber, 'login');
      
      if (response.success) {
        setTimeLeft(180);
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

  const handleLogin = async () => {
    if (!isOtpComplete) return;

    const otpString = otp.join('');
    setLoading(true);
    setError('');

    try {
      // Login with OTP
      const response = await authService.login(mobileNumber, otpString);
      
      if (response.success) {
        // Store user data in context
        setUserData(response.user);
        // Navigate to dashboard
        navigate('/dashboard', { state: response.user });
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
        setOtp(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      setOtp(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-otp-screen">
      <div className="login-otp-top-header">
        <button className="back-arrow-otp" onClick={() => navigate(-1)}>
          ←
        </button>
        <LanguageToggle />
      </div>

      <div className="login-otp-card">
        <h2 className="login-otp-header">{getTranslation('loginOtp', 'verificationCode', language)}</h2>
        <p className="login-otp-description">
          {getTranslation('loginOtp', 'description', language)}
        </p>

        <div className="login-otp-inputs">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el; }}
              type="tel"
              maxLength={1}
              className="login-otp-box"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading || isResending}
            />
          ))}
        </div>

        <p className="countdown-timer">{formatTime(timeLeft)}</p>

        {error && (
          <div style={{ color: '#ff4444', marginTop: '10px', fontSize: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <p 
          className={`resend-otp-text ${isResending ? 'resending' : ''}`}
          onClick={!isResending && !loading ? handleResendOTP : undefined}
        >
          {isResending ? getTranslation('loginOtp', 'resending', language) : getTranslation('loginOtp', 'resendOtp', language)}
        </p>
      </div>

      <button
        className={`login-otp-button ${isOtpComplete ? 'active' : ''}`}
        onClick={handleLogin}
        disabled={!isOtpComplete || loading}
      >
        {loading ? getTranslation('loginOtp', 'loggingIn', language) : getTranslation('loginOtp', 'loginButton', language)}
      </button>

      {showToast && (
        <div className="toast">
          {getTranslation('loginOtp', 'otpResent', language)}
        </div>
      )}
    </div>
  );
};

export default LoginOTPScreen;
