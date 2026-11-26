from django.contrib import admin
from .models import GroceryStore


@admin.register(GroceryStore)
class GroceryStoreAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'owner', 'phone', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('store_name', 'phone', 'address', 'owner__email', 'owner__first_name', 'owner__last_name')
    readonly_fields = ('created_at',)
