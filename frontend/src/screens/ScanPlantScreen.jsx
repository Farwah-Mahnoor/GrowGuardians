import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { diseaseService } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';
import LanguageToggle from '../components/LanguageToggle';
import './ScanPlantScreen.css';

const ScanPlantScreen = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  const handleTakePicture = async () => {
    // Try to open device camera using MediaDevices API
    try {
      setError('');
      
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera on mobile
        } 
      });
      
      // Store stream and show camera view
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait for video element to be ready
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
      
    } catch (err) {
      console.error('Camera access error:', err);
      
      // Fallback to file input if camera access denied
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Using file picker instead.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Using file picker instead.');
      } else {
        setError('Camera not available. Using file picker instead.');
      }
      
      // Open file picker as fallback
      setTimeout(() => {
        if (fileInputRef.current) {
          fileInputRef.current.setAttribute('capture', 'environment');
          fileInputRef.current.click();
        }
      }, 1000);
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Failed to capture image');
        return;
      }
      
      // Create file from blob
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      // Stop camera
      handleCloseCamera();
      
      // Upload the captured image
      await uploadImage(file);
    }, 'image/jpeg', 0.9);
  };

  const handleCloseCamera = () => {
    // Stop all video streams
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const handleUploadPicture = () => {
    // Open file picker for gallery
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    setError('');

    try {
      console.log('📤 Uploading file:', file.name);
      
      // Upload to backend for disease detection
      const response = await diseaseService.uploadScan(file);
      console.log('📨 Backend response:', response);
      
      if (response.success && response.diagnosisData) {
        console.log('✅ Analysis successful!');
        
        // Navigate to diagnosis report with the analyzed data
        navigate('/diagnosis-report', { state: { diagnosisData: response.diagnosisData } });
      } else {
        console.error('❌ Analysis failed:', response);
        setError(response.message || 'Failed to analyze image. Please try again.');
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Upload the selected file
    await uploadImage(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="scan-plant-screen">
      <div className="scan-header">
        <button className="scan-back-arrow" onClick={() => navigate(-1)}>
          ←
        </button>
        <LanguageToggle />
      </div>

      {/* Camera View Modal */}
      {showCamera && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)'
          }}>
            <button 
              onClick={handleCloseCamera}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '10px'
              }}
            >
              ✕
            </button>
            <h3 style={{ color: 'white', margin: 0 }}>{getTranslation('scan', 'takePhoto', language)}</h3>
            <div style={{ width: '44px' }}></div>
          </div>
          
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            style={{
              flex: 1,
              width: '100%',
              objectFit: 'cover'
            }}
          />
          
          <div style={{
            padding: '30px',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.8)'
          }}>
            <button
              onClick={handleCapturePhoto}
              disabled={uploading}
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '50%',
                backgroundColor: 'white',
                border: '5px solid #016E43',
                cursor: 'pointer',
                fontSize: '24px'
              }}
            >
              📸
            </button>
          </div>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}

      <div className="scan-content">
        <div className="scan-card">
          <h2 className="scan-header">{getTranslation('scan', 'title', language)}</h2>

          {uploading && (
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              color: '#016E43',
              fontSize: '16px',
              fontWeight: '500'
            }}>
              🔬 {getTranslation('scan', 'analyzing', language)}
            </div>
          )}

          {error && (
            <div style={{ 
              color: '#ff4444', 
              marginTop: '15px', 
              fontSize: '14px', 
              textAlign: 'center',
              padding: '10px',
              backgroundColor: '#ffebee',
              borderRadius: '8px'
            }}>
              {error}
            </div>
          )}

          <div className="scan-buttons">
            <button 
              className="scan-button" 
              onClick={handleTakePicture}
              disabled={uploading}
            >
              <span>{getTranslation('scan', 'takePicture', language)}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M9 3L7.5 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.5L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
                <circle cx="12" cy="13" r="3" fill="white"/>
              </svg>
            </button>

            <button 
              className="scan-button" 
              onClick={handleUploadPicture}
              disabled={uploading}
            >
              <span>{getTranslation('scan', 'uploadPicture', language)}</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
              </svg>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="scan-bottom-nav"></div>
    </div>
  );
};

export default ScanPlantScreen;
