import axios from 'axios';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Auth Service ====================

export const authService = {
  /**
   * Send OTP for registration
   * @param {string} mobileNumber - Mobile number (10 digits)
   * @returns {Promise} Response with OTP details
   */
  sendRegistrationOTP: async (mobileNumber) => {
    const response = await apiClient.post('/auth/send-registration-otp', {
      mobileNumber,
    });
    return response.data;
  },

  /**
   * Register new user
   * @param {object} userData - User registration data
   * @param {string} otpCode - OTP code (4 digits)
   * @returns {Promise} Response with token and user data
   */
  register: async (userData, otpCode) => {
    const response = await apiClient.post('/auth/register', {
      ...userData,
      otpCode,
    });
    
    // Save token and user data to localStorage
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Send OTP for login
   * @param {string} mobileNumber - Mobile number
   * @returns {Promise} Response with OTP details
   */
  sendLoginOTP: async (mobileNumber) => {
    const response = await apiClient.post('/auth/send-login-otp', {
      mobileNumber,
    });
    return response.data;
  },

  /**
   * Login user with OTP
   * @param {string} mobileNumber - Mobile number
   * @param {string} otpCode - OTP code
   * @returns {Promise} Response with token and user data
   */
  login: async (mobileNumber, otpCode) => {
    const response = await apiClient.post('/auth/login', {
      mobileNumber,
      otpCode,
    });
    
    // Save token and user data to localStorage
    if (response.data.success) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  /**
   * Resend OTP
   * @param {string} mobileNumber - Mobile number
   * @param {string} purpose - 'registration' or 'login'
   * @returns {Promise} Response with OTP details
   */
  resendOTP: async (mobileNumber, purpose = 'registration') => {
    const response = await apiClient.post('/auth/resend-otp', {
      mobileNumber,
      purpose,
    });
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  /**
   * Get stored auth token
   * @returns {string|null} Auth token
   */
  getToken: () => {
    return localStorage.getItem('authToken');
  },

  /**
   * Get stored user data
   * @returns {object|null} User data
   */
  getUserData: () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Is authenticated
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

// ==================== User Service ====================

export const userService = {
  /**
   * Get user profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  /**
   * Update user profile
   * @param {object} updateData - Data to update (email, address, mobileNumber)
   * @param {string} otpCode - Required if changing mobile number
   * @returns {Promise} Updated user data
   */
  updateProfile: async (updateData, otpCode = null) => {
    const response = await apiClient.put('/user/profile', {
      ...updateData,
      otpCode,
    });
    
    // Update stored user data
    if (response.data.success) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },
};

// ==================== Disease Detection Service ====================

export const diseaseService = {
  /**
   * Upload plant image for disease detection
   * @param {File} imageFile - Image file
   * @returns {Promise} Diagnosis report
   */
  uploadScan: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiClient.post('/scan/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  /**
   * Get all reports for user
   * @returns {Promise} List of reports
   */
  getAllReports: async () => {
    const response = await apiClient.get('/reports');
    return response.data;
  },

  /**
   * Save diagnosis report to database
   * @param {Object} diagnosisData - Diagnosis data to save
   * @returns {Promise} Save confirmation with report ID
   */
  saveReport: async (diagnosisData) => {
    const response = await apiClient.post('/reports/save', {
      imagePath: diagnosisData.imagePath,
      isHealthy: diagnosisData.isHealthy,
      diseaseKey: diagnosisData.diseaseName?.toLowerCase().replace(/ /g, '_') || '',
      confidence: diagnosisData.confidence || 0
    });
    return response.data;
  },

  /**
   * Get specific report details
   * @param {string|number} reportId - Report ID
   * @returns {Promise} Report details
   */
  getReport: async (reportId) => {
    const response = await apiClient.get(`/reports/${reportId}`);
    return response.data;
  },

  /**
   * Delete specific report
   * @param {string|number} reportId - Report ID
   * @returns {Promise} Delete confirmation
   */
  deleteReport: async (reportId) => {
    const response = await apiClient.delete(`/reports/${reportId}`);
    return response.data;
  },

  /**
   * Delete all reports
   * @returns {Promise} Delete confirmation
   */
  deleteAllReports: async () => {
    const response = await apiClient.delete('/reports');
    return response.data;
  },

  /**
   * Get image URL for uploaded file
   * @param {string} imagePath - Image path from backend
   * @returns {string} Full image URL
   */
  getImageUrl: (imagePath) => {
    if (!imagePath) return '';
    // Handle both full paths and just filenames
    const filename = imagePath.includes('/') ? imagePath.split('/').pop() : imagePath;
    return `http://localhost:5000/uploads/${filename}`;
  },
};

// ==================== Health Check Service ====================

export const healthService = {
  /**
   * Check backend health
   * @returns {Promise} Health status
   */
  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

// ==================== Rating Service ====================

export const ratingService = {
  /**
   * Submit user rating and feedback
   * @param {object} ratingData - Rating data with rating (1-5) and optional feedback
   * @returns {Promise} Response with success status
   */
  submitRating: async (ratingData) => {
    const response = await apiClient.post('/ratings', {
      rating: ratingData.rating,
      feedback: ratingData.feedback || ''
    });
    return response.data;
  },

  /**
   * Get all ratings (admin only)
   * @returns {Promise} List of ratings
   */
  getAllRatings: async () => {
    const response = await apiClient.get('/ratings');
    return response.data;
  },
};

// Default export
export default {
  authService,
  userService,
  diseaseService,
  healthService,
  ratingService,
};
