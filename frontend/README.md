# GrowGuardians Frontend

A React-based frontend for the GrowGuardians plant disease detection application.

## Overview

GrowGuardians is a mobile app that helps farmers detect plant diseases using AI. It also provides real-time weather updates and predicts crop yield based on user input. The goal is to make farming easier, smarter, and more productive for every farmer.

## Features Implemented

### Screens
1. **Splash Screen** - Landing page with logo (3-second display)
2. **Registration Screen** - Mobile number input with country code
3. **Details Screen** - User information form with province selection
4. **Registration OTP Screen** - 4-digit OTP verification for registration
5. **Login Screen** - Mobile number login
6. **Login OTP Screen** - OTP verification for login with countdown timer
7. **Dashboard Screen** - Main hub with side menu, user profile, and feature cards
8. **Profile Screen** - Edit user profile with curved wave design
9. **All Reports Screen** - List of disease detection reports with delete functionality
10. **Scan Plant Screen** - Take or upload photos for disease detection
11. **Diagnosis Report Screen** - Detailed disease analysis with treatment recommendations

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. **Add Required Images**
   
   Place the following images in the `public` folder:
   - `logo.png` (242px × 211px) - GrowGuardians logo for splash screen
   - `registration-illustration.png` (340px × 280px) - Registration screen illustration
   - `loginpagepic.png` (300px × 300px) - Login screen illustration

### Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

## Technology Stack

- **React 18** with TypeScript
- **React Router DOM** for navigation
- **CSS3** for styling
- **Responsive Design** principles

## Screen Flow

1. Splash Screen (3s) → Registration Screen
2. Registration Screen → Details Screen → Registration OTP → Login Screen
3. Login Screen → Login OTP Screen → Dashboard
4. Dashboard → Profile / All Reports / Scan Plant
5. Profile → Update and return to Dashboard (or OTP if mobile changed)
6. Scan Plant → Camera/Gallery → Diagnosis Report
7. All Reports → Click Report → Diagnosis Report
8. Diagnosis Report → Delete → Back to All Reports

## Color Palette

- Primary Aqua: `#32D8C2`
- Light Aqua: `#B1F0E7`
- Gradient Background: `#C4FFF6` → `#B2F2E7`
- Text Dark: `#1A1A1A`
- Text Medium: `#444444`, `#5A5A5A`
- Text Light: `#6D6D6D`, `#8D8D8D`
- Borders: `#D9D9D9`, `#E0E0E0`, `#C6C6C6`
- Orange Accent: `#FF7A00`

## Project Structure

```
frontend/
├── public/
│   ├── logo.png (add this)
│   ├── registration-illustration.png (add this)
│   └── loginpagepic.png (add this)
├── src/
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── SplashScreen.css
│   │   ├── RegisterScreen.tsx
│   │   ├── RegisterScreen.css
│   │   ├── DetailsScreen.tsx
│   │   ├── DetailsScreen.css
│   │   ├── RegisterOTPScreen.tsx
│   │   ├── RegisterOTPScreen.css
│   │   ├── LoginScreen.tsx
│   │   ├── LoginScreen.css
│   │   ├── LoginOTPScreen.tsx
│   │   ├── LoginOTPScreen.css
│   │   ├── DashboardScreen.tsx
│   │   ├── DashboardScreen.css
│   │   ├── ProfileScreen.tsx
│   │   ├── ProfileScreen.css
│   │   ├── AllReportsScreen.tsx
│   │   ├── AllReportsScreen.css
│   │   ├── ScanPlantScreen.tsx
│   │   ├── ScanPlantScreen.css
│   │   ├── DiagnosisReportScreen.tsx
│   │   └── DiagnosisReportScreen.css
│   ├── App.tsx
│   ├── App.css
│   └── index.tsx
└── package.json
```

## Features by Screen

### Screen 1: Splash Screen
- Background color: `#30ED0`
- Centered logo (242px × 211px)
- Auto-navigates to registration after 3 seconds

### Screen 2: Registration
- White background
- Registration illustration (340px × 280px)
- Mobile number input with Pakistan country code (+92)
- Navigation to login screen
- "Get Started" button

### Screen 3: Details
- Aqua header section (`#B1F0E7`)
- White card form overlay
- 8 input fields (4 mandatory: Name, Surname, Tehsil, Address)
- Province dropdown with Pakistani provinces
- Scrollable form
- Back navigation

### Screen 4: Registration OTP
- Card layout on aqua background
- 4-digit OTP input boxes
- Auto-focus on next box
- Resend OTP functionality
- OTP validation with error toast
- Test OTP: 1234

### Screen 5: Login
- Gradient background (aqua to mint)
- Login illustration (300px × 300px)
- Mobile number input with underline style
- "Generate OTP" button
- Back navigation

### Screen 6: Login OTP
- White card on gradient background
- 4-digit OTP input
- 3-minute countdown timer
- Resend OTP functionality
- Login button activation on complete OTP

### Screen 7: Dashboard
- Top navigation bar with menu and notification icons
- Slide-out side menu with profile card and menu items
- User profile card showing name, mobile, and location
- Two feature cards: Yield Estimation and Plant Disease Detection
- Bottom navigation bar

### Screen 8: Profile
- Curved wave design separating aqua and white sections
- Circular profile icon overlapping both sections
- Editable fields: Mobile Number, Email, Address
- Pencil icons to enable editing
- Update Profile button
- Redirects to OTP if mobile number changes

### Screen 9: All Reports
- List of disease detection reports
- Each report shows image, title, and date
- Three-dot menu for "Delete All" option
- Confirmation dialog for delete action
- Clickable reports (detail view to be implemented)

### Screen 10: Scan Plant
- Card layout with scan header
- Two action buttons: "Take a picture" and "Upload a picture"
- Camera integration for live photo capture
- Gallery integration for uploading existing photos
- Bottom navigation bar
- Report generation triggered after image selection

### Screen 11: Diagnosis Report
- Top navigation bar with back arrow and delete option (#DBFEFA)
- Scrollable content showing detailed diagnosis
- Results card showing:
  - "Oops" (red) for unhealthy plants or "Congratulations" (teal) for healthy plants
  - Uploaded/captured plant image (300×200px with black border)
  - Background color changes based on health status (#FFE8E8 for unhealthy, #E1FEFB for healthy)
- Diagnosis section with:
  - Disease name and detailed analysis points
  - Treatment tips in bullet points
  - Same color scheme as results card
- Delete functionality with confirmation dialog
- Full integration with AI analysis results

## Next Steps

The backend implementation will include:
- User authentication API
- OTP generation and verification
- Plant disease detection using AI/ML
- Weather API integration
- Crop yield prediction
- Database setup
- Dashboard implementation

## Development Notes

- All colors, dimensions, and spacing follow the exact specifications
- Responsive design with maximum widths for better mobile experience
- TypeScript for type safety
- Component-based architecture for reusability
- State management using React hooks

## Support

For any issues or questions, please contact the development team.
