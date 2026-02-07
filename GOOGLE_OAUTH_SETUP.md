# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Employee Management System.

## Prerequisites

- Google Cloud Console account
- Employee Management System running locally

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" and then "New Project"
3. Enter a project name (e.g., "Employee Management System")
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Google+ API" and click on it
3. Click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type and click "Create"
3. Fill in the required information:
   - App name: "Employee Management System"
   - User support email: Your email
   - Developer contact information: Your email
4. Click "Save and Continue"
5. Skip the "Scopes" section by clicking "Save and Continue"
6. Skip the "Test users" section by clicking "Save and Continue"
7. Review and click "Back to Dashboard"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application" as the application type
4. Enter a name (e.g., "Employee Management Web Client")
5. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (when deploying)
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - Your production API domain + `/api/auth/google/callback` (when deploying)
7. Click "Create"
8. Copy the Client ID and Client Secret

## Step 5: Configure Environment Variables

### Backend Configuration

1. Copy `backend/.env.example` to `backend/.env`
2. Update the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session Configuration
SESSION_SECRET=your_session_secret_key_here_make_it_long_and_random
```

### Frontend Configuration

1. Copy `frontend/.env.example` to `frontend/.env`
2. Update the following variable:

```env
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Step 6: Test the Integration

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend server:
   ```bash
   cd frontend
   npm start
   ```

3. Navigate to `http://localhost:3000/login`
4. Click "Continue with Google"
5. Complete the Google OAuth flow

## Step 7: Production Deployment

When deploying to production:

1. Update the authorized JavaScript origins and redirect URIs in Google Cloud Console
2. Update the environment variables with your production domains
3. Ensure HTTPS is enabled for production

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure the redirect URI in Google Cloud Console matches exactly with your backend URL
   - Check that the protocol (http/https) matches

2. **"invalid_client" error**
   - Verify that the Client ID and Client Secret are correct
   - Ensure the OAuth consent screen is properly configured

3. **Google Sign-In button not appearing**
   - Check that the Google Client ID is set in the frontend environment variables
   - Verify that the Google Identity Services script is loading properly

4. **CORS errors**
   - Ensure the frontend URL is added to authorized JavaScript origins
   - Check that CORS is properly configured in the backend

### Debug Mode

To enable debug logging, add this to your backend `.env`:

```env
NODE_ENV=development
```

This will show detailed error messages in the console.

## Security Considerations

1. **Never commit credentials to version control**
   - Always use environment variables
   - Add `.env` files to `.gitignore`

2. **Use HTTPS in production**
   - Google OAuth requires HTTPS for production domains
   - Update redirect URIs to use HTTPS

3. **Validate user data**
   - The backend validates Google tokens server-side
   - User roles are assigned based on your business logic

4. **Session security**
   - Use a strong session secret
   - Configure secure cookies for production

## Features Included

- ✅ Google OAuth 2.0 authentication
- ✅ Account linking (existing users can link Google accounts)
- ✅ Automatic user creation for new Google users
- ✅ Profile picture sync from Google
- ✅ JWT token generation after OAuth
- ✅ Role-based access control
- ✅ Secure token storage
- ✅ Error handling and user feedback

## Default User Roles

New users authenticated via Google OAuth are assigned the "Viewer" role by default. Administrators can change user roles through the user management interface.