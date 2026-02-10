/**
 * Firebase Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project or select existing
 * 3. Go to Project Settings > General
 * 4. Scroll to "Your apps" section
 * 5. Click "Add app" > Web (</>) icon
 * 6. Register your app
 * 7. Copy the firebaseConfig object
 * 8. Replace the values below with your actual Firebase config
 * 
 * SECURITY NOTE:
 * - These values are safe to expose in client-side code
 * - Real security comes from Firestore security rules
 * - Never expose Firebase Admin SDK credentials
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// TODO: Replace with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Export app instance
export default app;

/**
 * FIREBASE SETUP CHECKLIST:
 * 
 * 1. Authentication Setup:
 *    - Go to Firebase Console > Authentication
 *    - Click "Get Started"
 *    - Enable "Email/Password" sign-in method
 *    - Create test users manually or via code
 * 
 * 2. Firestore Setup:
 *    - Go to Firebase Console > Firestore Database
 *    - Click "Create database"
 *    - Choose "Start in test mode" (for development)
 *    - Select a location
 *    - Click "Enable"
 * 
 * 3. Security Rules:
 *    - Go to Firestore > Rules tab
 *    - Update rules to require authentication
 *    - See firestore.rules file for production rules
 * 
 * 4. Create Test User:
 *    - Go to Authentication > Users tab
 *    - Click "Add user"
 *    - Email: admin@example.com
 *    - Password: Admin@123
 *    - Click "Add user"
 */
