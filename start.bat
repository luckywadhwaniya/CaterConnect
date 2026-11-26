@echo off
:: Start Backend
start "CaterConnect Backend" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && python manage.py runserver"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak > nul

:: Start Frontend
start "CaterConnect Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo CaterConnect is starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
timeout /t 3 /nobreak > nul
start http://localhost:5173
