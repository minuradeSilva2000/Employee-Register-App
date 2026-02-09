@echo off
REM Employee Management System - Docker Setup Script (Windows)
REM This script builds and runs the complete application using Docker

echo 🚀 Employee Management System - Docker Setup
echo =============================================

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed

REM Stop and remove existing containers
echo 🧹 Cleaning up existing containers...
docker-compose down --volumes --remove-orphans 2>nul

REM Build and start the application
echo 🔨 Building and starting the application...
docker-compose up --build -d

REM Wait for services to start
echo ⏳ Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Check service health
echo 🔍 Checking service health...

REM Check Application
curl -f http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application is running and healthy
) else (
    echo ❌ Application is not responding yet, may need more time to start
)

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Application Information:
echo    🌐 Web Application: http://localhost:5000
echo    🔌 API Endpoint: http://localhost:5000/api
echo    🗄️  MongoDB: localhost:27017
echo.
echo 👤 Demo Login Credentials:
echo    Admin: admin@example.com / Admin@123
echo    HR: hr@example.com / Hr@123
echo    Viewer: viewer@example.com / Viewer@123
echo.
echo 🔧 Useful Commands:
echo    View logs: docker-compose logs -f
echo    Stop application: docker-compose down
echo    Restart application: docker-compose restart
echo    View running containers: docker-compose ps
echo.
echo 🎯 The application is now ready for testing!

REM Show running containers
echo 📊 Running Containers:
docker-compose ps

echo.
echo Press any key to exit...
pause >nul