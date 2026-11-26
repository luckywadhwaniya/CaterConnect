from django.apps import AppConfig


class StoresConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'stores'

    def ready(self):
        """Auto-seed default Wadhwaniya Provision Store on startup."""
        try:
            from django.contrib.auth import get_user_model
            from stores.models import GroceryStore
            User = get_user_model()
            email = 'wadhwaniya@caterconnect.com'
            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.create_user(
                    email=email,
                    password='store123',
                    first_name='Wadhwaniya',
                    last_name='Provision Store',
                    role='store_owner',
                    is_active=True,
                )
            if not GroceryStore.objects.filter(store_name__icontains='Wadhwaniya').exists():
                GroceryStore.objects.create(
                    owner=user,
                    store_name='Wadhwaniya Provision Store',
                    phone='+91 98250 12345',
                    address='Tower Chowk, Main Bazaar, Gujarat',
                    is_active=True,
                )
        except Exception:
            pass
