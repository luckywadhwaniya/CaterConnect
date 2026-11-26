from rest_framework.permissions import BasePermission


class IsCateringUser(BasePermission):
    """Allows access only to catering users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'catering')


class IsStoreOwner(BasePermission):
    """Allows access only to grocery store owner users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'store_owner')


class IsAdminUser(BasePermission):
    """Allows access only to admin users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'admin' or request.user.is_staff))


class IsCateringOrAdmin(BasePermission):
    """Allows access to catering users or admins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['catering', 'admin'] or request.user.is_staff))


class IsStoreOwnerOrAdmin(BasePermission):
    """Allows access to store owner users or admins."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role in ['store_owner', 'admin'] or request.user.is_staff))
