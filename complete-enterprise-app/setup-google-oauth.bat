@echo off
echo ========================================
echo Google OAuth Setup - Complete Enterprise Platform
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo .env file created!
    echo.
)

echo Current .env configuration:
echo ----------------------------------------
type .env
echo ----------------------------------------
echo.

echo INSTRUCTIONS:
echo.
echo 1. Go to: https://console.cloud.google.com/
echo 2. Create a new project or select existing one
echo 3. Enable Google+ API
echo 4. Create OAuth 2.0 Client ID (Web application)
echo 5. Add authorized JavaScript origins:
echo    - http://localhost:3000
echo 6. Copy your Client ID
echo.

set /p CLIENT_ID="Enter your Google Client ID (or press Enter to skip): "

if not "%CLIENT_ID%"=="" (
    echo.
    echo Updating .env file with your Client ID...
    
    REM Create temporary file with new content
    (
        echo # Google OAuth Configuration
        echo # Get your Client ID from: https://console.cloud.google.com/apis/credentials
        echo VITE_GOOGLE_CLIENT_ID=%CLIENT_ID%
        echo.
        echo # Application Configuration
        echo VITE_APP_NAME=Complete Enterprise Platform
        echo VITE_APP_URL=http://localhost:3000
    ) > .env.tmp
    
    REM Replace old .env with new one
    move /y .env.tmp .env > nul
    
    echo.
    echo ✓ Client ID added to .env file!
    echo.
    echo Updated .env configuration:
    echo ----------------------------------------
    type .env
    echo ----------------------------------------
    echo.
    echo ✓ Setup complete!
    echo.
    echo NEXT STEPS:
    echo 1. Restart your dev server (Ctrl+C then 'npm run dev')
    echo 2. Open http://localhost:3000
    echo 3. Click "Sign in with Google" button
    echo 4. Test the authentication flow
    echo.
) else (
    echo.
    echo Skipped Client ID configuration.
    echo You can manually edit the .env file later.
    echo.
)

echo For detailed setup instructions, see: GOOGLE_OAUTH_SETUP.md
echo.
pause
