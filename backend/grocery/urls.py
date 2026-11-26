from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.GroceryCategoryListView.as_view(), name='categories'),
    path('items/', views.GroceryItemListView.as_view(), name='items'),
    path('admin/categories/', views.AdminGroceryCategoryCreateView.as_view(), name='admin_categories_create'),
    path('admin/categories/<int:pk>/', views.AdminGroceryCategoryDetailView.as_view(), name='admin_categories_detail'),
    path('admin/items/', views.AdminGroceryItemCreateView.as_view(), name='admin_items_create'),
    path('admin/items/<int:pk>/', views.AdminGroceryItemDetailView.as_view(), name='admin_items_detail'),
]
