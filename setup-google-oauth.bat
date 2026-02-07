@echo off
echo.
echo ========================================
echo   Google OAuth Setup Helper
echo ========================================
echo.

echo 1. Checking current configuration...
node check-google-setup.js

echo.
echo ========================================
echo   Quick Setup Guide
echo ========================================
echo.
echo To set up Google OAuth:
echo.
echo 1. Go to: https://console.cloud.google.com/
echo 2. Create a new project
echo 3. Set up OAuth consent screen
echo 4. Create OAuth credentials (Web application)
echo 5. Copy Client ID and Secret
echo 6. Update your .env files
echo 7. Restart servers
echo.
echo For detailed instructions, open: GOOGLE_SETUP_QUICK.md
echo.

pause