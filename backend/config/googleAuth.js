/**
 * Google OAuth 2.0 Configuration
 * Handles Google authentication setup and token verification
 */

const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI
});

/**
 * Verify Google ID Token
 * @param {string} idToken - Google ID token from frontend
 * @returns {Object} - Verified user payload
 */
const verifyGoogleToken = async (idToken) => {
  try {
    console.log('🔍 Verifying Google token...');
    
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('✅ Google token verified successfully');
    
    return {
      success: true,
      user: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profilePicture: payload.picture,
        emailVerified: payload.email_verified
      }
    };
  } catch (error) {
    console.error('❌ Google token verification failed:', error.message);
    return {
      success: false,
      error: 'Invalid Google token'
    };
  }
};

/**
 * Generate Google OAuth URL for redirect-based flow
 * @returns {string} - Google OAuth authorization URL
 */
const getGoogleAuthURL = () => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  return googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true,
    state: 'security_token_' + Date.now() // CSRF protection
  });
};

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from Google
 * @returns {Object} - Token response
 */
const exchangeCodeForTokens = async (code) => {
  try {
    console.log('🔄 Exchanging code for tokens...');
    
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);
    
    // Get user info using access token
    const userInfoResponse = await googleClient.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo'
    });
    
    console.log('✅ Successfully exchanged code for tokens');
    
    return {
      success: true,
      tokens: tokens,
      user: userInfoResponse.data
    };
  } catch (error) {
    console.error('❌ Token exchange failed:', error.message);
    return {
      success: false,
      error: 'Failed to exchange authorization code'
    };
  }
};

module.exports = {
  googleClient,
  verifyGoogleToken,
  getGoogleAuthURL,
  exchangeCodeForTokens
};