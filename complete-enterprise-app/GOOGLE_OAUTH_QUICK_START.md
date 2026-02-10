# ⚡ Google OAuth Quick Start (5 Minutes)

## 🎯 Goal
Enable "Sign in with Google" button in your Complete Enterprise Platform.

---

## 🚀 Quick Steps

### 1️⃣ Get Google Client ID (3 minutes)

1. **Go to**: https://console.cloud.google.com/
2. **Create Project**: Click "New Project" → Name it → Create
3. **Enable API**: 
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API" → Enable
4. **OAuth Consent**:
   - Go to "OAuth consent screen"
   - Select "External" → Create
   - Fill: App name, your email → Save
5. **Create Credentials**:
   - Go to "Credentials" → "+ Create Credentials" → "OAuth client ID"
   - Type: "Web application"
   - Add origin: `http://localhost:3000`
   - Create → **COPY THE CLIENT ID**

### 2️⃣ Add to Your App (1 minute)

**Option A: Use Setup Script (Recommended)**
```bash
# Run the setup script
setup-google-oauth.bat

# Paste your Client ID when prompted
```

**Option B: Manual Setup**
1. Open `.env` file
2. Add your Client ID:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```
3. Save the file

### 3️⃣ Restart Server (1 minute)

```bash
# Stop current server (Ctrl+C)
# Start again:
npm run dev
```

---

## ✅ Test It

1. Open http://localhost:3000
2. You should see: ✅ "Google Sign-In is ready" (green message)
3. Click "Sign in with Google"
4. Select your Google account
5. Done! You're logged in 🎉

---

## 🎨 What You Get

**Before Configuration**:
- ⚠️ Yellow warning: "Configuration Required"
- Button shows alert when clicked

**After Configuration**:
- ✅ Green indicator: "Google Sign-In is ready"
- Button opens Google Sign-In popup
- Automatic login after Google authentication

---

## 🐛 Troubleshooting

### "Configuration Required" still showing?
- ✅ Check `.env` file has the Client ID
- ✅ Restart the dev server
- ✅ Refresh the browser

### "redirect_uri_mismatch" error?
- ✅ Add `http://localhost:3000` to authorized origins in Google Console
- ✅ No trailing slash

### Button doesn't work?
- ✅ Check browser console for errors
- ✅ Make sure you added test users in Google Console
- ✅ Try incognito mode

---

## 📋 Your Client ID Format

Should look like:
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

---

## 🎯 Files Created

- ✅ `.env` - Your configuration (DO NOT commit to Git)
- ✅ `.env.example` - Template for others
- ✅ `.gitignore` - Protects your .env file
- ✅ `setup-google-oauth.bat` - Setup helper script
- ✅ `GOOGLE_OAUTH_SETUP.md` - Detailed guide

---

## 🔒 Security

- ✅ `.env` file is in `.gitignore` (not committed)
- ✅ Client ID is safe to expose (it's public)
- ✅ Only localhost URLs allowed (development)

---

## 📞 Need Help?

See detailed guide: `GOOGLE_OAUTH_SETUP.md`

---

**⏱️ Total Time: ~5 minutes**  
**✅ Result: Working Google Sign-In!**
