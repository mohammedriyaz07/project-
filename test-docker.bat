@echo off
echo 🧪 Testing MEAN Stack Docker Setup
echo ==================================
echo.

REM Test if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker is running
echo.

REM Test docker-compose configuration
echo 🔍 Validating docker-compose configuration...
docker-compose config --quiet 2>nul
if errorlevel 1 (
    echo ❌ Docker Compose configuration has errors
    pause
    exit /b 1
) else (
    echo ✅ Docker Compose configuration is valid
)
echo.

REM Check if required directories exist
echo 📁 Checking project structure...
if not exist "frontend" (
    echo ⚠️  Warning: frontend/ directory not found
)

if not exist "backend" (
    echo ⚠️  Warning: backend/ directory not found
)

if not exist ".env" (
    echo ⚠️  Warning: .env file not found. Copy from env.example
)

echo.
echo 🎯 To start the application:
echo    Production mode:  docker-compose up --build
echo    Development mode: docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
echo.
echo 📍 Access URLs:
echo    Frontend (prod): http://localhost
echo    Backend API:     http://localhost:3000/api/
echo    MongoDB:         localhost:27017
echo.
pause
