@echo off
cd /d C:\Users\DELL\CaterConnect\backend
echo Creating virtual environment...
python -m venv venv
call venv\Scripts\activate
echo Installing dependencies...
pip install -r requirements.txt
echo Running migrations...
python manage.py migrate
echo.
echo Creating superuser...
python manage.py shell -c "from accounts.models import User; User.objects.create_superuser(email='admin@caterconnect.com', password='admin123', first_name='Admin', last_name='User') if not User.objects.filter(email='admin@caterconnect.com').exists() else print('Admin already exists')"
echo.
echo Backend setup complete!
