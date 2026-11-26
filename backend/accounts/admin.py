from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, CateringProfile


class CateringProfileInline(admin.StackedInline):
    model = CateringProfile
    can_delete = False
    verbose_name_plural = 'Catering Profile'
    fk_name = 'user'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines = (CateringProfileInline,)
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active', 'created_at')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Role & Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at', 'last_login')
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password', 'is_staff', 'is_active'),
        }),
    )


@admin.register(CateringProfile)
class CateringProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'business_name', 'phone', 'gst_number', 'created_at')
    search_fields = ('user__email', 'business_name', 'phone', 'gst_number')
    readonly_fields = ('created_at',)
