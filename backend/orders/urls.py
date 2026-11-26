from django.urls import path
from . import views

urlpatterns = [
    path('', views.GroceryOrderListCreateView.as_view(), name='order_list_create'),
    path('store-stats/', views.StoreStatsView.as_view(), name='store_stats'),
    path('<uuid:pk>/', views.GroceryOrderDetailView.as_view(), name='order_detail'),
    path('<uuid:pk>/status/', views.OrderStatusUpdateView.as_view(), name='order_status_update'),
    path('<uuid:pk>/bill/', views.OrderBillUpdateView.as_view(), name='order_bill_update'),
    path('<uuid:pk>/pdf/', views.OrderPDFView.as_view(), name='order_pdf'),
    path('<uuid:pk>/duplicate/', views.OrderDuplicateView.as_view(), name='order_duplicate'),
    path('<uuid:order_id>/items/<int:item_id>/', views.OrderItemUpdateView.as_view(), name='order_item_update'),
]
