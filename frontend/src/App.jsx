import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ReportsProvider } from './contexts/ReportsContext';
import { UserProvider } from './contexts/UserContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './screens/SplashScreen';
import LanguageSelectionScreen from './screens/LanguageSelectionScreen';
import RegisterScreen from './screens/RegisterScreen';
import DetailsScreen from './screens/DetailsScreen';
import RegisterOTPScreen from './screens/RegisterOTPScreen';
import LoginScreen from './screens/LoginScreen';
import LoginOTPScreen from './screens/LoginOTPScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import AllReportsScreen from './screens/AllReportsScreen';
import ScanPlantScreen from './screens/ScanPlantScreen';
import DiagnosisReportScreen from './screens/DiagnosisReportScreen';
import './App.css';

function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <ReportsProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<SplashScreen />} />
              <Route path="/language-selection" element={<LanguageSelectionScreen />} />
              <Route path="/register" element={<RegisterScreen />} />
              <Route path="/details" element={<DetailsScreen />} />
              <Route path="/register-otp" element={<RegisterOTPScreen />} />
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/login-otp" element={<LoginOTPScreen />} />
              
              {/* Protected Routes - Require Authentication */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardScreen />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/all-reports" 
                element={
                  <ProtectedRoute>
                    <AllReportsScreen />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/scan-plant" 
                element={
                  <ProtectedRoute>
                    <ScanPlantScreen />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/diagnosis-report" 
                element={
                  <ProtectedRoute>
                    <DiagnosisReportScreen />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
        </ReportsProvider>
      </UserProvider>
    </LanguageProvider>
  );
}

export default App;
