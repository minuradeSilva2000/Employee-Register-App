# Google Authentication Implementation

## Overview

Google OAuth 2.0 authentication has been successfully integrated into the Employee Management System. Users can now sign in using their Google accounts in addition to the traditional email/password authentication.

## What Was Implemented

### Backend Changes

1. **Dependencies Added**
   - `passport` - Authentication middleware
   - `passport-google-oauth20` - Google OAuth 2.0 strategy
   - `express-session` - Session management
   - `google-auth-library` - Google token verification

2. **New Files Created**
   - `backend/config/passport.js` - Passport Google OAuth configuration
   - `backend/routes/auth-google.js` - Google authentication routes

3. **Modified Files**
   - `backend/models/User.js` - Added Google OAuth fields (googleId, profilePicture, authProvider)
   - `backend/server.js` - Integrated Passport and session middleware
   - `backend/.env.example` - Added Google OAuth environment variables

4. **New API Endpoints**
   - `GET /api/auth/google` - Initiates Google OAuth flow
   - `GET /api/auth/google/callback` - Handles Google OAuth callback
   - `POST /api/auth/google/verify` - Verifies Google ID token (for frontend integration)

### Frontend Changes

1. **New Components**
   - `frontend/src/components/auth/GoogleSignIn.js` - Google Sign-In button component
   - `frontend/src/components/auth/OAuthCallback.js` - OAuth callback handler

2. **Modified Files**
   - `frontend/src/pages/auth/Login.js` - Added Google Sign-In button
   - `frontend/src/contexts/AuthContext.js` - Added Google authentication support
   - `frontend/src/services/api.js` - Added Google verification endpoint
   - `frontend/src/App.js` - Added OAuth callback route
   - `frontend/.env.example` - Added Google Client ID configuration

3. **New Features**
   - One-click Google Sign-In
   - Automatic account linking for existing users
   - Profile picture sync from Google
   - Seamless JWT token generation after OAuth

## How It Works

### Authentication Flow

1. **User clicks "Continue with Google"**
   - Frontend loads Google Identity Services
   - Google Sign-In popup appears

2. **User authenticates with Google**
   - Google returns an ID token
   - Frontend sends token to backend for verification

3. **Backend verifies token**
   - Validates token with Google's servers
   - Checks if user exists (by Google ID or email)
   - Creates new user or links existing account

4. **JWT tokens generated**
   - Backend generates access and refresh tokens
   - Tokens are sent back to frontend

5. **User is authenticated**
   - Frontend stores tokens in localStorage
   - User is redirected to dashboard

### Account Linking

If a user already has an account with the same email:
- The Google account is automatically linked
- User can sign in with either method
- Profile picture is synced from Google

### New User Creation

For new Google users:
- Account is created automatically
- Default role: "Viewer"
- Profile picture from Google
- No password required (OAuth only)

## Configuration Required

### 1. Google Cloud Console Setup

You need to:
1. Create a Google Cloud project
2. Enable Google+ API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add authorized origins and redirect URIs

See `GOOGLE_OAUTH_SETUP.md` for detailed instructions.

### 2. Environment Variables

**Backend (.env)**
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=your_session_secret_key_here
```

**Frontend (.env)**
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Testing the Implementation

### Prerequisites
1. MongoDB running locally
2. Google OAuth credentials configured
3. Environment variables set

### Steps to Test

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend server**
   ```bash
   cd frontend
   npm start
   ```

3. **Test Google Sign-In**
   - Navigate to `http://localhost:3000/login`
   - Click "Continue with Google"
   - Sign in with your Google account
   - Verify you're redirected to the dashboard

4. **Test Account Linking**
   - Create a regular account with email
   - Sign out
   - Sign in with Google using the same email
   - Verify the accounts are linked

## Security Features

1. **Token Verification**
   - All Google tokens are verified server-side
   - Invalid tokens are rejected

2. **Secure Session Management**
   - Sessions use secure cookies in production
   - Session secrets are environment-specific

3. **JWT Integration**
   - OAuth users receive same JWT tokens as regular users
   - Consistent authentication across methods

4. **Role-Based Access Control**
   - New Google users get "Viewer" role by default
   - Admins can change roles through user management

## Database Schema Changes

### User Model Updates

```javascript
{
  // Existing fields...
  
  // New Google OAuth fields
  googleId: String,           // Google user ID
  profilePicture: String,     // Google profile picture URL
  authProvider: String,       // 'local' or 'google'
  
  // Password is now optional for Google users
  password: {
    required: function() {
      return !this.googleId;  // Only required if not using Google
    }
  }
}
```

## API Documentation

### POST /api/auth/google/verify

Verifies a Google ID token and authenticates the user.

**Request Body:**
```json
{
  "credential": "google_id_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "user": {
      "_id": "user_id",
      "name": "User Name",
      "email": "user@example.com",
      "role": "Viewer",
      "profilePicture": "https://...",
      "authProvider": "google",
      "permissions": []
    }
  }
}
```

### GET /api/auth/google

Initiates the Google OAuth flow (redirect-based).

### GET /api/auth/google/callback

Handles the Google OAuth callback (redirect-based).

## Troubleshooting

### Common Issues

1. **"OAuth2Strategy requires a clientID option"**
   - Ensure environment variables are set
   - Check that `.env` file exists
   - Verify `dotenv` is loaded before passport

2. **Google Sign-In button not appearing**
   - Check that `REACT_APP_GOOGLE_CLIENT_ID` is set
   - Verify Google Identity Services script is loading
   - Check browser console for errors

3. **"redirect_uri_mismatch" error**
   - Ensure redirect URI in Google Console matches exactly
   - Check protocol (http vs https)
   - Verify port numbers match

4. **CORS errors**
   - Add frontend URL to authorized JavaScript origins
   - Check CORS configuration in backend

## Future Enhancements

Potential improvements:
- Add more OAuth providers (GitHub, Microsoft, etc.)
- Implement OAuth token refresh
- Add profile picture upload for local users
- Support multiple linked accounts per user
- Add OAuth audit logging

## Files Modified/Created

### Backend
- ✅ `config/passport.js` (new)
- ✅ `routes/auth-google.js` (new)
- ✅ `models/User.js` (modified)
- ✅ `server.js` (modified)
- ✅ `.env.example` (modified)

### Frontend
- ✅ `components/auth/GoogleSignIn.js` (new)
- ✅ `components/auth/OAuthCallback.js` (new)
- ✅ `pages/auth/Login.js` (modified)
- ✅ `contexts/AuthContext.js` (modified)
- ✅ `services/api.js` (modified)
- ✅ `App.js` (modified)
- ✅ `.env.example` (new)

## Support

For issues or questions:
1. Check the `GOOGLE_OAUTH_SETUP.md` guide
2. Review error messages in browser console
3. Check backend server logs
4. Verify environment variables are set correctly