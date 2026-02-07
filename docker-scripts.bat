@echo off
REM Docker management scripts for Employee Management System (Windows)

if "%1"=="build" (
    echo Building Docker images...
    docker-compose build --no-cache
    goto :eof
)

if "%1"=="up" (
    echo Starting services in production mode...
    docker-compose up -d
    goto :eof
)

if "%1"=="dev" (
    echo Starting services in development mode...
    docker-compose -f docker-compose.dev.yml up -d
    goto :eof
)

if "%1"=="down" (
    echo Stopping all services...
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    goto :eof
)

if "%1"=="logs" (
    if "%2"=="" (
        echo Showing logs for all services...
        docker-compose logs -f
    ) else (
        echo Showing logs for %2...
        docker-compose logs -f %2
    )
    goto :eof
)

if "%1"=="restart" (
    echo Restarting services...
    docker-compose restart
    goto :eof
)

if "%1"=="clean" (
    echo Cleaning up Docker resources...
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    docker volume prune -f
    goto :eof
)

if "%1"=="status" (
    echo Service status:
    docker-compose ps
    goto :eof
)

if "%1"=="shell" (
    if "%2"=="" (
        echo Usage: %0 shell ^<service-name^>
        echo Available services: backend, frontend, mongodb
    ) else (
        docker-compose exec %2 sh
    )
    goto :eof
)

if "%1"=="backup" (
    echo Creating MongoDB backup...
    docker-compose exec mongodb mongodump --host localhost --port 27017 --username admin --password password123 --authenticationDatabase admin --db employee_management --out /data/backup/%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
    goto :eof
)

echo Employee Management System - Docker Management
echo Usage: %0 {build^|up^|dev^|down^|logs^|restart^|clean^|status^|shell^|backup}
echo.
echo Commands:
echo   build   - Build Docker images
echo   up      - Start services in production mode
echo   dev     - Start services in development mode
echo   down    - Stop all services
echo   logs    - Show logs (optionally specify service name)
echo   restart - Restart services
echo   clean   - Clean up Docker resources
echo   status  - Show service status
echo   shell   - Open shell in service container
echo   backup  - Create MongoDB backup
echo.
echo Examples:
echo   %0 build
echo   %0 up
echo   %0 logs backend
echo   %0 shell mongodb