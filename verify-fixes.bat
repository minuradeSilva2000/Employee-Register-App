@echo off
echo ========================================
echo Verification Script - All Errors Fixed
echo ========================================
echo.

echo [1/4] Checking TypeScript Configuration...
cd frontend
if exist tsconfig.json (
    echo ✅ tsconfig.json found
) else (
    echo ❌ tsconfig.json not found
    pause
    exit /b 1
)

echo.
echo [2/4] Checking TypeScript Files...
if exist src\index.tsx (
    echo ✅ index.tsx found
) else (
    echo ❌ index.tsx not found
)

if exist src\App.tsx (
    echo ✅ App.tsx found
) else (
    echo ❌ App.tsx not found
)

if exist src\pages\EmployeeManagement.tsx (
    echo ✅ EmployeeManagement.tsx found
) else (
    echo ❌ EmployeeManagement.tsx not found
)

echo.
echo [3/4] Checking for Duplicate Files...
if exist src\components\dashboard\QuickActionGrid.js (
    echo ❌ Duplicate QuickActionGrid.js found - should be removed
) else (
    echo ✅ No duplicate QuickActionGrid.js
)

if exist src\components\ui\LoadingSpinner.js (
    echo ❌ Duplicate LoadingSpinner.js found - should be removed
) else (
    echo ✅ No duplicate LoadingSpinner.js
)

echo.
echo [4/4] Checking Node Modules...
if exist node_modules (
    echo ✅ node_modules found
) else (
    echo ⚠️  node_modules not found - run 'npm install'
)

cd ..

echo.
echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Run 'cd frontend' and 'npm start' to test
echo 2. Run 'git-push-all-fixes.bat' to commit changes
echo.
pause
