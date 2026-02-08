/**
 * Google OAuth Configuration Checker
 * Utility to validate Google OAuth setup and provide helpful feedback
 */

/**
 * Check if Google OAuth is properly configured
 * @returns {Object} Configuration status and details
 */
export const checkGoogleOAuthConfig = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  
  const result = {
    isConfigured: false,
    clientId: clientId,
    issues: [],
    recommendations: []
  };

  // Check if client ID exists
  if (!clientId) {
    result.issues.push('VITE_GOOGLE_CLIENT_ID is not set in environment variables');
    result.recommendations.push('Add VITE_GOOGLE_CLIENT_ID to your .env file');
    return result;
  }

  // Check for placeholder values
  const placeholders = [
    'PASTE_YOUR_REAL_CLIENT_ID_HERE.apps.googleusercontent.com',
    'demo-client-id.apps.googleusercontent.com',
    'your_google_client_id_here.apps.googleusercontent.com'
  ];

  if (placeholders.includes(clientId)) {
    result.issues.push('Google Client ID is using a placeholder value');
    result.recommendations.push('Replace with your actual Google Client ID from Google Cloud Console');
    return result;
  }

  // Check client ID format
  if (!clientId.endsWith('.apps.googleusercontent.com')) {
    result.issues.push('Google Client ID format is invalid');
    result.recommendations.push('Client ID should end with .apps.googleusercontent.com');
    return result;
  }

  // Check if client ID looks valid (basic format check)
  const clientIdPattern = /^[0-9]+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$/;
  if (!clientIdPattern.test(clientId)) {
    result.issues.push('Google Client ID format appears invalid');
    result.recommendations.push('Verify the Client ID copied from Google Cloud Console is complete');
  }

  // Check API URL configuration
  if (!apiUrl) {
    result.issues.push('VITE_API_BASE_URL is not configured');
    result.recommendations.push('Set VITE_API_BASE_URL in your .env file');
  }

  // If no issues, configuration is valid
  if (result.issues.length === 0) {
    result.isConfigured = true;
    result.recommendations.push('Google OAuth configuration appears valid');
  }

  return result;
};

/**
 * Get configuration help text
 * @returns {Object} Help information for setting up Google OAuth
 */
export const getConfigurationHelp = () => {
  return {
    title: 'Google OAuth Setup Required',
    description: 'To enable Google Sign-In, you need to configure OAuth credentials from Google Cloud Console.',
    steps: [
      {
        step: 1,
        title: 'Go to Google Cloud Console',
        description: 'Visit https://console.cloud.google.com/',
        action: 'Open Google Cloud Console'
      },
      {
        step: 2,
        title: 'Create or Select Project',
        description: 'Create a new project or select an existing one for your application',
        action: 'Create/Select Project'
      },
      {
        step: 3,
        title: 'Enable APIs',
        description: 'Enable Google+ API and People API in the API Library',
        action: 'Enable APIs'
      },
      {
        step: 4,
        title: 'Configure OAuth Consent Screen',
        description: 'Set up the OAuth consent screen with your app information',
        action: 'Configure Consent Screen'
      },
      {
        step: 5,
        title: 'Create OAuth 2.0 Credentials',
        description: 'Create Web Application credentials with authorized origins and redirect URIs',
        action: 'Create Credentials'
      },
      {
        step: 6,
        title: 'Update Environment Variables',
        description: 'Add your Client ID to VITE_GOOGLE_CLIENT_ID in .env file',
        action: 'Update .env File'
      }
    ],
    requiredEnvVars: [
      {
        name: 'VITE_GOOGLE_CLIENT_ID',
        description: 'Your Google OAuth Client ID',
        example: '123456789-abcdefghijklmnop.apps.googleusercontent.com'
      },
      {
        name: 'VITE_API_BASE_URL',
        description: 'Your backend API URL',
        example: 'http://localhost:5000'
      }
    ],
    authorizedOrigins: [
      'http://localhost:3000',
      'https://yourdomain.com'
    ],
    redirectURIs: [
      'http://localhost:5000/auth/google/callback',
      'https://yourdomain.com/auth/google/callback'
    ]
  };
};

/**
 * Log configuration status to console (for debugging)
 */
export const logConfigurationStatus = () => {
  const config = checkGoogleOAuthConfig();
  
  console.group('🔍 Google OAuth Configuration Status');
  console.log('Configured:', config.isConfigured ? '✅' : '❌');
  console.log('Client ID:', config.clientId || 'Not set');
  
  if (config.issues.length > 0) {
    console.group('❌ Issues Found:');
    config.issues.forEach(issue => console.log(`• ${issue}`));
    console.groupEnd();
  }
  
  if (config.recommendations.length > 0) {
    console.group('💡 Recommendations:');
    config.recommendations.forEach(rec => console.log(`• ${rec}`));
    console.groupEnd();
  }
  
  console.groupEnd();
  
  return config;
};

export default {
  checkGoogleOAuthConfig,
  getConfigurationHelp,
  logConfigurationStatus
};