# Backend Integration Guide

## ✅ Setup Complete

The frontend has been successfully integrated with the backend API!

---

## 📁 Files Created

### 1. **API Service** (`src/services/api.js`)
Central API service with axios for all backend communication.

**Services included:**
- `authService` - Authentication (register, login, OTP)
- `userService` - User profile management
- `diseaseService` - Plant disease detection & reports
- `healthService` - Backend health check

### 2. **Environment Config** (`.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BACKEND_URL=http://localhost:5000
```

---

## 🔄 Screens Updated

### ✅ RegisterScreen
- Calls `authService.sendRegistrationOTP()`
- Shows loading state while sending OTP
- Displays error messages from backend
- Success: Navigates to DetailsScreen

### ✅ RegisterOTPScreen  
- Calls `authService.register()` with user data + OTP
- Validates OTP with backend
- Calls `authService.resendOTP()` for resending
- Success: Stores token + navigates to LoginScreen

### ✅ LoginScreen
- Calls `authService.sendLoginOTP()`
- Shows success message after registration
- Displays loading/error states
- Success: Navigates to LoginOTPScreen

### 🔄 LoginOTPScreen (Needs Update)
- Should call `authService.login(mobileNumber, otpCode)`
- Should call `authService.resendOTP(mobileNumber, 'login')`
- Should store token + navigate to Dashboard

### 🔄 ScanPlantScreen (Needs Update)
- Should call `diseaseService.uploadScan(imageFile)`
- Should navigate to DiagnosisReportScreen with response

### 🔄 ProfileScreen (Needs Update)
- Should call `userService.updateProfile()`
- Should handle OTP if mobile number changes

### 🔄 AllReportsScreen (Needs Update)
- Should call `diseaseService.getAllReports()`
- Should call `diseaseService.deleteAllReports()`

### 🔄 DiagnosisReportScreen (Needs Update)
- Should call `diseaseService.deleteReport(reportId)`
- Should use `diseaseService.getImageUrl()` for images

---

## 📡 API Usage Examples

### Authentication

```javascript
import { authService } from '../services/api';

// Register - Send OTP
const response = await authService.sendRegistrationOTP('3001234567');

// Register - Complete with OTP
const userData = {
  name: 'John',
  surname: 'Doe',
  mobileNumber: '3001234567',
  province: 'Punjab',
  tehsil: 'Model Town',
  // ... other fields
};
const result = await authService.register(userData, '1234');
// Automatically stores token + userData in localStorage

// Login - Send OTP
await authService.sendLoginOTP('3001234567');

// Login - Verify OTP
const loginResult = await authService.login('3001234567', '1234');
// Automatically stores token + userData

// Resend OTP
await authService.resendOTP('3001234567', 'registration'); // or 'login'

// Logout
authService.logout(); // Clears localStorage

// Check if authenticated
const isAuth = authService.isAuthenticated();

// Get stored user data
const user = authService.getUserData();
```

### User Profile

```javascript
import { userService } from '../services/api';

// Get profile
const profile = await userService.getProfile();

// Update profile (no mobile change)
const updated = await userService.updateProfile({
  email: 'new@email.com',
  address: 'New address'
});

// Update profile (with mobile change - requires OTP)
const updatedWithOTP = await userService.updateProfile({
  mobileNumber: '3009876543',
  email: 'new@email.com'
}, '1234'); // OTP required
```

### Disease Detection

```javascript
import { diseaseService } from '../services/api';

// Upload image for scanning
const file = event.target.files[0];
const result = await diseaseService.uploadScan(file);
// Returns diagnosis report with disease info

// Get all reports
const reports = await diseaseService.getAllReports();

// Get specific report
const report = await diseaseService.getReport(reportId);

// Delete report
await diseaseService.deleteReport(reportId);

// Delete all reports
await diseaseService.deleteAllReports();

// Get image URL
const imageUrl = diseaseService.getImageUrl('uploads/123_plant.jpg');
// Returns: http://localhost:5000/uploads/123_plant.jpg
```

---

## 🔐 Authentication Flow

### Token Management

The API service automatically:
1. **Stores** JWT token in `localStorage` on login/register
2. **Attaches** token to all API requests via interceptor
3. **Redirects** to login on 401 (token expired)
4. **Clears** token on logout

### How It Works

```javascript
// Request Interceptor (automatic)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor (automatic)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## ⚠️ Error Handling

All API calls return promises. Handle errors with try/catch:

```javascript
try {
  const response = await authService.sendLoginOTP(mobileNumber);
  
  if (response.success) {
    // Handle success
  } else {
    // Handle backend error message
    setError(response.message);
  }
} catch (err) {
  // Handle network/server error
  console.error('API Error:', err);
  setError(err.response?.data?.message || 'Network error');
}
```

---

## 🚀 Starting the Application

### 1. Start Backend (Python 3.10)
```bash
cd backend
.\start_backend.ps1
# Server runs on http://localhost:5000
```

### 2. Start Frontend
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

### 3. Verify Connection
Open browser console and check:
```javascript
import { healthService } from './services/api';
const health = await healthService.checkHealth();
console.log(health); // Should show "connected"
```

---

## 📊 Backend API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/send-registration-otp` | Send registration OTP |
| POST | `/api/auth/register` | Register with OTP |
| POST | `/api/auth/send-login-otp` | Send login OTP |
| POST | `/api/auth/login` | Login with OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| POST | `/api/scan/upload` | Upload plant image |
| GET | `/api/reports` | Get all reports |
| GET | `/api/reports/:id` | Get specific report |
| DELETE | `/api/reports/:id` | Delete report |
| DELETE | `/api/reports` | Delete all reports |
| GET | `/uploads/:filename` | Get uploaded image |

---

## 📝 Important Notes

### OTP Expiry
- OTPs expire after **3 minutes**
- Display countdown timer using `expiresIn` from response

### Image Upload
- Max file size: **16MB**
- Allowed formats: PNG, JPG, JPEG, GIF
- Use FormData for multipart upload

### Token Storage
- Token stored in `localStorage.authToken`
- User data stored in `localStorage.userData`
- Clear both on logout

### CORS
- Backend has CORS enabled for `http://localhost:3000`
- Change `REACT_APP_API_URL` in `.env` for production

---

## 🔧 Next Steps

1. **Update LoginOTPScreen** - Add backend integration for OTP verification
2. **Update ScanPlantScreen** - Integrate image upload with backend
3. **Update ProfileScreen** - Connect profile updates to backend
4. **Update AllReportsScreen** - Fetch reports from backend
5. **Update DiagnosisReportScreen** - Use backend image URLs
6. **Add Protected Routes** - Redirect unauthenticated users to login
7. **Add Loading Indicators** - Show spinners during API calls
8. **Test Full Flow** - Register → Login → Scan → View Reports

---

## 🐛 Troubleshooting

### Backend Not Responding
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Restart backend
cd backend
python app.py
```

### CORS Errors
- Verify backend CORS settings
- Check `.env` has correct URL
- Clear browser cache

### Token Issues
- Check localStorage in browser DevTools
- Verify token is being sent in headers
- Check token expiry

### Image Upload Fails
- Check file size < 16MB
- Verify file format (PNG/JPG/JPEG/GIF)
- Check backend `uploads/` folder exists

---

## ✅ Integration Checklist

- [x] API service created (`src/services/api.js`)
- [x] Environment config (`.env`)
- [x] RegisterScreen integrated
- [x] RegisterOTPScreen integrated
- [x] LoginScreen integrated
- [ ] LoginOTPScreen integrated
- [ ] ScanPlantScreen integrated
- [ ] ProfileScreen integrated
- [ ] AllReportsScreen integrated
- [ ] DiagnosisReportScreen integrated
- [ ] Protected routes added
- [ ] Error boundaries added
- [ ] Loading states added
- [ ] Full E2E testing completed

---

## 📚 Additional Resources

- Backend API Documentation: `backend/API_DOCUMENTATION.md`
- Backend README: `backend/README.md`
- Python Setup Guide: `backend/PYTHON310_SETUP_COMPLETE.md`

---

**Status:** 🟢 Partial Integration Complete (3/8 screens integrated)

**Last Updated:** November 29, 2024
