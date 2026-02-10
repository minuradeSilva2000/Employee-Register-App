# Firebase Deployment Guide

## Prerequisites

1. **Firebase CLI** - Install if not already installed:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project** - Make sure you have a Firebase project created at [Firebase Console](https://console.firebase.google.com)

3. **Environment Variables** - Ensure your `.env` file is configured with Firebase credentials

## Deployment Steps

### 1. Login to Firebase
```bash
firebase login
```

### 2. Initialize Firebase (First Time Only)
If not already initialized:
```bash
firebase init
```
Select:
- Hosting
- Firestore (if using database)

### 3. Build the Application
```bash
npm run build
```

### 4. Deploy to Firebase

**Deploy Everything:**
```bash
npm run deploy
```

**Deploy Only Hosting:**
```bash
npm run deploy:hosting
```

**Deploy Only Firestore Rules:**
```bash
npm run deploy:firestore
```

### 5. Manual Deployment
```bash
firebase deploy
```

## Post-Deployment

1. **View Your Site:**
   - Your app will be available at: `https://YOUR-PROJECT-ID.web.app`
   - Or: `https://YOUR-PROJECT-ID.firebaseapp.com`

2. **Check Deployment Status:**
   ```bash
   firebase hosting:channel:list
   ```

3. **View Logs:**
   ```bash
   firebase hosting:channel:open
   ```

## Environment Configuration

Make sure your `.env` file contains:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Troubleshooting

### Build Errors
- Run `npm run lint` to check for code issues
- Ensure all TypeScript errors are resolved

### Deployment Fails
- Check Firebase CLI version: `firebase --version`
- Verify you're logged in: `firebase login:list`
- Check project configuration: `firebase projects:list`

### 404 Errors After Deployment
- Verify `firebase.json` has proper rewrites configuration
- Check that `dist` folder exists after build

## Continuous Deployment

For automated deployments, consider:
- GitHub Actions
- GitLab CI/CD
- Firebase Hosting GitHub Integration

## Security

- Never commit `.env` file
- Use Firebase Security Rules for Firestore
- Enable Firebase App Check for production
