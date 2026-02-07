# 🔐 Google Cloud Console Setup Guide

## Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click "Select a project" → "New Project"
   - Project name: `Employee Management System`
   - Click "Create"

## Step 2: Enable Required APIs

1. **Navigate to APIs & Services**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" → Click "Enable"
   - Search for "People API" → Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - Navigate to "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type → Click "Create"

2. **Fill Required Information**
   ```
   App name: Employee Management System
   User support email: your-email@gmail.com
   App logo: (optional)
   App domain: http://localhost:3000
   Developer contact: your-email@gmail.com
   ```

3. **Scopes (Step 2)**
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `../auth/userinfo.email`
     - `../auth/userinfo.profile`
   - Click "Update" → "Save and Continue"

4. **Test Users (Step 3)**
   - Add your email for testing
   - Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. **Go to Credentials**
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"

2. **Configure OAuth Client**
   ```
   Application type: Web application
   Name: Employee Management Web Client
   
   Authorized JavaScript origins:
   - http://localhost:3000
   - http://localhost:5173 (if using Vite)
   
   Authorized redirect URIs:
   - http://localhost:5000/auth/google/callback
   - http://localhost:3000/auth/callback
   ```

3. **Save Credentials**
   - Click "Create"
   - **IMPORTANT**: Copy and save:
     - Client ID
     - Client Secret

## Step 5: Environment Variables

**Backend (.env)**
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
```

**Frontend (.env)**
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_BASE_URL=http://localhost:5000
```

## 🔒 Security Notes

1. **Never commit credentials to Git**
2. **Use different credentials for production**
3. **Add production domains to authorized origins**
4. **Enable additional security features in production**

## ✅ Verification

Test your setup:
1. Client ID should start with numbers and end with `.apps.googleusercontent.com`
2. Both origins should be accessible in browser
3. No CORS errors when testing locally

---
**Next**: Configure backend Google OAuth integration