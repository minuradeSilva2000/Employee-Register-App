# 🔥 Firebase Vite App - Production Ready

**Complete automation from code → git → push → run → deploy**

## 🎯 Features

- ✅ **React 18 + TypeScript** (Strict mode)
- ✅ **Vite** (Lightning fast build tool)
- ✅ **Firebase Authentication** (Email/Password - Manual login ONLY)
- ✅ **Firestore Database** (Real-time CRUD operations)
- ✅ **Quick Action Dashboard** (5 actions: Add, View, Update, Delete, Report)
- ✅ **Report Generation** (CSV & PDF export)
- ✅ **Protected Routes** (Auth-based access control)
- ✅ **Full Git Automation** (One command setup)
- ✅ **Auto Run & Deploy** (Firebase Hosting ready)

---

## 🚀 Quick Start (One Command)

### Linux/Mac:
```bash
chmod +x setup.sh && ./setup.sh
```

### Windows:
```batch
setup.bat
```

That's it! The script will:
1. ✅ Install all dependencies
2. ✅ Create .env file
3. ✅ Initialize Git repository
4. ✅ Commit all files
5. ✅ Build production bundle
6. ✅ Optionally start dev server

---

## 📋 Manual Setup

If you prefer manual setup:

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Edit .env with your Firebase credentials

# 3. Initialize Git
git init
git add .
git commit -m "Initial commit"
git branch -M main

# 4. Add remote and push
git remote add origin <YOUR_REPO_URL>
git push -u origin main

# 5. Run development server
npm run dev
```

---

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Follow the setup wizard

### 2. Enable Authentication
1. Go to **Authentication** → **Get Started**
2. Enable **Email/Password** sign-in method

### 3. Create Test User
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Email: `test@example.com`
4. Password: `Test@123`

### 4. Enable Firestore
1. Go to **Firestore Database**
2. Click "Create database"
3. Start in **test mode**
4. Choose your location

### 5. Get Firebase Config
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click **Web** icon (</>)
4. Copy the `firebaseConfig` object
5. Update your `.env` file with these values

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

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

## 📦 Available Scripts

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# TypeScript type checking
npm run lint
```

---

## 🎨 Project Structure

```
src/
├── config/
│   └── firebase.ts              # Firebase configuration
├── types/
│   └── index.ts                 # TypeScript types
├── contexts/
│   └── AuthContext.tsx          # Authentication context
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx        # Manual login form
│   │   └── ProtectedRoute.tsx   # Route protection
│   ├── dashboard/
│   │   ├── QuickActionCard.tsx  # Action cards
│   │   └── Dashboard.tsx        # Main dashboard
│   └── data/
│       ├── DataForm.tsx         # CRUD form
│       ├── DataList.tsx         # Data listing
│       └── DataTable.tsx        # Table view
├── services/
│   ├── dataService.ts           # Firestore CRUD
│   └── reportService.ts         # Report generation
├── utils/
│   ├── exportCSV.ts             # CSV export
│   └── exportPDF.ts             # PDF export
├── pages/
│   ├── Login.tsx                # Login page
│   └── DashboardPage.tsx        # Dashboard page
├── App.tsx                      # Main app component
└── main.tsx                     # Entry point
```

---

## 🔒 Security

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /data/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Features:
- ✅ Only authenticated users can access data
- ✅ No hardcoded credentials
- ✅ Environment variables for sensitive data
- ✅ Protected routes with auth checks
- ✅ Secure Firebase configuration

---

## 🚀 Deployment

### Firebase Hosting (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
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

### Alternative: Vercel

```bash
npm install -g vercel
vercel
```

### Alternative: Netlify

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

---

## 📝 Usage

### 1. Login
- Navigate to http://localhost:3000
- Enter email and password
- Click "Sign in"
- Redirects to dashboard on success

### 2. Dashboard
- View 5 Quick Action cards
- Click any card to perform action

### 3. CRUD Operations
- **Add**: Create new data entries
- **View**: List all data with real-time updates
- **Update**: Edit existing entries
- **Delete**: Remove entries with confirmation

### 4. Reports
- Generate reports from Firestore data
- View in table format
- Export as CSV or PDF

---

## 🐛 Troubleshooting

### Issue: "Firebase not configured"
**Solution**: Update `.env` with your Firebase credentials

### Issue: "Authentication failed"
**Solution**: Create a test user in Firebase Console

### Issue: "Permission denied"
**Solution**: Deploy Firestore security rules

### Issue: "Port 3000 already in use"
**Solution**: Kill the process or change port in `vite.config.ts`

---

## 📚 Documentation

- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)

---

## ✅ Checklist

- [ ] Node.js installed
- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Test user created
- [ ] Firestore enabled
- [ ] `.env` file configured
- [ ] Dependencies installed
- [ ] Git repository initialized
- [ ] Development server running
- [ ] Login working
- [ ] Dashboard accessible
- [ ] CRUD operations working
- [ ] Reports generating

---

## 🎉 Success!

Your production-ready Firebase Vite app is now:
- ✅ Fully automated
- ✅ Git-ready
- ✅ Deploy-ready
- ✅ Production-ready

---

## 📄 License

MIT

---

## 👨‍💻 Author

Senior Full-Stack + DevOps Engineer

---

**Built with ❤️ using React, TypeScript, Vite, and Firebase**
