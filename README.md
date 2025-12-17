# 🌿 GrowGuardians - Plant Disease Detection System

A full-stack web application that helps farmers detect plant diseases using AI/ML technology with bilingual support (English & Urdu).

## 📋 Project Overview

GrowGuardians is a comprehensive agricultural support system designed specifically for farmers in Pakistan. The application leverages deep learning to analyze plant images and provide instant disease diagnosis along with treatment recommendations. With bilingual support for both English and Urdu, the app ensures accessibility for farmers regardless of their language preference.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│              http://localhost:3000                          │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP REST API
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Flask)                          │
│              http://localhost:5000                          │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                         │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Key Features

### Authentication
- OTP-based registration and login system
- SMS delivery via Twilio (with console fallback for development)
- JWT token authentication for secure API access

### User Management
- Comprehensive user profiles with location details
- Profile editing capabilities
- Secure mobile number updates with OTP verification

### Plant Disease Detection
- AI-powered image analysis using PyTorch ResNet50 model
- Instant disease diagnosis with confidence scores
- Detailed treatment recommendations
- Image capture and upload functionality

### Bilingual Support
- Full application support in English and Urdu
- Dynamic language switching
- Comprehensive translation dictionary

### Report Management
- Save and view historical disease detection reports
- Detailed diagnosis information storage
- Report deletion capabilities

## 🛠️ Technology Stack

### Frontend
- **React 19.2.0** - JavaScript library for building user interfaces
- **React Router DOM 7.9.6** - Declarative routing for React applications
- **Axios 1.13.2** - Promise-based HTTP client
- **Context API** - State management solution

### Backend
- **Flask 3.0.0** - Python web framework
- **PyTorch 2.0.1** - Machine learning framework
- **MySQL** - Relational database management system
- **PyJWT 2.8.0** - JSON Web Token implementation
- **Twilio 8.10.0** - Communication API for SMS

### AI/ML Model
- **ResNet50** - Deep convolutional neural network
- **Pre-trained on ImageNet** - Transfer learning approach
- **Custom fine-tuned** - For plant disease detection

## 📁 Project Structure

```
GrowGuardians/
├── frontend/                    # React frontend application
│   ├── public/                 # Static assets
│   ├── src/                    # Source code
│   │   ├── components/         # Reusable components
│   │   ├── contexts/           # React context providers
│   │   ├── screens/            # Screen components
│   │   ├── services/           # API service layer
│   │   ├── utils/              # Utility functions
│   │   └── App.jsx             # Main application component
│   └── package.json            # Frontend dependencies
│
├── backend/                     # Flask backend application
│   ├── app.py                  # Main Flask application
│   ├── database.py             # Database connection
│   ├── user_service.py         # User management logic
│   ├── otp_service.py          # OTP handling
│   ├── disease_detection.py    # AI model integration
│   ├── requirements.txt        # Backend dependencies
│   └── uploads/                # Uploaded images
│
├── best_resnet50.pth           # Trained PyTorch model
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **Python** (3.10 or higher)
- **MySQL** Server
- **Git** (for version control)

### Installation

#### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add required images to the `public` folder:
   - `logo.png` (Application logo)
   - `registration-illustration.png` (Registration screen)
   - `loginpagepic.png` (Login screen)

4. Start the development server:
   ```bash
   npm start
   ```

#### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables in `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=growguardians
   SECRET_KEY=your_secret_key_here
   MODEL_PATH=path_to_your_model_file
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ENABLE_SMS=True
   ```

4. Start the backend server:
   ```bash
   python app.py
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/send-registration-otp` - Send OTP for registration
- `POST /api/auth/register` - Register new user
- `POST /api/auth/send-login-otp` - Send OTP for login
- `POST /api/auth/login` - Login user
- `POST /api/auth/resend-otp` - Resend OTP

### User Profile
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Disease Detection
- `POST /api/scan/upload` - Upload plant image for analysis
- `GET /api/reports` - Get all reports
- `POST /api/reports/save` - Save a report
- `GET /api/reports/:id` - Get specific report
- `DELETE /api/reports/:id` - Delete report
- `DELETE /api/reports` - Delete all reports

## 🎯 Screens

1. **Splash Screen** - Initial loading screen
2. **Language Selection** - Choose between English and Urdu
3. **Registration** - Mobile number input
4. **Details** - User information form
5. **Registration OTP** - OTP verification
6. **Login** - Mobile number login
7. **Login OTP** - OTP verification
8. **Dashboard** - Main application hub
9. **Profile** - User profile management
10. **All Reports** - View saved reports
11. **Scan Plant** - Capture/upload plant images
12. **Diagnosis Report** - View diagnosis results

## 🔐 Security

- **JWT Authentication** - Secure token-based authentication
- **OTP Verification** - Two-factor authentication for critical actions
- **SQL Injection Prevention** - Parameterized database queries
- **CORS Protection** - Controlled cross-origin resource sharing

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(150),
    province VARCHAR(100),
    district VARCHAR(100),
    tehsil VARCHAR(100) NOT NULL,
    village VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

### OTP Codes Table
```sql
CREATE TABLE otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mobile_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE
)
```

### Disease Reports Table
```sql
CREATE TABLE disease_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    is_healthy BOOLEAN NOT NULL,
    disease_name VARCHAR(200) NOT NULL,
    confidence_score DECIMAL(5,2),
    diagnosis_details TEXT,
    treatment_tips TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

## 🌍 Bilingual Support

The application fully supports both English and Urdu languages. All UI elements, error messages, and disease information are translated dynamically based on user preference. The translation system uses external mapping tables to ensure flexibility and easy maintenance.

## 🧪 Testing

Both frontend and backend components have been thoroughly tested:

### Backend Tests
```bash
cd backend
python test_backend.py
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📈 Performance Metrics

- **OTP Generation:** < 50ms
- **User Registration:** < 100ms
- **User Login:** < 100ms
- **Image Upload:** < 500ms
- **Model Prediction:** 1-3 seconds
- **Report Retrieval:** < 50ms

## 🚧 Known Issues

1. **PyTorch Model Loading:** May encounter compatibility issues with newer Python versions. Recommend using Python 3.10 for optimal performance.

## 📚 Documentation

- **API Documentation:** See `backend/API_DOCUMENTATION.md`
- **System Architecture:** See `SYSTEM_ARCHITECTURE.md`
- **Technical Interview Guide:** See `TECHNICAL_INTERVIEW_GUIDE.md`

## 👥 Authors

- **Farwah Mahnoor** - [Farwah-Mahnoor](https://github.com/Farwah-Mahnoor)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Agricultural experts for domain knowledge
- Open source community for tools and libraries
- Supervisors and mentors for guidance

---