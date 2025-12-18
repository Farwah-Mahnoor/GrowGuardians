# GrowGuardians Backend - Render + Neon Setup Guide

This guide shows you how to deploy your backend on the NEW Render interface using Neon (free PostgreSQL).

## ⚡ Why Neon + Render?

- **Neon**: Free PostgreSQL database with generous limits
- **Render**: Free tier for Python web services
- **No credit card needed** for either (if staying in free tier)

---

## 📋 Complete Setup Instructions

### Step 1: Create Free PostgreSQL Database on Neon

1. Visit **https://neon.tech**
2. Click **"Sign Up"** (use GitHub for fastest setup)
3. Create a new project:
   - Project name: `growguardians`
   - Region: Choose closest to you
4. Click **"Create Project"**
5. You'll see a **connection string**, copy it:
   ```
   postgresql://neon_user:password@ep-xxxxx.us-east-1.neon.tech/growguardians
   ```
6. Save this somewhere safe - you'll need it!

### Step 2: Update Your Render Service

On Render's new interface, you need to set the DATABASE_URL. Do this by:

**Option A: Using Render's GUI (if available)**
1. Go to your `growguardians-backend` service
2. Find the **Settings** or **Environment** section
3. Add new environment variable:
   - Key: `DATABASE_URL`
   - Value: Your Neon connection string from Step 1

**Option B: Using Render's Web Editor**
1. Go to your backend service
2. Click the files/code icon
3. Look for a `render.yaml` or `.env` file
4. Edit and add your DATABASE_URL there

**Option C: Direct Method**
1. Delete your current Render service
2. Reconnect your GitHub repository
3. When Render asks for environment variables, add:
   ```
   DATABASE_URL=your_neon_connection_string_here
   ```

### Step 3: Deploy

1. Render will automatically redeploy when you add the environment variable
2. OR click **"Redeploy"** manually
3. Wait for it to show **"Live"** (green)

### Step 4: Verify

Visit: `https://your-backend.onrender.com/api/health`

Should return:
```json
{
  "success": true,
  "message": "GrowGuardians Backend is running",
  "database": "connected"
}
```

---

## 🔧 Quick Reference

| Service | Free Tier | URL |
|---------|-----------|-----|
| Neon (PostgreSQL) | 3 projects, 0.5GB storage | https://neon.tech |
| Render (Backend) | 750 hrs/month | https://render.com |

---

## ❓ Still Having Issues?

If Render's environment variable section is completely hidden:

1. Create a `render.yaml` file in your repo root:
```yaml
services:
  - type: web
    name: growguardians-backend
    env: python
    buildCommand: "pip install -r backend/requirements.txt"
    startCommand: "gunicorn --bind 0.0.0.0:$PORT wsgi:app"
    envVars:
      - key: DATABASE_URL
        value: ${DATABASE_URL}
      - key: SECRET_KEY
        value: ${SECRET_KEY}
```

2. Push this file to GitHub
3. Render will automatically use these settings

---

## 💡 Notes

- Your database will be created automatically when the app first connects
- All tables (users, otp_codes, disease_reports, ratings) are created automatically
- Free Neon account gives you 0.5GB storage (enough for thousands of records)
