@echo off
REM Firebase Vite App - Complete Automation Script (Windows)
REM This script automates: install → git → commit → build → run

echo ==========================================
echo Firebase Vite App - Complete Automation
echo ==========================================
echo.

REM Step 1: Check Node.js
echo Step 1/11: Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    echo Please install from https://nodejs.org/
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION% detected
echo.

REM Step 2: Install dependencies
echo Step 2/11: Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Step 3: Create .env
echo Step 3/11: Setting up environment...
if not exist .env (
    copy .env.example .env >nul
    echo [OK] Created .env file
    echo [WARNING] Edit .env with your Firebase credentials!
) else (
    echo [OK] .env file exists
)
echo.

REM Step 4: Initialize Git
echo Step 4/11: Initializing Git...
if not exist .git (
    git init
    echo [OK] Git repository initialized
) else (
    echo [OK] Git repository exists
)
echo.

REM Step 5: Git add
echo Step 5/11: Adding files to Git...
git add .
echo [OK] Files staged for commit
echo.

REM Step 6: Git commit
echo Step 6/11: Committing files...
git commit -m "Initial Firebase Vite app: Manual login, CRUD, Reports, Full automation"
if errorlevel 1 (
    echo [WARNING] No changes to commit or already committed
) else (
    echo [OK] Files committed
)
echo.

REM Step 7: Set main branch
echo Step 7/11: Setting main branch...
git branch -M main
echo [OK] Main branch configured
echo.

REM Step 8: Remote origin
echo Step 8/11: Git remote setup...
echo [INFO] To push to GitHub, run:
echo.
echo   git remote add origin YOUR_GITHUB_REPO_URL
echo   git push -u origin main
echo.
echo Example:
echo   git remote add origin https://github.com/yourusername/firebase-vite-app.git
echo   git push -u origin main
echo.

REM Step 9: TypeScript check
echo Step 9/11: TypeScript type checking...
call npx tsc --noEmit
if errorlevel 1 (
    echo [WARNING] TypeScript warnings detected (non-blocking)
) else (
    echo [OK] TypeScript check passed
)
echo.

REM Step 10: Build
echo Step 10/11: Building production bundle...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    exit /b 1
)
echo [OK] Production build successful
echo [OK] Build output: dist\
echo.

REM Step 11: Complete
echo Step 11/11: Setup complete!
echo.
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next Steps:
echo.
echo 1. Update Firebase Config:
echo    - Edit .env file
echo    - Add your Firebase credentials
echo.
echo 2. Create Test User:
echo    - Firebase Console ^> Authentication
echo    - Add: test@example.com / Test@123
echo.
echo 3. Start Development:
echo    - Run: npm run dev
echo    - Open: http://localhost:3000
echo.
echo 4. Deploy (Optional):
echo    - npm install -g firebase-tools
echo    - firebase login
echo    - firebase init
echo    - firebase deploy
echo.
echo ==========================================
echo.

REM Ask to start dev server
set /p START_DEV="Start development server now? (y/n): "
if /i "%START_DEV%"=="y" (
    echo.
    echo Starting development server...
    echo URL: http://localhost:3000
    echo Press Ctrl+C to stop
    echo.
    call npm run dev
)
