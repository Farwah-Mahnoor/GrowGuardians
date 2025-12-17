import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { diseaseService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation, translateDiseaseName } from '../utils/translations';
import LanguageToggle from '../components/LanguageToggle';
import './AllReportsScreen.css';

const AllReportsScreen = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [savedReports, setSavedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch reports from backend on mount
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await diseaseService.getAllReports();
      
      if (response.success && response.reports) {
        // Backend returns reports with correct field names
        setSavedReports(response.reports);
      } else {
        setError(response.message || 'Failed to load reports');
      }
    } catch (err) {
      console.error('Fetch reports error:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = () => {
    setShowOptionsMenu(false);
    setShowDeleteDialog(true);
  };

  const confirmDeleteAll = async () => {
    try {
      const response = await diseaseService.deleteAllReports();
      
      if (response.success) {
        setSavedReports([]);
        setShowDeleteDialog(false);
      } else {
        setError(response.message || 'Failed to delete reports');
        setShowDeleteDialog(false);
      }
    } catch (err) {
      console.error('Delete all reports error:', err);
      setError('Failed to delete reports. Please try again.');
      setShowDeleteDialog(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleReportClick = async (reportId) => {
    // Fetch full report details from backend
    try {
      setLoading(true);
      const response = await diseaseService.getReport(reportId);
      
      if (response.success && response.diagnosisData) {
        navigate('/diagnosis-report', { state: { diagnosisData: response.diagnosisData } });
      } else {
        setError('Failed to load report details');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to load report details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="all-reports-screen">
      <div className="reports-header">
        <button className="reports-back-arrow" onClick={() => navigate(-1)}>
          ←
        </button>
        <h1 className="reports-heading">{getTranslation('allReports', 'title', language)}</h1>
        <LanguageToggle />
        <button 
          className="options-menu-button"
          onClick={() => setShowOptionsMenu(!showOptionsMenu)}
        >
          ⋯
        </button>

        {showOptionsMenu && (
          <div className="options-dropdown">
            <div className="options-item" onClick={handleDeleteAll}>
              <span>{getTranslation('allReports', 'deleteAll', language)}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 3V2H13V3H17V5H3V3H7Z" fill="#FF4B4B"/>
                <path d="M5 6V17C5 17.55 5.45 18 6 18H14C14.55 18 15 17.55 15 17V6H5Z" fill="#FF4B4B"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="reports-list">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            {getTranslation('allReports', 'loadingReports', language)}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#ff4444', marginBottom: '15px' }}>{error}</p>
            <button 
              onClick={fetchReports}
              style={{
                padding: '10px 20px',
                backgroundColor: '#016E43',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              {getTranslation('allReports', 'retry', language)}
            </button>
          </div>
        ) : savedReports.length === 0 ? (
          <div className="no-reports">
            <p>{getTranslation('allReports', 'noReports', language)}</p>
          </div>
        ) : (
          savedReports.map(report => (
            <div 
              key={report.id} 
              className="report-item"
              onClick={() => handleReportClick(report.id)}
            >
              <div className="report-image">
                <img 
                  src={diseaseService.getImageUrl(report.image)} 
                  alt={report.title} 
                  onError={(e) => { e.target.src = '/placeholder-plant.jpg'; }}
                />
              </div>
              <div className="report-info">
                <div className="report-title">{translateDiseaseName(report.title, language) || getTranslation('allReports', 'unknownDisease', language)}</div>
                <div className="report-date">{report.date}</div>
              </div>
              <div className="report-arrow">→</div>
            </div>
          ))
        )}
      </div>

      {showDeleteDialog && (
        <>
          <div className="dialog-overlay" onClick={cancelDelete}></div>
          <div className="delete-dialog">
            <h2 className="dialog-header">
              {getTranslation('allReports', 'deleteAllConfirm', language)}
            </h2>
            <p className="dialog-description">
              {getTranslation('allReports', 'deleteAllDesc', language)}
            </p>
            <div className="dialog-buttons">
              <button className="cancel-button" onClick={cancelDelete}>
                {getTranslation('allReports', 'cancel', language)}
              </button>
              <button className="delete-button" onClick={confirmDeleteAll}>
                {getTranslation('allReports', 'delete', language)}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllReportsScreen;
