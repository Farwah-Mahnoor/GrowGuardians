import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSelectionScreen.css';

const LanguageSelectionScreen = () => {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
  };

  const handleNext = () => {
    if (selectedLanguage) {
      // Set the selected language
      setLanguage(selectedLanguage);
      // Navigate to registration screen
      navigate('/register');
    }
  };

  return (
    <div className="language-selection-screen">
      <div className="language-upper-section">
        <img 
          src="/logo.png" 
          alt="GrowGuardians Logo" 
          className="language-logo"
        />
      </div>

      <div className="language-lower-section">
        <div className="language-card">
          <h1 className="language-header-en">Please, select your language!</h1>
          <h2 className="language-header-ur">براہ کرم، اپنی زبان منتخب کریں!</h2>

          <div className="language-options">
            <label className="language-option">
              <input
                type="radio"
                name="language"
                value="en"
                checked={selectedLanguage === 'en'}
                onChange={() => handleLanguageSelect('en')}
                className="language-radio"
              />
              <span className={`language-label ${selectedLanguage === 'en' ? 'selected' : ''}`}>
                English
              </span>
            </label>

            <label className="language-option">
              <input
                type="radio"
                name="language"
                value="ur"
                checked={selectedLanguage === 'ur'}
                onChange={() => handleLanguageSelect('ur')}
                className="language-radio"
              />
              <span className={`language-label ${selectedLanguage === 'ur' ? 'selected' : ''}`}>
                اردو
              </span>
            </label>
          </div>

          <button 
            className={`language-next-button ${selectedLanguage ? 'active' : ''}`}
            onClick={handleNext}
            disabled={!selectedLanguage}
          >
            Next/آگے
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectionScreen;
