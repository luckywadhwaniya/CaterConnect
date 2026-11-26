from django.urls import path
from . import views

urlpatterns = [
    path('', views.GroceryStoreListView.as_view(), name='store_list'),
    path('<uuid:pk>/', views.GroceryStoreDetailView.as_view(), name='store_detail'),
    path('admin/all/', views.AdminStoreListView.as_view(), name='admin_store_list'),
]
