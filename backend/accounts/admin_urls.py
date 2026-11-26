from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.AdminUserListView.as_view(), name='admin_users'),
    path('users/<uuid:pk>/', views.AdminUserDetailView.as_view(), name='admin_user_detail'),
]
