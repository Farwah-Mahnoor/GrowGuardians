# GrowGuardians Backend API Documentation

## 🚀 Server Information

**Base URL:** `http://localhost:5000/api`

**Status:** ✅ Running
- Database: MySQL (growguardians)
- Port: 5000
- CORS: Enabled (all origins)

---

## 📋 API Endpoints

### 1. Health Check

**Endpoint:** `GET /api/health`

**Description:** Check if backend is running and database is connected

**Response:**
```json
{
  "success": true,
  "message": "GrowGuardians Backend is running",
  "database": "connected"
}
```

---

## 🔐 Authentication Endpoints

### 2. Send Registration OTP

**Endpoint:** `POST /api/auth/send-registration-otp`

**Description:** Send OTP to mobile number for registration (Screen 2 → Screen 3)

**Request Body:**
```json
{
  "mobileNumber": "03001234567"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "1234",
  "expiresIn": 180
}
```

**Response (Error - User exists):**
```json
{
  "success": false,
  "message": "Mobile number already registered"
}
```

---

### 3. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Register new user with OTP verification (Screen 4)

**Request Body:**
```json
{
  "name": "John",
  "surname": "Doe",
  "mobileNumber": "03001234567",
  "email": "john@example.com",
  "province": "Punjab",
  "district": "Lahore",
  "tehsil": "Model Town",
  "village": "Village Name",
  "address": "123 Street",
  "otpCode": "1234"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "mobileNumber": "03001234567",
    "email": "john@example.com",
    "province": "Punjab",
    "district": "Lahore",
    "tehsil": "Model Town",
    "village": "Village Name",
    "address": "123 Street"
  }
}
```

**Response (Error - Invalid OTP):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

---

### 4. Resend OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Description:** Resend OTP for registration or login

**Request Body:**
```json
{
  "mobileNumber": "03001234567",
  "purpose": "registration"
}
```

**Purpose Values:**
- `"registration"` - For registration OTP
- `"login"` - For login OTP

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "5678",
  "expiresIn": 180
}
```

---

### 5. Send Login OTP

**Endpoint:** `POST /api/auth/send-login-otp`

**Description:** Send OTP to registered mobile number for login (Screen 5)

**Request Body:**
```json
{
  "mobileNumber": "03001234567"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "1234",
  "expiresIn": 180
}
```

**Response (Error - Not registered):**
```json
{
  "success": false,
  "message": "Mobile number not registered"
}
```

---

### 6. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Login user with OTP verification (Screen 6)

**Request Body:**
```json
{
  "mobileNumber": "03001234567",
  "otpCode": "1234"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "mobileNumber": "03001234567",
    "email": "john@example.com",
    "province": "Punjab",
    "district": "Lahore",
    "tehsil": "Model Town",
    "village": "Village Name",
    "address": "123 Street"
  }
}
```

---

## 👤 User Profile Endpoints

### 7. Get User Profile

**Endpoint:** `GET /api/user/profile`

**Description:** Get authenticated user's profile (Screen 8)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "mobileNumber": "03001234567",
    "email": "john@example.com",
    "province": "Punjab",
    "district": "Lahore",
    "tehsil": "Model Town",
    "village": "Village Name",
    "address": "123 Street"
  }
}
```

---

### 8. Update User Profile

**Endpoint:** `PUT /api/user/profile`

**Description:** Update user profile (Screen 8 - Edit Profile)

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (General update):**
```json
{
  "email": "newemail@example.com",
  "address": "New Address 456"
}
```

**Request Body (Mobile number change - requires OTP):**
```json
{
  "mobileNumber": "03009876543",
  "email": "john@example.com",
  "address": "123 Street",
  "otpCode": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "name": "John",
    "surname": "Doe",
    "mobileNumber": "03009876543",
    "email": "newemail@example.com",
    "address": "New Address 456"
  }
}
```

---

## 🌿 Disease Detection Endpoints

### 9. Upload Plant Image for Scanning

**Endpoint:** `POST /api/scan/upload`

**Description:** Upload plant image for disease detection (Screen 10)

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData:
  image: <file> (PNG, JPG, JPEG, GIF)
```

**Response:**
```json
{
  "success": true,
  "report": {
    "id": 1,
    "isHealthy": false,
    "diseaseName": "Tomato Late Blight",
    "confidenceScore": 95.5,
    "diagnosisDetails": [
      "Brown spots on leaves",
      "White fuzzy growth on underside",
      "Rapid spreading of infection"
    ],
    "treatmentTips": [
      "Remove infected leaves immediately",
      "Apply copper-based fungicide",
      "Ensure good air circulation",
      "Avoid overhead watering"
    ],
    "imagePath": "uploads/1_20241129_123456_plant.jpg",
    "createdAt": "2024-11-29T12:34:56.000Z"
  }
}
```

---

### 10. Get All Reports

**Endpoint:** `GET /api/reports`

**Description:** Get all saved reports for authenticated user (Screen 9 - All Reports)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "reports": [
    {
      "id": 1,
      "isHealthy": false,
      "diseaseName": "Tomato Late Blight",
      "imagePath": "uploads/1_20241129_123456_plant.jpg",
      "createdAt": "2024-11-29T12:34:56.000Z"
    },
    {
      "id": 2,
      "isHealthy": true,
      "diseaseName": "Healthy Plant",
      "imagePath": "uploads/1_20241129_143210_plant.jpg",
      "createdAt": "2024-11-29T14:32:10.000Z"
    }
  ]
}
```

---

### 11. Get Specific Report

**Endpoint:** `GET /api/reports/:reportId`

**Description:** Get details of a specific report (Screen 11)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "report": {
    "id": 1,
    "isHealthy": false,
    "diseaseName": "Tomato Late Blight",
    "confidenceScore": 95.5,
    "diagnosisDetails": [
      "Brown spots on leaves",
      "White fuzzy growth on underside"
    ],
    "treatmentTips": [
      "Remove infected leaves",
      "Apply fungicide"
    ],
    "imagePath": "uploads/1_20241129_123456_plant.jpg",
    "createdAt": "2024-11-29T12:34:56.000Z"
  }
}
```

---

### 12. Delete Report

**Endpoint:** `DELETE /api/reports/:reportId`

**Description:** Delete a specific report

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

### 13. Delete All Reports

**Endpoint:** `DELETE /api/reports`

**Description:** Delete all reports for authenticated user

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "All reports deleted successfully"
}
```

---

## 🖼️ File Serving

### 14. Get Uploaded Image

**Endpoint:** `GET /uploads/:filename`

**Description:** Serve uploaded plant images

**Example:** `http://localhost:5000/uploads/1_20241129_123456_plant.jpg`

---

## 🔒 Authentication Flow

### Registration Flow (Screens 2-4-7)
1. User enters mobile number (Screen 2)
2. Frontend calls `POST /api/auth/send-registration-otp`
3. User fills details (Screen 3)
4. User enters OTP (Screen 4)
5. Frontend calls `POST /api/auth/register`
6. Backend returns token + user data
7. Navigate to Dashboard (Screen 7)

### Login Flow (Screens 5-6-7)
1. User enters mobile number (Screen 5)
2. Frontend calls `POST /api/auth/send-login-otp`
3. User enters OTP (Screen 6)
4. Frontend calls `POST /api/auth/login`
5. Backend returns token + user data
6. Navigate to Dashboard (Screen 7)

### Profile Update Flow (Screen 8)
1. Load profile with `GET /api/user/profile`
2. User edits data
3. If mobile changed: Send OTP first with `POST /api/auth/resend-otp`
4. User enters OTP
5. Call `PUT /api/user/profile` with OTP
6. Navigate back to Dashboard

### Disease Detection Flow (Screens 10-11)
1. User takes/uploads photo (Screen 10)
2. Frontend calls `POST /api/scan/upload`
3. Backend analyzes with AI model
4. Backend returns diagnosis report
5. Display report (Screen 11)
6. Report auto-saved in database

---

## 📝 Important Notes

### OTP Expiry
- All OTPs expire after **3 minutes** (180 seconds)
- Use `expiresIn` field to show countdown timer

### Token Management
- Store JWT token in localStorage or sessionStorage
- Send token in `Authorization: Bearer <token>` header
- Token contains user_id for authentication

### Image Upload
- Max file size: 16MB
- Allowed formats: PNG, JPG, JPEG, GIF
- Images saved in `backend/uploads/` folder

### Error Handling
All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### Database Tables Created
1. **users** - User account information
2. **otp_codes** - OTP verification codes
3. **disease_reports** - Saved plant diagnosis reports

---

## ⚠️ Current Status

✅ **Working:**
- All authentication endpoints
- User profile management
- Database connection
- OTP generation & validation
- Report storage & retrieval

⚙️ **TensorFlow Model Issue:**
- Model loading has DLL compatibility issue with Python 3.13
- API endpoints work but may return mock predictions
- To fix: Install Visual C++ Redistributable or use Python 3.10

---

## 🔧 Testing the API

You can test endpoints using:
- **Postman** - Import endpoints and test
- **Thunder Client** (VS Code extension)
- **cURL** commands
- **Frontend React app**

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/send-registration-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber": "03001234567"}'
```

---

## 📞 Support

- Backend running on: http://localhost:5000
- Frontend running on: http://localhost:3000
- Database: MySQL (localhost:3306)
