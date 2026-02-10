# 🚀 Quick Deploy Guide

## Prerequisites Check

✅ Node.js installed  
✅ Firebase CLI installed (`npm install -g firebase-tools`)  
✅ Firebase project created  
✅ `.env` file configured  

## Deploy in 3 Steps

### Step 1: Login to Firebase
```bash
firebase login
```

### Step 2: Build & Deploy
```bash
npm run deploy
```

**OR use the Windows batch script:**
```bash
deploy.bat
```

### Step 3: Access Your App
Your app will be live at:
- `https://YOUR-PROJECT-ID.web.app`
- `https://YOUR-PROJECT-ID.firebaseapp.com`

## Alternative Commands

**Deploy only hosting:**
```bash
npm run deploy:hosting
```

**Deploy only Firestore rules:**
```bash
npm run deploy:firestore
```

**Preview before deploy:**
```bash
npm run build
npm run preview
```

## Troubleshooting

### "Firebase command not found"
```bash
npm install -g firebase-tools
```

### "Not logged in"
```bash
firebase login
```

### "Build failed"
```bash
npm run lint
# Fix any errors, then try again
```

### "Wrong project"
```bash
firebase use --add
# Select your project
```

## What's Deployed?

✅ React + TypeScript app  
✅ Firebase Authentication  
✅ Firestore database  
✅ All new features:
- Profile page
- Settings page
- 404 page
- Error boundary
- Loading states

## Post-Deployment

1. Test your live app
2. Check Firebase Console for analytics
3. Monitor errors in Firebase Crashlytics (if enabled)
4. Update DNS if using custom domain

## Need Help?

See `DEPLOYMENT_GUIDE.md` for detailed instructions.
