from django.db import migrations
from django.contrib.auth.hashers import make_password


def seed_wadhwaniya_store(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    GroceryStore = apps.get_model('stores', 'GroceryStore')

    email = 'wadhwaniya@caterconnect.com'
    user = User.objects.filter(email=email).first()
    if not user:
        user = User.objects.create(
            email=email,
            first_name='Wadhwaniya',
            last_name='Provision Store',
            role='store_owner',
            password=make_password('store123'),
            is_active=True,
            is_staff=False,
        )

    store = GroceryStore.objects.filter(store_name__icontains='Wadhwaniya').first()
    if not store:
        # Check if user already owns another store
        if not hasattr(user, 'store') or not GroceryStore.objects.filter(owner=user).exists():
            GroceryStore.objects.create(
                owner=user,
                store_name='Wadhwaniya Provision Store',
                phone='+91 98250 12345',
                address='Tower Chowk, Main Bazaar, Gujarat',
                is_active=True,
            )


def reverse_seed(apps, schema_editor):
    GroceryStore = apps.get_model('stores', 'GroceryStore')
    User = apps.get_model('accounts', 'User')
    GroceryStore.objects.filter(store_name='Wadhwaniya Provision Store').delete()
    User.objects.filter(email='wadhwaniya@caterconnect.com').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('stores', '0001_initial'),
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_wadhwaniya_store, reverse_seed),
    ]
