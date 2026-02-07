# 🚀 Quick Google OAuth Setup - Fix "Client ID not configured"

## 🎯 **Current Issue**
You're seeing: "Google Client ID not configured. Please check your environment variables"

**This is NORMAL** - it means Google OAuth is working but needs real credentials!

---

## ⚡ **5-Minute Fix - Updated 2024**

### **Step 1: Get Google Credentials**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Sign in** with your Google account
3. **Create a new project**:
   - Click "Select a project" → "New Project"
   - Name: "Employee Management System"
   - Click "Create"
   - Wait for project creation (30 seconds)

4. **Configure OAuth Consent Screen FIRST**:
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" → Click "Create"
   - Fill in **required fields**:
     - App name: `Employee Management System`
     - User support email: `your-email@gmail.com`
     - Developer contact information: `your-email@gmail.com`
   - Click "Save and Continue"
   - **Scopes**: Click "Save and Continue" (no changes needed)
   - **Test users**: Add your email address → Click "Save and Continue"
   - **Summary**: Click "Back to Dashboard"

5. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Name: `Employee Management Web Client`
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `http://localhost:3001` (backup port)
   - **Authorized redirect URIs**: 
     - `http://localhost:5000/auth/google/callback`
     - `http://localhost:3000/auth/callback` (frontend callback)
   - Click "Create"

6. **Copy Your Credentials**:
   - **Client ID**: (starts with numbers, ends with `.apps.googleusercontent.com`)
   - **Client Secret**: (random string)
   - **IMPORTANT**: Keep these safe and never share publicly!

### **Step 2: Update Environment Variables**

**Backend Environment** (`backend/.env`):
```env
# Replace these lines with your actual Google credentials
GOOGLE_CLIENT_ID=your_actual_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
```

**Frontend Environment** (`frontend/.env`):
```env
# Replace these lines with your actual Google Client ID
VITE_GOOGLE_CLIENT_ID=your_actual_google_client_id_here.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_ID=your_actual_google_client_id_here.apps.googleusercontent.com
```

**⚠️ IMPORTANT**: 
- Use the SAME Client ID in both files
- Don't include quotes around the values
- Make sure there are no extra spaces
- The Client ID should end with `.apps.googleusercontent.com`

---

### **Step 3: Restart Servers**

**If using Docker:**
```bash
# Stop containers
docker-compose down

# Restart with new environment variables
docker-compose up -d

# Check if running
docker-compose ps
```

**If using Node.js directly:**
```bash
# Stop current servers (Ctrl+C in both terminals)
# Then restart:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

---

### **Step 4: Test Google OAuth**

1. **Go to**: http://localhost:3000/login
2. **Click**: "Continue with Google"
3. **Expected Result**: 
   - ✅ Google Sign-In popup/redirect appears
   - ✅ You can select your Google account
   - ✅ Google asks for permission to access your profile
   - ✅ After approval, you're redirected back to your app
   - ✅ Success message: "Successfully logged in with Google account"
   - ✅ You're taken to the dashboard with your Google profile picture

---

## 🎉 **Expected Results After Setup**

### **Before Real Credentials**
- ❌ "Google Client ID not configured" error
- ❌ Button doesn't work
- ❌ No Google popup/redirect

### **After Real Credentials**
- ✅ Google Sign-In popup/redirect appears
- ✅ Can sign in with Google account
- ✅ Success message: "Successfully logged in with Google account"
- ✅ Redirected to dashboard with Google profile picture
- ✅ New users automatically created in database
- ✅ Google profile picture and name displayed in app

---

## 🔍 **Alternative: Test Without Google OAuth**

If you want to test the app without setting up Google OAuth:

### **Use Traditional Login**
- **Admin**: admin@example.com / Admin@123
- **HR**: hr@example.com / Hr@123
- **Viewer**: viewer@example.com / Viewer@123

### **Hide Google Button** (Optional)
You can temporarily hide the Google button by commenting it out in the login page.

---

## 🛠️ **Troubleshooting**

### **Common Issues & Solutions**

1. **"redirect_uri_mismatch"**
   - **Fix**: Add `http://localhost:5000/auth/google/callback` to authorized redirect URIs
   - **Also add**: `http://localhost:3000/auth/callback` for frontend callbacks

2. **"origin_mismatch"**
   - **Fix**: Add `http://localhost:3000` to authorized JavaScript origins
   - **Also add**: `http://localhost:3001` as backup port

3. **Still shows "not configured"**
   - **Check**: Environment variable names are exactly `VITE_GOOGLE_CLIENT_ID`
   - **Check**: No extra spaces or quotes around values
   - **Check**: Client ID ends with `.apps.googleusercontent.com`
   - **Fix**: Restart both servers after changing .env files

4. **Google popup blocked**
   - **Fix**: Allow popups for localhost in browser settings
   - **Chrome**: Click popup icon in address bar → "Always allow"

5. **"This app isn't verified"**
   - **Normal**: Click "Advanced" → "Go to Employee Management System (unsafe)"
   - **This is expected** for development apps

6. **"Access blocked: This app's request is invalid"**
   - **Fix**: Make sure OAuth consent screen is properly configured
   - **Check**: Test users includes your email address

---

## ✅ **Quick Verification Checklist**

After setup, verify these steps:
- [ ] Google Cloud Console project created
- [ ] OAuth consent screen configured with your email as test user
- [ ] Credentials created with correct redirect URIs and origins
- [ ] Environment variables updated in both `backend/.env` and `frontend/.env`
- [ ] Servers restarted (Docker or Node.js)
- [ ] http://localhost:3000/login loads without errors
- [ ] "Continue with Google" button is visible and clickable

---

## 🎯 **Success Test Flow**

When working correctly, this exact flow should happen:

1. **Click "Continue with Google"** 
   → Google popup/redirect appears (not error message)

2. **Select your Google account** 
   → Google shows permission screen

3. **Click "Allow" on permissions** 
   → Redirected back to your app

4. **Success message appears** 
   → "Successfully logged in with Google account"

5. **Dashboard loads** 
   → Your Google profile picture appears in top-right corner

6. **Check database** 
   → New user created with Google ID and profile info

**If all 6 steps work, your Google OAuth is fully functional! 🚀**