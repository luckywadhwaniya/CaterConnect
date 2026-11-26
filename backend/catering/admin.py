from django.contrib import admin
from .models import CateringEvent


@admin.register(CateringEvent)
class CateringEventAdmin(admin.ModelAdmin):
    list_display = ('event_name', 'catering_user', 'event_date', 'delivery_date', 'num_guests', 'created_at')
    list_filter = ('event_date', 'delivery_date')
    search_fields = ('event_name', 'catering_user__email', 'catering_user__first_name', 'event_location')
    readonly_fields = ('created_at', 'updated_at')
