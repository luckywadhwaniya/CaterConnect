from django.urls import path
from . import views

urlpatterns = [
    path('', views.CateringEventListCreateView.as_view(), name='event_list_create'),
    path('<uuid:pk>/', views.CateringEventDetailView.as_view(), name='event_detail'),
]
