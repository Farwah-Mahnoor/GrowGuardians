import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { userService, authService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import LanguageToggle from '../components/LanguageToggle';
import './ProfileScreen.css';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData: contextUserData, setUserData } = useUser();
  const { language } = useLanguage();
  const [userData, setLocalUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Fetch user profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await userService.getProfile();
        
        if (response.success && response.user) {
          setLocalUserData(response.user);
          setMobileNumber(response.user.mobileNumber || '');
          setEmail(response.user.email || '');
          setAddress(response.user.address || '');
        } else {
          // Fallback to context or location state
          const fallbackData = location.state || contextUserData;
          if (fallbackData) {
            setLocalUserData(fallbackData);
            setMobileNumber(fallbackData.mobileNumber || '');
            setEmail(fallbackData.email || '');
            setAddress(fallbackData.address || '');
          }
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
        // Use fallback data
        const fallbackData = location.state || contextUserData;
        if (fallbackData) {
          setLocalUserData(fallbackData);
          setMobileNumber(fallbackData.mobileNumber || '');
          setEmail(fallbackData.email || '');
          setAddress(fallbackData.address || '');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [location.state, contextUserData]);

  const handleUpdateProfile = async () => {
    if (!userData) return;

    const oldMobileNumber = userData.mobileNumber;
    const mobileNumberChanged = mobileNumber !== oldMobileNumber;

    setUpdating(true);
    setError('');

    try {
      if (mobileNumberChanged) {
        // If mobile number changed, need OTP verification
        // First send OTP to new number
        const otpResponse = await authService.sendLoginOTP(mobileNumber);
        
        if (otpResponse.success) {
          // Navigate to OTP screen with update context
          navigate('/login-otp', { 
            state: { 
              mobileNumber,
              isProfileUpdate: true,
              updateData: { email, address }
            } 
          });
        } else {
          setError(otpResponse.message || 'Failed to send OTP');
        }
      } else {
        // Direct update without OTP
        const response = await userService.updateProfile({
          email,
          address
        });
        
        if (response.success) {
          // Update context
          setUserData(response.user);
          // Navigate back to dashboard
          navigate('/dashboard', { state: response.user });
        } else {
          setError(response.message || 'Failed to update profile');
        }
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const isFormValid = () => {
    return mobileNumber.length >= 10;
  };

  if (loading) {
    return (
      <div className="profile-screen">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#666'
        }}>
          {getTranslation('profile', 'loadingProfile', language)}
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-screen">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#666'
        }}>
          <p>{getTranslation('profile', 'noProfileData', language)}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#016E43',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {getTranslation('profile', 'goToDashboard', language)}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-screen">
      <div className="profile-upper-section">
        <button className="profile-back-arrow" onClick={() => navigate(-1)}>
          ←
        </button>
        <LanguageToggle />
      </div>

      <div className="profile-lower-section">
        <div className="profile-icon-container">
          <div className="profile-circular-icon">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <path d="M25 6 L19 19 L6 19 L16 27 L12 40 L25 31 L38 40 L34 27 L44 19 L31 19 Z" fill="white"/>
            </svg>
          </div>
        </div>

        <div className="profile-user-name">
          {userData.name} {userData.surname}
        </div>

        {error && (
          <div style={{ 
            color: '#ff4444', 
            textAlign: 'center', 
            margin: '15px 20px',
            padding: '10px',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div className="profile-form">
          <div className="profile-field">
            <label className="profile-label">{getTranslation('profile', 'mobileNumber', language)}</label>
            <div className="profile-input-container">
              <input
                type="tel"
                className="profile-input"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                disabled={!isEditingMobile || updating}
                maxLength={10}
              />
              <button 
                className="edit-icon"
                onClick={() => setIsEditingMobile(!isEditingMobile)}
              >
                ✏️
              </button>
            </div>
          </div>

          <div className="profile-field">
            <label className="profile-label">{getTranslation('profile', 'email', language)}</label>
            <div className="profile-input-container">
              <input
                type="email"
                className="profile-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditingEmail || updating}
                placeholder={email ? '' : getTranslation('profile', 'enterEmail', language)}
              />
              <button 
                className="edit-icon"
                onClick={() => setIsEditingEmail(!isEditingEmail)}
              >
                ✏️
              </button>
            </div>
          </div>

          <div className="profile-field">
            <label className="profile-label">{getTranslation('profile', 'address', language)}</label>
            <div className="profile-input-container">
              <input
                type="text"
                className="profile-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!isEditingAddress || updating}
                placeholder={address ? '' : getTranslation('profile', 'enterAddress', language)}
              />
              <button 
                className="edit-icon"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
              >
                ✏️
              </button>
            </div>
          </div>

          <button
            className={`update-profile-button ${isFormValid() ? 'active' : ''}`}
            onClick={handleUpdateProfile}
            disabled={!isFormValid() || updating}
          >
            {updating ? getTranslation('profile', 'updating', language) : getTranslation('profile', 'updateProfile', language)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
