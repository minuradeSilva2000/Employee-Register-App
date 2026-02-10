# 🔐 Google OAuth Setup Guide

## Complete Enterprise Platform - Google Sign-In Integration

This guide will help you set up Google OAuth authentication for the Complete Enterprise Platform.

---

## 📋 Prerequisites

- Google Account
- Access to Google Cloud Console
- Application running on http://localhost:3000

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `Complete Enterprise Platform`
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (for testing)
3. Click **"Create"**

**Fill in the required fields**:
- **App name**: `Complete Enterprise Platform`
- **User support email**: Your email
- **Developer contact email**: Your email

4. Click **"Save and Continue"**
5. Skip **"Scopes"** → Click **"Save and Continue"**
6. Add test users (your email) → Click **"Save and Continue"**
7. Click **"Back to Dashboard"**

### Step 4: Create OAuth Client ID

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"**

**Configure the OAuth client**:
- **Name**: `Complete Enterprise Platform Web Client`
- **Authorized JavaScript origins**:
  - `http://localhost:3000`
  - `http://localhost:5173` (if using Vite default)
- **Authorized redirect URIs**:
  - `http://localhost:3000`
  - `http://localhost:3000/auth/callback`

4. Click **"Create"**
5. **Copy the Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)

### Step 5: Add Client ID to Application

1. Open the `.env` file in the `complete-enterprise-app` folder
2. Add your Client ID:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

3. Save the file

### Step 6: Restart the Application

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

---

## 🎯 Testing Google Sign-In

1. Open http://localhost:3000
2. Click **"Sign in with Google"** button
3. Select your Google account
4. Grant permissions
5. You should be logged in!

---

## 📝 Configuration Files

### .env File Structure
```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com

# Application Configuration
VITE_APP_NAME=Complete Enterprise Platform
VITE_APP_URL=http://localhost:3000
```

### Important Notes
- ✅ The `.env` file is already created
- ✅ Add your Client ID to the `VITE_GOOGLE_CLIENT_ID` variable
- ✅ Restart the dev server after adding the Client ID
- ⚠️ Never commit `.env` file to Git (it's in .gitignore)

---

## 🔧 Implementation Details

### Current Implementation

The Google Sign-In button is already implemented in `LoginPage.tsx`:

```typescript
<button
  type="button"
  onClick={handleGoogleSignIn}
  className="w-full bg-white border-2 border-gray-300..."
>
  <svg>...</svg> {/* Google Logo */}
  Sign in with Google
</button>
```

### What Happens When You Click

1. **Without Client ID**: Shows alert to configure
2. **With Client ID**: Opens Google Sign-In popup
3. **After Success**: User is authenticated and redirected to dashboard

---

## 🎨 Google Sign-In Button

The button follows Google's official branding guidelines:
- ✅ Official Google logo (4 colors)
- ✅ "Sign in with Google" text
- ✅ White background with gray border
- ✅ Hover effects
- ✅ Proper spacing and sizing

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Client ID stored in `.env` file
- ✅ `.env` file is in `.gitignore`
- ✅ `.env.example` provided for reference

### OAuth Configuration
- ✅ Only localhost URLs for development
- ✅ External consent screen for testing
- ✅ Test users can be added

### Production Deployment
When deploying to production:
1. Add production URL to authorized origins
2. Update `.env` with production Client ID
3. Change consent screen to "Internal" (if applicable)
4. Remove test users restriction

---

## 🐛 Troubleshooting

### Issue: "Google Sign-In Configuration Required" message

**Solution**: Add your Client ID to `.env` file and restart server

### Issue: "redirect_uri_mismatch" error

**Solution**: 
1. Check authorized redirect URIs in Google Console
2. Make sure `http://localhost:3000` is added
3. No trailing slashes

### Issue: "Access blocked: This app's request is invalid"

**Solution**:
1. Make sure OAuth consent screen is configured
2. Add your email as a test user
3. Enable Google+ API

### Issue: Button doesn't work

**Solution**:
1. Check browser console for errors
2. Verify Client ID is correct
3. Make sure you restarted the dev server

---

## 📚 Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Websites](https://developers.google.com/identity/sign-in/web)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

---

## 🎯 Next Steps

After setting up Google OAuth:

1. ✅ Test the Google Sign-In flow
2. ✅ Add user profile information display
3. ✅ Store user data in state/context
4. ✅ Implement logout functionality
5. ✅ Add backend API integration (optional)

---

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all URLs match exactly
3. Make sure APIs are enabled
4. Check test users are added
5. Review this guide step by step

---

## ✅ Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth Client ID
- [ ] Added Client ID to `.env` file
- [ ] Restarted dev server
- [ ] Tested Google Sign-In button
- [ ] Successfully logged in with Google

---

**Status**: Ready to configure  
**Time Required**: ~5 minutes  
**Difficulty**: Easy  

---

**🎉 Once configured, users can sign in with their Google accounts!**
