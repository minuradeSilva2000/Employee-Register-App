@echo off
echo ========================================
echo Firebase Deployment Script
echo ========================================
echo.

echo Step 1: Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please fix errors and try again.
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2: Deploying to Firebase...
call firebase deploy
if %errorlevel% neq 0 (
    echo Deployment failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo Deployment completed successfully!
echo ========================================
echo.
echo Your app is now live!
echo Check Firebase Console for the URL.
echo.
pause
