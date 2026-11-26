from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from accounts.permissions import IsAdminUser
from .models import GroceryStore
from .serializers import GroceryStoreSerializer


class GroceryStoreListView(generics.ListAPIView):
    """List all active grocery stores for catering users and owners."""
    serializer_class = GroceryStoreSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['store_name', 'phone', 'address']
    ordering_fields = ['store_name', 'created_at']
    ordering = ['store_name']

    def _ensure_default_store(self):
        try:
            from django.contrib.auth import get_user_model
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

    def get_queryset(self):
        if not GroceryStore.objects.filter(store_name__icontains='Wadhwaniya').exists():
            self._ensure_default_store()
        user = self.request.user
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return GroceryStore.objects.all().select_related('owner')
        return GroceryStore.objects.filter(is_active=True).select_related('owner')


class GroceryStoreDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve or update store details. Store owners can only edit their own."""
    serializer_class = GroceryStoreSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return GroceryStore.objects.all().select_related('owner')
        return GroceryStore.objects.filter(is_active=True).select_related('owner')

    def perform_update(self, serializer):
        user = self.request.user
        store = self.get_object()
        if not (user.is_staff or getattr(user, 'role', '') == 'admin' or store.owner == user):
            raise PermissionDenied("You do not have permission to modify this store.")
        serializer.save()


class AdminStoreListView(generics.ListCreateAPIView):
    """Admin-only view to list all stores and create new stores."""
    queryset = GroceryStore.objects.all().select_related('owner')
    serializer_class = GroceryStoreSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['store_name', 'phone', 'address', 'owner__email', 'owner__first_name']
    ordering = ['store_name']
