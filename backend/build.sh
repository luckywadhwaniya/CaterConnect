#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
python manage.py shell << 'EOF'
import os
from django.contrib.auth import get_user_model

User = get_user_model()
email = os.environ.get('ADMIN_EMAIL').strip()
password = os.environ.get('ADMIN_PASSWORD')

user, created = User.objects.get_or_create(
    email=email,
    defaults={
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
        'is_active': True,
    }
)
user.is_staff = True
user.is_superuser = True
user.is_active = True
user.role = 'admin'
user.set_password(password)
user.save()
print(f"Admin user {'created' if created else 'updated'}: {email}")
EOF
fi
