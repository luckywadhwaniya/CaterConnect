@echo off
echo ============================================================
echo   CaterConnect - Project Setup Script
echo   Your Catering Grocery List, Digitally Connected.
echo ============================================================
echo.

:: ---- BACKEND SETUP ----
echo [1/6] Setting up Python virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate

echo [2/6] Installing Python dependencies...
pip install -r requirements.txt

echo [3/6] Copying .env file...
if not exist .env (
    copy .env.example .env
    echo   .env file created. Please edit backend\.env with your PostgreSQL credentials.
    echo   Press any key after editing .env to continue...
    pause > nul
) else (
    echo   .env already exists, skipping.
)

echo [4/6] Running Django migrations...
python manage.py migrate

echo [5/6] Creating Django superuser (admin)...
echo   You will be prompted to enter admin credentials.
python manage.py createsuperuser --email admin@caterconnect.com

echo [6/6] Django backend setup complete!
echo.
cd ..

:: ---- FRONTEND SETUP ----
echo [7/8] Installing Node.js dependencies...
cd frontend
npm install

echo [8/8] Frontend setup complete!
cd ..

echo.
echo ============================================================
echo   Setup Complete!
echo.
echo   To start the backend:
echo     cd backend
echo     venv\Scripts\activate
echo     python manage.py runserver
echo.
echo   To start the frontend (in a new terminal):
echo     cd frontend
echo     npm run dev
echo.
echo   Open: http://localhost:5173
echo ============================================================
pause
