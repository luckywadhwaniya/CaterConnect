from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from accounts.permissions import IsCateringOrAdmin
from .models import CateringEvent
from .serializers import CateringEventSerializer


class CateringEventListCreateView(generics.ListCreateAPIView):
    """List events for current catering user or create a new event."""
    serializer_class = CateringEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsCateringOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['event_date', 'delivery_date']
    search_fields = ['event_name', 'event_location', 'additional_instructions']
    ordering_fields = ['event_date', 'delivery_date', 'created_at']
    ordering = ['-event_date']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return CateringEvent.objects.all().select_related('catering_user', 'order')
        return CateringEvent.objects.filter(catering_user=user).select_related('catering_user', 'order')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'catering' and not user.is_staff:
            raise PermissionDenied("Only catering professionals can create catering events.")
        serializer.save(catering_user=user)


class CateringEventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a catering event owned by user."""
    serializer_class = CateringEventSerializer
    permission_classes = [permissions.IsAuthenticated, IsCateringOrAdmin]
    lookup_field = 'pk'

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return CateringEvent.objects.all().select_related('catering_user', 'order')
        return CateringEvent.objects.filter(catering_user=user).select_related('catering_user', 'order')

    def perform_update(self, serializer):
        event = self.get_object()
        user = self.request.user
        if not (user.is_staff or getattr(user, 'role', '') == 'admin' or event.catering_user == user):
            raise PermissionDenied("You do not have permission to edit this event.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if not (user.is_staff or getattr(user, 'role', '') == 'admin' or instance.catering_user == user):
            raise PermissionDenied("You do not have permission to delete this event.")
        instance.delete()
