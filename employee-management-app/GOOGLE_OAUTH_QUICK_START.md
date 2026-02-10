# ⚡ Google OAuth - Quick Start

**Get Google Sign-In working in 5 minutes!**

---

## 🚀 Option 1: Automated Setup (Windows)

```bash
cd employee-management-app
setup-google-oauth.bat
```

Follow the prompts and enter your Google Client ID.

---

## 🚀 Option 2: Manual Setup

### Step 1: Get Google Client ID

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create OAuth Client ID
3. Add authorized origin: `http://localhost:5175`
4. Copy the Client ID

### Step 2: Configure

Create `frontend/.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Step 3: Restart

```bash
# Stop frontend (Ctrl+C)
npm run dev
```

### Step 4: Test

1. Open http://localhost:5175
2. Click "Continue with Google"
3. Sign in with Google account
4. Done! ✅

---

## 🧪 Option 3: Test Without Google (Development)

Just use email/password login:
- Admin: `admin@example.com` / `Admin@123`
- User: `user@example.com` / `User@123`

The Google button will show an info message but won't block other features.

---

## 📚 Need More Help?

See complete guide: `GOOGLE_OAUTH_SETUP.md`

---

## ✅ Quick Checklist

- [ ] Got Google Client ID
- [ ] Created `.env.local` file
- [ ] Added `VITE_GOOGLE_CLIENT_ID`
- [ ] Restarted dev server
- [ ] Tested Google login

---

**Status**: Google button is ready, just needs Client ID configuration!
