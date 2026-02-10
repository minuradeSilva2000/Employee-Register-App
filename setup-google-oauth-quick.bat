@echo off
REM Quick Google OAuth Setup Script for Windows
REM This script helps you configure Google OAuth in your application

echo ========================================
echo   Google OAuth Quick Setup
echo ========================================
echo.

echo This script will help you set up Google OAuth authentication.
echo.
echo PREREQUISITES:
echo 1. You have a Google account
echo 2. You have created a Google Cloud project
echo 3. You have obtained your Google Client ID
echo.

pause

echo.
echo ========================================
echo   Step 1: Get Your Google Client ID
echo ========================================
echo.
echo If you haven't already:
echo 1. Go to: https://console.cloud.google.com/
echo 2. Create a new project
echo 3. Enable Google Identity Services API
echo 4. Create OAuth 2.0 credentials
echo 5. Copy your Client ID
echo.
echo Your Client ID should look like:
echo 123456789-abc123def456.apps.googleusercontent.com
echo.

pause

echo.
echo ========================================
echo   Step 2: Enter Your Client ID
echo ========================================
echo.
set /p CLIENT_ID="Paste your Google Client ID here: "

if "%CLIENT_ID%"=="" (
    echo ERROR: Client ID cannot be empty!
    pause
    exit /b 1
)

echo.
echo You entered: %CLIENT_ID%
echo.
set /p CONFIRM="Is this correct? (Y/N): "

if /i not "%CONFIRM%"=="Y" (
    echo Setup cancelled.
    pause
    exit /b 0
)

echo.
echo ========================================
echo   Step 3: Updating Configuration
echo ========================================
echo.

REM Backup existing .env file
if exist "frontend\.env" (
    echo Creating backup of existing .env file...
    copy "frontend\.env" "frontend\.env.backup" >nul
    echo Backup created: frontend\.env.backup
)

REM Update frontend .env file
echo Updating frontend/.env file...
(
echo # API Configuration
echo REACT_APP_API_URL=http://localhost:5000/api
echo VITE_API_BASE_URL=http://localhost:5000
echo.
echo # Google OAuth Configuration
echo # Your Real Google Client ID
echo REACT_APP_GOOGLE_CLIENT_ID=%CLIENT_ID%
echo VITE_GOOGLE_CLIENT_ID=%CLIENT_ID%
echo.
echo # Environment
echo REACT_APP_ENV=development
) > "frontend\.env"

echo Frontend configuration updated!
echo.

REM Update backend .env file if it exists
if exist "backend\.env" (
    echo Updating backend/.env file...
    
    REM Read existing backend .env and append Google config
    findstr /v "GOOGLE_CLIENT_ID" "backend\.env" > "backend\.env.tmp"
    (
        type "backend\.env.tmp"
        echo.
        echo # Google OAuth Configuration
        echo GOOGLE_CLIENT_ID=%CLIENT_ID%
    ) > "backend\.env"
    del "backend\.env.tmp"
    
    echo Backend configuration updated!
) else (
    echo Backend .env file not found, skipping...
)

echo.
echo ========================================
echo   Step 4: Restart Servers
echo ========================================
echo.
echo Configuration updated successfully!
echo.
echo IMPORTANT: You need to restart your servers for changes to take effect.
echo.
echo To restart:
echo 1. Stop frontend server (Ctrl+C in frontend terminal)
echo 2. Stop backend server (Ctrl+C in backend terminal)
echo 3. Start backend: cd backend ^&^& npm start
echo 4. Start frontend: cd frontend ^&^& npm start
echo.

pause

echo.
echo ========================================
echo   Step 5: Test Google Authentication
echo ========================================
echo.
echo After restarting servers:
echo 1. Open: http://localhost:3000/login
echo 2. Click "Continue with Google" button
echo 3. You should be redirected to Google's authentication page
echo 4. Select your Google account
echo 5. Enter OTP if prompted (if 2FA is enabled)
echo 6. Grant permissions
echo 7. You'll be redirected back and logged in!
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Your Google OAuth is now configured!
echo.
echo Configuration saved to:
echo - frontend/.env
echo - backend/.env (if exists)
echo.
echo Backup saved to:
echo - frontend/.env.backup
echo.
echo Next steps:
echo 1. Restart your servers
echo 2. Test the Google Sign-In button
echo 3. Enjoy seamless Google authentication!
echo.

pause
