@echo off
echo ========================================
echo Google OAuth Setup Script
echo ========================================
echo.

cd frontend

echo Creating .env.local file...
echo.

if exist .env.local (
    echo .env.local already exists!
    echo.
    choice /C YN /M "Do you want to overwrite it"
    if errorlevel 2 goto :end
    if errorlevel 1 goto :create
) else (
    goto :create
)

:create
echo.
echo Please enter your Google Client ID:
echo (Get it from: https://console.cloud.google.com/apis/credentials)
echo.
set /p CLIENT_ID="Client ID: "

if "%CLIENT_ID%"=="" (
    echo Error: Client ID cannot be empty!
    goto :end
)

echo # Local Environment Variables > .env.local
echo VITE_API_BASE_URL=http://localhost:5000/api >> .env.local
echo VITE_GOOGLE_CLIENT_ID=%CLIENT_ID% >> .env.local

echo.
echo ========================================
echo SUCCESS! Google OAuth configured
echo ========================================
echo.
echo .env.local file created with your Client ID
echo.
echo Next steps:
echo 1. Restart your development server
echo 2. Open http://localhost:5175
echo 3. Click "Continue with Google"
echo.
echo For detailed setup instructions, see:
echo GOOGLE_OAUTH_SETUP.md
echo.

:end
cd ..
pause
