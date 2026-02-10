# 🔐 Google OAuth Setup Guide

**Complete guide to enable Google Sign-In**

---

## 📋 Quick Setup (5 minutes)

### Step 1: Get Google Client ID

1. **Go to Google Cloud Console**:
   - Visit: https://console.cloud.google.com/

2. **Create a Project** (if you don't have one):
   - Click "Select a project" → "New Project"
   - Name: "Employee Management System"
   - Click "Create"

3. **Enable Google+ API**:
   - Go to: https://console.cloud.google.com/apis/library
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth Credentials**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure OAuth consent screen first:
     - User Type: External
     - App name: Employee Management System
     - User support email: your-email@example.com
     - Developer contact: your-email@example.com
     - Click "Save and Continue"
   
5. **Configure OAuth Client**:
   - Application type: "Web application"
   - Name: "Employee Management Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:5175` (development)
     - `http://localhost` (Docker)
     - Add your production domain later
   - Authorized redirect URIs:
     - `http://localhost:5175`
     - `http://localhost`
   - Click "Create"

6. **Copy Client ID**:
   - You'll see a popup with your Client ID
   - Copy the Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)

---

### Step 2: Add Client ID to Environment

#### For Local Development:

1. **Create `.env.local` file** in `frontend` folder:
```bash
cd employee-management-app/frontend
```

2. **Create the file**:
```bash
# Windows
echo VITE_GOOGLE_CLIENT_ID=your-client-id-here > .env.local

# Or manually create .env.local with:
VITE_GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
```

3. **Replace** `your-client-id-here` with your actual Client ID

---

#### For Docker:

1. **Edit `frontend/.env.production`**:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
```

2. **Rebuild frontend**:
```bash
cd employee-management-app
docker-compose build frontend
docker-compose up -d frontend
```

---

### Step 3: Restart Application

#### Local Development:
```bash
# Stop frontend (Ctrl+C)
# Start again
npm run dev
```

#### Docker:
```bash
docker-compose restart frontend
```

---

### Step 4: Test Google Sign-In

1. **Open application**: http://localhost:5175 (or http://localhost for Docker)
2. **Click "Continue with Google"** button
3. **Select your Google account**
4. **Grant permissions**
5. **You should be logged in!**

---

## 🎯 Quick Test Configuration

If you just want to test the UI without setting up Google OAuth:

### Option 1: Mock Google Login (Development Only)

Edit `frontend/src/services/authService.ts` and add a mock function:

```typescript
// Add this for testing only
loginWithGoogle: async (): Promise<AuthResponse> => {
  // Mock response for testing
  return {
    success: true,
    message: 'Google login successful',
    token: 'mock-jwt-token',
    user: {
      id: '999',
      email: 'test@gmail.com',
      name: 'Test User',
      role: 'user'
    }
  };
},
```

### Option 2: Use Email/Password Login

Just use the existing test accounts:
- Admin: `admin@example.com` / `Admin@123`
- User: `user@example.com` / `User@123`

---

## 📁 File Structure

```
employee-management-app/
├── frontend/
│   ├── .env.local              # ← Create this (gitignored)
│   ├── .env.development        # Template
│   ├── .env.production         # Template
│   └── src/
│       ├── services/
│       │   └── authService.ts  # Google OAuth logic
│       └── pages/
│           └── LoginPage.tsx   # Google button
│
└── backend/
    └── src/
        └── routes/
            └── auth.routes.ts  # Google OAuth endpoint
```

---

## 🔧 Environment Variables

### Frontend (.env.local)

```bash
# Required for Google Sign-In
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (.env)

```bash
# No changes needed for Google OAuth
PORT=5000
JWT_SECRET=my-super-secret-jwt-key
JWT_EXPIRES_IN=24h
NODE_ENV=development
```

---

## 🧪 Testing

### Test Checklist

- [ ] Google button appears on login page
- [ ] Clicking button opens Google sign-in popup
- [ ] Can select Google account
- [ ] After authentication, redirects to dashboard
- [ ] User info displayed in dashboard header
- [ ] Can logout successfully

### Test Scenarios

**Scenario 1: First-time Google user**
1. Click "Continue with Google"
2. Select Google account
3. Grant permissions
4. Should create new user and login
5. Redirect to dashboard

**Scenario 2: Existing Google user**
1. Click "Continue with Google"
2. Select same Google account
3. Should login immediately
4. Redirect to dashboard

**Scenario 3: Cancel Google login**
1. Click "Continue with Google"
2. Close popup or click "Cancel"
3. Should show error message
4. Stay on login page

---

## 🔒 Security Notes

### Development
- ✅ Use `http://localhost` for testing
- ✅ Client ID is public (safe to commit)
- ✅ Client Secret is NOT needed for frontend OAuth

### Production
- ✅ Use HTTPS only (`https://yourdomain.com`)
- ✅ Add production domain to authorized origins
- ✅ Configure OAuth consent screen properly
- ✅ Set up proper redirect URIs
- ✅ Use environment variables for Client ID

---

## 🐛 Troubleshooting

### Issue: "Google Client ID not configured"

**Solution**:
1. Check `.env.local` file exists in `frontend` folder
2. Verify `VITE_GOOGLE_CLIENT_ID` is set
3. Restart development server
4. Clear browser cache

---

### Issue: "redirect_uri_mismatch"

**Solution**:
1. Go to Google Cloud Console
2. Check "Authorized JavaScript origins"
3. Add your current URL (e.g., `http://localhost:5175`)
4. Save and wait 5 minutes for changes to propagate

---

### Issue: Google popup blocked

**Solution**:
1. Allow popups for localhost in browser settings
2. Or click the popup icon in address bar
3. Try again

---

### Issue: "Failed to load Google Sign-In"

**Solution**:
1. Check internet connection
2. Verify Google APIs are not blocked
3. Check browser console for errors
4. Try different browser

---

### Issue: Backend returns 401

**Solution**:
1. Check backend is running
2. Verify CORS is configured
3. Check backend logs: `docker-compose logs backend`
4. Ensure `/api/auth/google` endpoint exists

---

## 📚 Additional Resources

### Google OAuth Documentation
- **Setup Guide**: https://developers.google.com/identity/gsi/web/guides/overview
- **Console**: https://console.cloud.google.com/
- **API Library**: https://console.cloud.google.com/apis/library

### Testing Tools
- **JWT Decoder**: https://jwt.io/
- **OAuth Playground**: https://developers.google.com/oauthplayground/

---

## 🎨 UI Features

### Google Button
- ✅ Official Google colors and logo
- ✅ Hover effects
- ✅ Loading state
- ✅ Disabled state
- ✅ Responsive design

### Info Message
- ✅ Shows when Client ID not configured
- ✅ Provides setup instructions
- ✅ Blue info styling

---

## 🚀 Production Deployment

### Before Going Live

1. **Update OAuth Consent Screen**:
   - Add privacy policy URL
   - Add terms of service URL
   - Add app logo
   - Submit for verification (if needed)

2. **Update Authorized Origins**:
   - Remove localhost URLs
   - Add production domain
   - Add staging domain (if applicable)

3. **Environment Variables**:
   - Set `VITE_GOOGLE_CLIENT_ID` in production
   - Use CI/CD secrets management
   - Never commit production credentials

4. **Test Production Build**:
   ```bash
   npm run build
   npm run preview
   ```

---

## ✅ Quick Checklist

### Setup
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth client ID
- [ ] Added authorized origins
- [ ] Copied Client ID

### Configuration
- [ ] Created `.env.local` file
- [ ] Added `VITE_GOOGLE_CLIENT_ID`
- [ ] Restarted development server
- [ ] Cleared browser cache

### Testing
- [ ] Google button visible
- [ ] Button opens Google popup
- [ ] Can select account
- [ ] Redirects to dashboard
- [ ] User info displayed

---

## 🎉 Success!

Once configured, users can:
- ✅ Sign in with Google account
- ✅ No password needed
- ✅ Automatic account creation
- ✅ Secure JWT authentication
- ✅ Same dashboard access

---

## 📞 Need Help?

### Common Questions

**Q: Do I need a Google Cloud billing account?**
A: No, OAuth is free for most use cases.

**Q: Can I use multiple OAuth providers?**
A: Yes! You can add Facebook, GitHub, etc. using similar patterns.

**Q: Is the Client ID secret?**
A: No, it's public and safe to expose in frontend code.

**Q: What about the Client Secret?**
A: Not needed for frontend OAuth flow. Only for server-to-server.

**Q: Can I test without a real Google account?**
A: Use the mock function provided above for development.

---

**Last Updated**: February 10, 2026  
**Status**: ✅ Ready to Configure
