# 🚀 GrowGuardians Frontend Setup & Run Guide

## ✅ Prerequisites

- Node.js installed (v16 or higher)
- Backend server running on `http://localhost:5000`

---

## 📦 Installation

### 1. Navigate to Frontend Directory
```powershell
cd "C:\Users\Hp Pc\OneDrive\Desktop\FYPGrowGuardians\frontend"
```

### 2. Install Dependencies (if not already done)
```powershell
npm install
```

**Dependencies include:**
- React 19.2.0
- React Router DOM 7.9.6
- Axios 1.13.2 ✅ (Already installed)
- React Scripts 5.0.1

---

## 🚀 Running the Application

### Start Development Server
```powershell
npm start
```

The app will automatically open at **http://localhost:3000**

---

## 🔧 Available Scripts

### Development
```powershell
npm start
# Starts development server on http://localhost:3000
# Hot reload enabled
```

### Build for Production
```powershell
npm run build
# Creates optimized production build in /build folder
```

### Run Tests
```powershell
npm test
# Launches test runner in interactive watch mode
```

---

## 🔌 Backend Connection

### Environment Variables
The frontend connects to backend using `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_BACKEND_URL=http://localhost:5000
```

### Verify Backend Connection
1. Start backend first:
   ```powershell
   cd backend
   .\start_backend.ps1
   ```

2. Start frontend:
   ```powershell
   cd frontend
   npm start
   ```

3. Open browser console and check network tab
   - All API calls should go to `http://localhost:5000/api`

---

## 🧪 Testing the Integration

### 1. Health Check
Open browser console:
```javascript
// Check if backend is running
fetch('http://localhost:5000/api/health')
  .then(res => res.json())
  .then(data => console.log(data));
// Should return: { success: true, database: "connected" }
```

### 2. Registration Flow
1. Go to http://localhost:3000
2. Click "Get Started"
3. Enter mobile: `3001234567`
4. Fill details form
5. Check backend console for OTP (e.g., `1234`)
6. Enter OTP
7. Should navigate to login screen

### 3. Login Flow
1. Click "Login here"
2. Enter mobile: `3001234567`
3. Click "Generate OTP"
4. Check backend console for OTP
5. Enter OTP
6. Should navigate to dashboard

### 4. Disease Detection
1. From dashboard, click "Plant Disease Detection"
2. Upload a plant image
3. Wait for analysis (shows "Analyzing...")
4. View diagnosis report
5. Report should show AI results

---

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── App.jsx                    # Main app component
│   ├── index.jsx                  # Entry point
│   ├── contexts/
│   │   ├── UserContext.jsx        # User state management
│   │   └── ReportsContext.jsx     # Reports state management
│   ├── screens/                   # All screen components
│   │   ├── SplashScreen.jsx
│   │   ├── RegisterScreen.jsx     ✅ Backend integrated
│   │   ├── RegisterOTPScreen.jsx  ✅ Backend integrated
│   │   ├── LoginScreen.jsx        ✅ Backend integrated
│   │   ├── LoginOTPScreen.jsx     ✅ Backend integrated
│   │   ├── DetailsScreen.jsx
│   │   ├── DashboardScreen.jsx
│   │   ├── ProfileScreen.jsx
│   │   ├── ScanPlantScreen.jsx    ✅ Backend integrated
│   │   ├── AllReportsScreen.jsx
│   │   └── DiagnosisReportScreen.jsx
│   ├── services/
│   │   └── api.js                 ✅ NEW: Backend API service
│   └── styles/                    # CSS files
├── .env                           ✅ NEW: Environment config
├── package.json
└── README.md
```

---

## 🔐 Authentication Flow

### Token Management
- JWT token stored in `localStorage.authToken`
- User data stored in `localStorage.userData`
- Automatically attached to API requests
- Cleared on logout

### Check Auth Status
```javascript
// In any component
import { authService } from './services/api';

const isLoggedIn = authService.isAuthenticated();
const user = authService.getUserData();
const token = authService.getToken();
```

---

## ⚠️ Troubleshooting

### Port Already in Use
If port 3000 is busy:
```
? Something is already running on port 3000. 
  Would you like to run the app on another port instead? (Y/n)
```
Type `Y` and press Enter.

### Backend Connection Failed
**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

**Solutions:**
1. Check if backend is running:
   ```powershell
   # In backend folder
   python app.py
   ```

2. Verify backend URL in `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. Check CORS settings in backend `app.py`:
   ```python
   CORS(app)  # Should allow all origins in development
   ```

### OTP Not Working
**Issue:** OTP verification fails

**Solutions:**
1. Check backend console for generated OTP
2. OTPs expire after 3 minutes - request new one
3. Verify mobile number format (10 digits without +92)

### Image Upload Fails
**Issue:** Plant scan fails

**Solutions:**
1. Check file size < 16MB
2. Verify file format (PNG, JPG, JPEG, GIF)
3. Ensure backend `uploads/` folder exists
4. Check backend logs for errors

### Clear localStorage
If experiencing auth issues:
```javascript
// Open browser console
localStorage.clear();
// Then refresh page
```

---

## 🎯 Development Tips

### Hot Reload
- Save any file to see changes instantly
- No need to restart server

### Console Logs
- API calls logged in browser console
- Backend responses visible in Network tab
- Check both frontend and backend logs

### Component Structure
- All screens are functional components
- Using React Hooks (useState, useEffect, useRef)
- Context API for global state (UserContext, ReportsContext)

### Styling
- Individual CSS files per screen
- Located in same folder as component
- Import: `import './ScreenName.css'`

---

## 📊 API Integration Status

| Feature | Status | Endpoint |
|---------|--------|----------|
| Send Registration OTP | ✅ Working | POST /api/auth/send-registration-otp |
| Register User | ✅ Working | POST /api/auth/register |
| Send Login OTP | ✅ Working | POST /api/auth/send-login-otp |
| Login User | ✅ Working | POST /api/auth/login |
| Resend OTP | ✅ Working | POST /api/auth/resend-otp |
| Upload Plant Image | ✅ Working | POST /api/scan/upload |
| Get All Reports | ⚠️ Pending | GET /api/reports |
| Delete Report | ⚠️ Pending | DELETE /api/reports/:id |
| Update Profile | ⚠️ Pending | PUT /api/user/profile |

---

## 📚 Additional Resources

- **Integration Guide:** `BACKEND_INTEGRATION_GUIDE.md`
- **Integration Summary:** `../INTEGRATION_SUMMARY.md`
- **Backend API Docs:** `../backend/API_DOCUMENTATION.md`
- **TypeScript Conversion:** `TYPESCRIPT_TO_JAVASCRIPT_CONVERSION.md`

---

## ✅ Quick Start Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `.env` file exists with correct URLs
- [ ] Browser opened to http://localhost:3000
- [ ] Console open for debugging
- [ ] Backend console visible for OTP codes

---

## 🚀 Start Both Servers

### Option 1: Two Terminals

**Terminal 1 (Backend):**
```powershell
cd "C:\Users\Hp Pc\OneDrive\Desktop\FYPGrowGuardians\backend"
.\start_backend.ps1
```

**Terminal 2 (Frontend):**
```powershell
cd "C:\Users\Hp Pc\OneDrive\Desktop\FYPGrowGuardians\frontend"
npm start
```

### Option 2: Single PowerShell Script
Create `start-all.ps1` in project root:
```powershell
# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\start_backend.ps1"

# Wait 3 seconds for backend to start
Start-Sleep -Seconds 3

# Start frontend
cd frontend
npm start
```

Run: `.\start-all.ps1`

---

## 🎉 You're All Set!

Your GrowGuardians frontend is now connected to the backend and ready for development!

**Test the complete flow:**
1. ✅ Register new user
2. ✅ Login with OTP
3. ✅ Upload plant image
4. ✅ View diagnosis report

---

**Last Updated:** November 29, 2024  
**Status:** 🟢 Integration Complete
