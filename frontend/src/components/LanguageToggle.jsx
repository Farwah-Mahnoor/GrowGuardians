import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageToggle.css';

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="language-toggle-container">
      <div className="language-toggle" onClick={toggleLanguage}>
        <div className={`language-toggle-pill ${language === 'en' ? 'english' : 'urdu'}`}></div>
        <span className={`language-toggle-text ${language === 'en' ? 'active' : ''}`}>
          Eng
        </span>
        <span className={`language-toggle-text ${language === 'ur' ? 'active' : ''}`}>
          اردو
        </span>
      </div>
    </div>
  );
};

export default LanguageToggle;
