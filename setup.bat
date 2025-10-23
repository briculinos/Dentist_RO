@echo off
echo 🏥 Medical Evaluation System - Quick Setup
echo ===========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    echo    Visit: https://docs.docker.com/desktop/windows/install/
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

echo ✅ Docker and Docker Compose are installed
echo.

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ .env file created
    echo ⚠️  Please edit .env and set secure passwords!
    echo.
) else (
    echo ⚠️  .env file already exists, skipping...
    echo.
)

echo 🐳 Starting Docker containers...
docker-compose up -d

echo.
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

echo.
echo 🔄 Running database migrations...
docker-compose exec -T backend npx prisma migrate deploy

echo.
echo 🌱 Seeding database with initial data...
docker-compose exec -T backend node prisma/seed.js

echo.
echo ✅ Setup complete!
echo.
echo 📱 Access the application at:
echo    Frontend: http://localhost:3000
echo    Backend API: http://localhost:5000
echo.
echo 🔐 Default credentials:
echo    Admin:  admin@clinica.ro / admin123
echo    Doctor: doctor@clinica.ro / admin123
echo.
echo ⚠️  IMPORTANT: Change these passwords after first login!
echo.
echo 📚 For more information, see README.md
echo.
echo 🛑 To stop the application, run:
echo    docker-compose down
echo.
pause
