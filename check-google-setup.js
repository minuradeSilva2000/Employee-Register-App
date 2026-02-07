#!/usr/bin/env node

/**
 * Google OAuth Setup Verification Script
 * Run this to check if your Google OAuth credentials are properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Google OAuth Setup...\n');

// Check backend .env
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');

let backendEnv = '';
let frontendEnv = '';

try {
  backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
} catch (error) {
  console.log('❌ Backend .env file not found');
  process.exit(1);
}

try {
  frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
} catch (error) {
  console.log('❌ Frontend .env file not found');
  process.exit(1);
}

// Parse environment variables
const parseEnv = (content) => {
  const env = {};
  content.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim();
    }
  });
  return env;
};

const backendConfig = parseEnv(backendEnv);
const frontendConfig = parseEnv(frontendEnv);

console.log('📋 Configuration Check:\n');

// Check backend Google Client ID
const backendClientId = backendConfig.GOOGLE_CLIENT_ID;
if (!backendClientId || backendClientId.includes('your_google_client_id_here')) {
  console.log('❌ Backend GOOGLE_CLIENT_ID not configured');
  console.log('   Current value:', backendClientId || 'not set');
  console.log('   Expected: something.apps.googleusercontent.com\n');
} else if (backendClientId.endsWith('.apps.googleusercontent.com')) {
  console.log('✅ Backend GOOGLE_CLIENT_ID configured correctly');
  console.log('   Value:', backendClientId.substring(0, 20) + '...\n');
} else {
  console.log('⚠️  Backend GOOGLE_CLIENT_ID format looks wrong');
  console.log('   Should end with: .apps.googleusercontent.com\n');
}

// Check backend Google Client Secret
const backendClientSecret = backendConfig.GOOGLE_CLIENT_SECRET;
if (!backendClientSecret || backendClientSecret.includes('your_google_client_secret_here')) {
  console.log('❌ Backend GOOGLE_CLIENT_SECRET not configured');
  console.log('   Current value:', backendClientSecret || 'not set');
} else {
  console.log('✅ Backend GOOGLE_CLIENT_SECRET configured');
  console.log('   Value:', backendClientSecret.substring(0, 10) + '...\n');
}

// Check frontend Google Client ID
const frontendClientId = frontendConfig.VITE_GOOGLE_CLIENT_ID;
if (!frontendClientId || frontendClientId.includes('PASTE_YOUR_REAL_CLIENT_ID_HERE')) {
  console.log('❌ Frontend VITE_GOOGLE_CLIENT_ID not configured');
  console.log('   Current value:', frontendClientId || 'not set');
  console.log('   Expected: something.apps.googleusercontent.com\n');
} else if (frontendClientId.endsWith('.apps.googleusercontent.com')) {
  console.log('✅ Frontend VITE_GOOGLE_CLIENT_ID configured correctly');
  console.log('   Value:', frontendClientId.substring(0, 20) + '...\n');
} else {
  console.log('⚠️  Frontend VITE_GOOGLE_CLIENT_ID format looks wrong');
  console.log('   Should end with: .apps.googleusercontent.com\n');
}

// Check if Client IDs match
if (backendClientId && frontendClientId && backendClientId === frontendClientId) {
  console.log('✅ Backend and Frontend Client IDs match\n');
} else if (backendClientId && frontendClientId) {
  console.log('❌ Backend and Frontend Client IDs do NOT match');
  console.log('   Backend:', backendClientId);
  console.log('   Frontend:', frontendClientId);
  console.log('   They should be the same!\n');
}

// Final recommendation
const allConfigured = 
  backendClientId && !backendClientId.includes('your_google_client_id_here') &&
  backendClientSecret && !backendClientSecret.includes('your_google_client_secret_here') &&
  frontendClientId && !frontendClientId.includes('PASTE_YOUR_REAL_CLIENT_ID_HERE') &&
  backendClientId === frontendClientId;

if (allConfigured) {
  console.log('🎉 Google OAuth appears to be configured correctly!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart your servers (backend and frontend)');
  console.log('2. Go to http://localhost:3000/login');
  console.log('3. Click "Continue with Google"');
  console.log('4. You should see Google sign-in popup/redirect');
} else {
  console.log('⚠️  Google OAuth is not fully configured yet.');
  console.log('');
  console.log('Please follow the setup guide in GOOGLE_SETUP_QUICK.md:');
  console.log('1. Go to https://console.cloud.google.com/');
  console.log('2. Create OAuth credentials');
  console.log('3. Update your .env files with real credentials');
  console.log('4. Run this script again to verify');
}

console.log('\n📖 For detailed setup instructions, see: GOOGLE_SETUP_QUICK.md');