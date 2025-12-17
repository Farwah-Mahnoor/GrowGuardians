import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { diseaseService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation, translateDiseaseName, translateDiagnosisContent } from '../utils/translations';
import LanguageToggle from '../components/LanguageToggle';
import './DiagnosisReportScreen.css';

const DiagnosisReportScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  // Sample diagnosis data - will be replaced with actual data from backend
  const diagnosisData = location.state?.diagnosisData || {
    id: '1',
    image: '/sample-plant.jpg',
    isHealthy: false,
    diseaseName: 'Tomato Late Blight',
    diagnosisPoints: [
      'The plant shows symptoms of Late Blight disease',
      'Dark brown spots visible on leaves',
      'White fungal growth detected on leaf undersides',
      'Disease severity: Moderate to High'
    ],
    tipsPoints: [
      'Remove and destroy all infected plant parts immediately',
      'Apply copper-based fungicide every 7-10 days',
      'Improve air circulation around plants',
      'Avoid overhead watering to reduce moisture on leaves',
      'Consider resistant tomato varieties for future planting'
    ],
    date: new Date().toISOString()
  };

  // Use backend image URL
  const imageUrl = diagnosisData.image.startsWith('http') 
    ? diagnosisData.image 
    : diseaseService.getImageUrl(diagnosisData.image);

  const handleDelete = () => {
    setShowOptionsMenu(false);
    setShowDeleteDialog(true);
  };

  const handleSaveReport = async () => {
    setShowOptionsMenu(false);
    
    // Check if already saved
    if (isSaved || diagnosisData.id) {
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
      return;
    }
    
    setSaving(true);
    setError('');
    
    try {
      // Save report to database
      const response = await diseaseService.saveReport(diagnosisData);
      
      if (response.success) {
        setIsSaved(true);
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
        
        // Update diagnosisData with the report ID
        if (response.diagnosisData && response.diagnosisData.id) {
          diagnosisData.id = response.diagnosisData.id;
        }
      } else {
        setError(response.message || 'Failed to save report');
      }
    } catch (err) {
      console.error('Save report error:', err);
      setError(err.response?.data?.message || 'Failed to save report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!diagnosisData.id) {
      setShowDeleteDialog(false);
      navigate('/all-reports');
      return;
    }

    setDeleting(true);
    setError('');

    try {
      const response = await diseaseService.deleteReport(diagnosisData.id);
      
      if (response.success) {
        setShowDeleteDialog(false);
        navigate('/all-reports');
      } else {
        setError(response.message || 'Failed to delete report');
        setShowDeleteDialog(false);
      }
    } catch (err) {
      console.error('Delete report error:', err);
      setError(err.response?.data?.message || 'Failed to delete report. Please try again.');
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  return (
    <div className="diagnosis-report-screen">
      {/* Top Navigation Bar */}
      <div className="diagnosis-nav-bar">
        <button className="diagnosis-back-arrow" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="diagnosis-nav-heading">{getTranslation('diagnosisReport', 'title', language)}</h1>
        <LanguageToggle />
        <button 
          className="diagnosis-options-menu"
          onClick={() => setShowOptionsMenu(!showOptionsMenu)}
        >
          ⋯
        </button>

        {showOptionsMenu && (
          <div className="diagnosis-options-dropdown">
            <div className="diagnosis-options-item" onClick={handleSaveReport}>
              <span>{saving ? getTranslation('diagnosisReport', 'saving', language) : (isSaved || diagnosisData.id ? getTranslation('diagnosisReport', 'reportSaved', language) : getTranslation('diagnosisReport', 'saveReport', language))}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15 2H5C4.45 2 4 2.45 4 3V17C4 17.55 4.45 18 5 18H15C15.55 18 16 17.55 16 17V3C16 2.45 15.55 2 15 2Z" stroke="#1A1A1A" strokeWidth="1.5" fill="none"/>
                <path d="M7 2V6H13V2" stroke="#1A1A1A" strokeWidth="1.5" fill="none"/>
                <line x1="7" y1="10" x2="13" y2="10" stroke="#1A1A1A" strokeWidth="1.5"/>
                <line x1="7" y1="13" x2="13" y2="13" stroke="#1A1A1A" strokeWidth="1.5"/>
              </svg>
            </div>
            <div className="diagnosis-options-item" onClick={handleDelete}>
              <span>{getTranslation('diagnosisReport', 'delete', language)}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 3V2H13V3H17V5H3V3H7Z" fill="#FF4B4B"/>
                <path d="M5 6V17C5 17.55 5.45 18 6 18H14C14.55 18 15 17.55 15 17V6H5Z" fill="#FF4B4B"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="diagnosis-content">
        {/* Results Section */}
        <h2 className="diagnosis-section-header">{getTranslation('diagnosisReport', 'results', language)}</h2>
        
        <div className={`diagnosis-result-card ${diagnosisData.isHealthy ? 'healthy' : 'unhealthy'}`}>
          <h3 className={`diagnosis-result-title ${diagnosisData.isHealthy ? 'healthy-title' : 'unhealthy-title'}`}>
            {diagnosisData.isHealthy ? getTranslation('diagnosisReport', 'congratulations', language) : getTranslation('diagnosisReport', 'oops', language)}
          </h3>
          <div className="diagnosis-image-container">
            <img 
              src={imageUrl}
              alt="Plant diagnosis" 
              className="diagnosis-image"
              onError={(e) => {
                e.target.src = '/placeholder-plant.jpg';
              }}
            />
          </div>
        </div>

        {/* Diagnosis Section */}
        <h2 className="diagnosis-section-header">{getTranslation('diagnosisReport', 'diagnosis', language)}</h2>
        
        <div className={`diagnosis-info-card ${diagnosisData.isHealthy ? 'healthy' : 'unhealthy'}`}>
          <div className="diagnosis-disease-info">
            <p className="diagnosis-disease-name">{translateDiseaseName(diagnosisData.diseaseName, language)}</p>
            <ul className="diagnosis-points-list">
              {(diagnosisData.diagnosisPoints || []).map((point, index) => (
                <li key={index}>{translateDiagnosisContent(point, language)}</li>
              ))}
            </ul>
          </div>

          <div className="diagnosis-tips-section">
            <h3 className="diagnosis-tips-header">{getTranslation('diagnosisReport', 'tips', language)}</h3>
            <ul className="diagnosis-points-list">
              {(diagnosisData.tipsPoints || []).map((tip, index) => (
                <li key={index}>{translateDiagnosisContent(tip, language)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <>
          <div className="diagnosis-dialog-overlay" onClick={!deleting ? cancelDelete : undefined}></div>
          <div className="diagnosis-delete-dialog">
            <h2 className="diagnosis-dialog-header">
              {getTranslation('diagnosisReport', 'deleteConfirmTitle', language)}
            </h2>
            <p className="diagnosis-dialog-description">
              {getTranslation('diagnosisReport', 'deleteConfirmDesc', language)}
            </p>
            {error && (
              <p style={{ color: '#ff4444', fontSize: '14px', marginTop: '10px' }}>
                {error}
              </p>
            )}
            <div className="diagnosis-dialog-buttons">
              <button 
                className="diagnosis-cancel-button" 
                onClick={cancelDelete}
                disabled={deleting}
              >
                {getTranslation('diagnosisReport', 'cancel', language)}
              </button>
              <button 
                className="diagnosis-delete-button" 
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? getTranslation('diagnosisReport', 'deleting', language) : getTranslation('diagnosisReport', 'delete', language)}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Save Toast */}
      {showSaveToast && (
        <div className="save-toast">
          {getTranslation('diagnosisReport', 'reportSaved', language)}
        </div>
      )}
    </div>
  );
};

export default DiagnosisReportScreen;
