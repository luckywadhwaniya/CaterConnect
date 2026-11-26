from rest_framework import generics, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Prefetch

from accounts.permissions import IsAdminUser
from .models import GroceryCategory, GroceryItem
from .serializers import GroceryCategorySerializer, GroceryItemSerializer


class GroceryCategoryListView(generics.ListAPIView):
    """List all active grocery categories along with their active items."""
    serializer_class = GroceryCategorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None  # Return all categories without pagination

    def get_queryset(self):
        active_items_prefetch = Prefetch(
            'items',
            queryset=GroceryItem.objects.filter(is_active=True).order_by('order', 'name')
        )
        return GroceryCategory.objects.filter(is_active=True).prefetch_related(active_items_prefetch).order_by('order', 'name_en')


class GroceryItemListView(generics.ListAPIView):
    """List all active grocery items with filtering and search support."""
    serializer_class = GroceryItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'default_unit']
    search_fields = ['name', 'name_en', 'category__name', 'category__name_en']
    ordering_fields = ['order', 'name', 'name_en']
    ordering = ['order', 'name']

    def get_queryset(self):
        queryset = GroceryItem.objects.filter(is_active=True).select_related('category')
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset


class AdminGroceryCategoryCreateView(generics.CreateAPIView):
    """Admin endpoint to create a new category."""
    queryset = GroceryCategory.objects.all()
    serializer_class = GroceryCategorySerializer
    permission_classes = [IsAdminUser]


class AdminGroceryCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin endpoint to retrieve, update, or soft/hard delete a category."""
    queryset = GroceryCategory.objects.all()
    serializer_class = GroceryCategorySerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'


class AdminGroceryItemCreateView(generics.CreateAPIView):
    """Admin endpoint to create a new grocery item."""
    queryset = GroceryItem.objects.all()
    serializer_class = GroceryItemSerializer
    permission_classes = [IsAdminUser]


class AdminGroceryItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin endpoint to retrieve, update, or delete a grocery item."""
    queryset = GroceryItem.objects.all().select_related('category')
    serializer_class = GroceryItemSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'
