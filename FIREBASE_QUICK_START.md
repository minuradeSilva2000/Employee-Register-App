# 🚀 Firebase Vite App - Quick Start

**Get up and running in 5 minutes!**

---

## 📍 Location
```
firebase-vite-app/
```

---

## ⚡ One-Command Setup

### Windows:
```batch
cd firebase-vite-app
setup.bat
```

### Linux/Mac:
```bash
cd firebase-vite-app
chmod +x setup.sh && ./setup.sh
```

---

## 🔥 Firebase Setup (5 Steps)

### 1. Create Project
- Go to: https://console.firebase.google.com/
- Click "Add project"
- Enter name, follow wizard

### 2. Enable Authentication
- Go to: Authentication → Get Started
- Enable: Email/Password
- Click Save

### 3. Create Test User
- Go to: Authentication → Users
- Click "Add user"
- Email: `test@example.com`
- Password: `Test@123`

### 4. Enable Firestore
- Go to: Firestore Database
- Click "Create database"
- Start in: Test mode
- Choose location

### 5. Get Config & Update .env
- Go to: Project Settings (gear icon)
- Scroll to "Your apps"
- Click Web icon (</>)
- Copy firebaseConfig
- Update `firebase-vite-app/.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

---

## 🏃 Run Application

```bash
cd firebase-vite-app
npm run dev
```

Open: http://localhost:3000

---

## 🧪 Test Login

1. Navigate to http://localhost:3000
2. Enter:
   - Email: `test@example.com`
   - Password: `Test@123`
3. Click "Sign in"
4. Should redirect to /dashboard

---

## 🎯 Test Features

### 1. Add Data
- Click "Add Data" card
- Fill form
- Click "Create Data"
- Should show success message

### 2. View Data
- Click "View Data" card
- Should see all entries

### 3. Update Data
- Click "Update Data" card
- Click "Edit" on any entry
- Modify fields
- Click "Save"

### 4. Delete Data
- Click "Delete Data" card
- Click "Delete" on any entry
- Confirm deletion

### 5. Generate Report
- Click "Generate Report" card
- Click "Export CSV" or "Export PDF"
- File should download

---

## 📦 Available Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# TypeScript type check
npx tsc --noEmit
```

---

## 🐛 Troubleshooting

### Issue: "Firebase not configured"
**Solution**: Update `.env` with your Firebase credentials

### Issue: "Authentication failed"
**Solution**: Create test user in Firebase Console

### Issue: "Permission denied"
**Solution**: Deploy Firestore security rules from `firestore.rules`

### Issue: "Port 3000 already in use"
**Solution**: 
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

---

## 🚀 Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (one-time)
firebase init
# Select: Firestore, Hosting
# Public directory: dist
# Single-page app: Yes

# Build
npm run build

# Deploy
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

---

## 📚 Documentation

- Full docs: `firebase-vite-app/README.md`
- Complete guide: `COMPLETE_AUTOMATION_GUIDE.md`
- Status: `FIREBASE_VITE_APP_COMPLETE.md`

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Test user created
- [ ] Firestore enabled
- [ ] `.env` configured
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm run dev`)
- [ ] Login working
- [ ] Dashboard accessible
- [ ] CRUD operations working
- [ ] Reports generating

---

**Status**: ✅ Ready to Use  
**Time to Setup**: ~5 minutes  
**Last Updated**: February 10, 2026
