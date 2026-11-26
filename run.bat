@echo off
title CaterConnect - Full Setup and Launch
color 0A
echo.
echo ============================================================
echo   CaterConnect - Full Setup and Launch
echo   Digital Catering Grocery List Management System
echo ============================================================
echo.

:: ---- CHECK PYTHON ----
echo [Step 1/8] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH.
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo.

:: ---- CHECK NODE ----
echo [Step 2/8] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
node --version
echo.

:: ---- BACKEND VENV ----
echo [Step 3/8] Setting up Python virtual environment...
cd /d "%~dp0backend"
if not exist "venv" (
    python -m venv venv
    echo   Virtual environment created.
) else (
    echo   Virtual environment already exists.
)
call venv\Scripts\activate.bat
echo.

:: ---- INSTALL PYTHON DEPS ----
echo [Step 4/8] Installing Python dependencies...
pip install --quiet -r requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Python dependencies.
    pause
    exit /b 1
)
echo   Dependencies installed successfully.
echo.

:: ---- MIGRATIONS ----
echo [Step 5/8] Running database migrations...
python manage.py migrate --run-syncdb
if %errorlevel% neq 0 (
    echo ERROR: Migrations failed. Check the error above.
    pause
    exit /b 1
)
echo   Migrations complete.
echo.

:: ---- CREATE SUPERUSER & DEFAULT STORE ----
echo [Step 6/8] Creating admin and Wadhwaniya Provision Store...
python manage.py shell -c "from accounts.models import User; u = User.objects.filter(email='admin@caterconnect.com'); print('Admin already exists') if u.exists() else (User.objects.create_superuser(email='admin@caterconnect.com', password='admin123', first_name='Admin', last_name='User'), print('Admin created: admin@caterconnect.com / admin123'))"
python manage.py shell -c "from accounts.models import User; from stores.models import GroceryStore; u = User.objects.filter(email='wadhwaniya@caterconnect.com').first(); (u := User.objects.create_user(email='wadhwaniya@caterconnect.com', password='store123', first_name='Wadhwaniya', last_name='Provision Store', role='store_owner', is_active=True)) if not u else None; GroceryStore.objects.get_or_create(owner=u, defaults={'store_name': 'Wadhwaniya Provision Store', 'phone': '+91 98250 12345', 'address': 'Tower Chowk, Main Bazaar, Gujarat', 'is_active': True}); print('Wadhwaniya Provision Store ready: wadhwaniya@caterconnect.com / store123')"
echo.

:: ---- INSTALL FRONTEND DEPS ----
echo [Step 7/8] Installing frontend dependencies...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies.
        pause
        exit /b 1
    )
    echo   Frontend dependencies installed.
) else (
    echo   node_modules already exists. Skipping npm install.
)
echo.

:: ---- LAUNCH BOTH SERVERS ----
echo [Step 8/8] Starting CaterConnect servers...
echo.

:: Start backend in a new window
cd /d "%~dp0backend"
start "CaterConnect Backend - Django" cmd /k "call venv\Scripts\activate.bat && echo. && echo ============================================ && echo   CaterConnect Backend (Django) && echo   Running on http://localhost:8000 && echo ============================================ && echo. && python manage.py runserver 0.0.0.0:8000"

:: Wait for backend to initialize
timeout /t 4 /nobreak >nul

:: Start frontend in a new window
cd /d "%~dp0frontend"
start "CaterConnect Frontend - Vite" cmd /k "echo. && echo ============================================ && echo   CaterConnect Frontend (Vite + React) && echo   Running on http://localhost:5173 && echo ============================================ && echo. && npm run dev"

:: Wait for frontend to initialize
timeout /t 5 /nobreak >nul

echo.
echo ============================================================
echo   CaterConnect is RUNNING!
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8000
echo   Admin:     http://localhost:8000/admin/
echo.
echo   Admin Login:
echo     Email:    admin@caterconnect.com
echo     Password: admin123
echo.
echo   Store Owner Login (Wadhwaniya Provision Store):
echo     Email:    wadhwaniya@caterconnect.com
echo     Password: store123
echo.
echo   Two terminal windows have been opened:
echo   - Backend (Django) server
echo   - Frontend (Vite) dev server
echo.
echo   Press any key to open the app in your browser...
echo ============================================================
pause >nul
start http://localhost:5173
