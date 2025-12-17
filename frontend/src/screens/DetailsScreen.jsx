import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import LanguageToggle from '../components/LanguageToggle';
import './DetailsScreen.css';

const DetailsScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const mobileNumber = location.state?.mobileNumber || '';

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    province: '',
    district: '',
    tehsil: '',
    village: '',
    address: ''
  });

  const [showEmailToast, setShowEmailToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const provinces = [
    'AJK',
    'Balochistan',
    'Gilgit Baltistan',
    'Islamabad',
    'Khyber Pakhtunkhwa',
    'Punjab',
    'Sindh'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValidEmail = (email) => {
    if (!email) return true; // Email is optional, so empty is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return formData.name && formData.surname && formData.province && 
           formData.district && formData.tehsil && formData.village;
  };

  const handleRegistration = async () => {
    if (!isFormValid()) {
      return;
    }

    // Validate email format if email is provided
    if (formData.email && !isValidEmail(formData.email)) {
      setShowEmailToast(true);
      setTimeout(() => setShowEmailToast(false), 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send OTP to mobile number before proceeding
      const response = await authService.sendRegistrationOTP(mobileNumber);
      
      if (response.success) {
        // Navigate to OTP screen with all user data
        navigate('/register-otp', { state: { mobileNumber, ...formData } });
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="details-screen">
      <div className="details-header">
        <button className="back-arrow" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="details-heading">{getTranslation('details', 'title', language)}</h1>
        <LanguageToggle />
      </div>

      <div className="details-card">
        <div className="form-container">
          <div className="form-field">
            <label className="form-label">{getTranslation('details', 'name', language)}</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">{getTranslation('details', 'surname', language)}</label>
            <input
              type="text"
              className="form-input"
              value={formData.surname}
              onChange={(e) => handleInputChange('surname', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">{getTranslation('details', 'email', language)}</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">{getTranslation('details', 'province', language)}</label>
            <select
              className="form-input form-select"
              value={formData.province}
              onChange={(e) => handleInputChange('province', e.target.value)}
            >
              <option value="">{getTranslation('details', 'selectProvince', language)}</option>
              {provinces.map(province => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">{getTranslation('details', 'district', language)}</label>
            <input
              type="text"
              className="form-input"
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">{getTranslation('details', 'tehsil', language)}</label>
            <input
              type="text"
              className="form-input"
              value={formData.tehsil}
              onChange={(e) => handleInputChange('tehsil', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">{getTranslation('details', 'village', language)}</label>
            <input
              type="text"
              className="form-input"
              value={formData.village}
              onChange={(e) => handleInputChange('village', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">{getTranslation('details', 'address', language)}</label>
            <input
              type="text"
              className="form-input"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: '#ff4444', marginBottom: '10px', fontSize: '14px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            className={`registration-button ${isFormValid() ? 'active' : ''}`}
            onClick={handleRegistration}
            disabled={!isFormValid() || loading}
          >
            {loading ? getTranslation('details', 'sendingOtp', language) : getTranslation('details', 'registration', language)}
          </button>
        </div>
      </div>

      {showEmailToast && (
        <div className="email-toast">
          {getTranslation('details', 'invalidEmail', language)}
        </div>
      )}
    </div>
  );
};

export default DetailsScreen;
