import io
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from accounts.permissions import IsCateringUser, IsStoreOwner, IsAdminUser
from .models import GroceryOrder, GroceryOrderItem, OrderStatusHistory
from .serializers import (
    GroceryOrderSerializer,
    GroceryOrderCreateSerializer,
    OrderStatusUpdateSerializer,
    GroceryOrderItemSerializer,
    OrderBillSerializer,
)
from pdf_export.generator import generate_order_pdf


class GroceryOrderListCreateView(generics.ListCreateAPIView):
    """
    List orders based on user role:
    - Catering users see their own orders
    - Store owners see orders directed to their stores
    - Admins see all orders
    Create orders (Catering users only).
    """
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'store', 'event__event_date']
    search_fields = [
        'order_number',
        'event__event_name',
        'event__event_location',
        'store__store_name',
        'catering_user__first_name',
        'catering_user__last_name',
    ]
    ordering_fields = ['created_at', 'status', 'event__event_date']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return GroceryOrderCreateSerializer
        return GroceryOrderSerializer

    def get_queryset(self):
        user = self.request.user
        base_qs = GroceryOrder.objects.select_related(
            'event',
            'catering_user',
            'catering_user__catering_profile',
            'store',
            'store__owner'
        ).prefetch_related('items', 'items__grocery_item', 'status_history')

        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return base_qs
        elif user.role == 'catering':
            return base_qs.filter(catering_user=user)
        elif user.role == 'store_owner':
            return base_qs.filter(store__owner=user)
        return GroceryOrder.objects.none()

    def create(self, request, *args, **kwargs):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({'detail': 'Authentication required. Please log in.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = serializer.save()
            response_data = GroceryOrderSerializer(order, context={'request': request}).data
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'detail': f'Order creation error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


class GroceryOrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve single order (catering user, store owner, or admin).
    Update order:
    - Catering users can edit instructions/items if status is 'pending'
    - Store owners can update store_comment and item availability
    Delete order:
    - Catering users can cancel (soft-cancel: status='cancelled') if status is 'pending'
    """
    serializer_class = GroceryOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        user = self.request.user
        base_qs = GroceryOrder.objects.select_related(
            'event',
            'catering_user',
            'catering_user__catering_profile',
            'store',
            'store__owner'
        ).prefetch_related('items', 'items__grocery_item', 'status_history')

        if user.is_staff or getattr(user, 'role', '') == 'admin':
            return base_qs
        elif user.role == 'catering':
            return base_qs.filter(catering_user=user)
        elif user.role == 'store_owner':
            return base_qs.filter(store__owner=user)
        return GroceryOrder.objects.none()

    def patch(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user

        is_admin = user.is_staff or getattr(user, 'role', '') == 'admin'
        is_catering_owner = (order.catering_user == user)
        is_store_owner = (order.store.owner == user)

        if not (is_admin or is_catering_owner or is_store_owner):
            raise PermissionDenied("You do not have permission to modify this order.")

        # Catering user modification rules
        if is_catering_owner and not is_admin:
            if order.status != 'pending':
                raise ValidationError("Only orders in 'pending' status can be modified by catering professionals.")

            # Can update special instructions
            if 'special_instructions' in request.data:
                order.special_instructions = request.data['special_instructions']

            # Can update items if provided
            if 'items' in request.data and isinstance(request.data['items'], list):
                with transaction.atomic():
                    # Replace items
                    order.items.all().delete()
                    for item_data in request.data['items']:
                        grocery_item_id = item_data.get('grocery_item')
                        GroceryOrderItem.objects.create(
                            order=order,
                            grocery_item_id=grocery_item_id if grocery_item_id else None,
                            custom_item_name=item_data.get('custom_item_name', ''),
                            quantity=item_data.get('quantity', 1),
                            unit=item_data.get('unit', 'kg'),
                            notes=item_data.get('notes', ''),
                            is_available=True,
                        )
            order.save()

        # Store owner modification rules
        elif is_store_owner and not is_admin:
            if 'store_comment' in request.data:
                order.store_comment = request.data['store_comment']
                order.save()

            # Store owner can update items availability and suggestions
            if 'items' in request.data and isinstance(request.data['items'], list):
                for item_update in request.data['items']:
                    item_id = item_update.get('id')
                    if item_id:
                        try:
                            item = order.items.get(id=item_id)
                            if 'is_available' in item_update:
                                item.is_available = item_update['is_available']
                            if 'alternative_suggestion' in item_update:
                                item.alternative_suggestion = item_update['alternative_suggestion']
                            item.save()
                        except GroceryOrderItem.DoesNotExist:
                            pass

        # Admin modification
        else:
            if 'special_instructions' in request.data:
                order.special_instructions = request.data['special_instructions']
            if 'store_comment' in request.data:
                order.store_comment = request.data['store_comment']
            if 'status' in request.data:
                order.status = request.data['status']
            order.save()

        updated_order = self.get_object()
        return Response(GroceryOrderSerializer(updated_order, context={'request': request}).data)

    def delete(self, request, *args, **kwargs):
        order = self.get_object()
        user = request.user

        is_admin = user.is_staff or getattr(user, 'role', '') == 'admin'
        is_catering_owner = (order.catering_user == user)

        if not (is_admin or is_catering_owner):
            raise PermissionDenied("You do not have permission to cancel this order.")

        if not is_admin and order.status != 'pending':
            raise ValidationError("Only pending orders can be cancelled.")

        # Soft cancel
        old_status = order.status
        order.status = 'cancelled'
        order.save()

        # Log status history
        OrderStatusHistory.objects.create(
            order=order,
            old_status=old_status,
            new_status='cancelled',
            changed_by=user,
            comment=request.data.get('comment', 'Order cancelled by user.')
        )

        return Response(
            {'message': 'Order successfully cancelled.', 'status': 'cancelled'},
            status=status.HTTP_200_OK
        )


class OrderStatusUpdateView(APIView):
    """
    Store owner or admin updates order status with an optional comment.
    Creates an OrderStatusHistory entry.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        user = request.user
        order = get_object_or_404(
            GroceryOrder.objects.select_related('store', 'store__owner'),
            pk=pk
        )

        is_admin = user.is_staff or getattr(user, 'role', '') == 'admin'
        is_store_owner = (order.store.owner == user)

        if not (is_admin or is_store_owner):
            raise PermissionDenied("Only the store owner or admin can update order status.")

        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        comment = serializer.validated_data.get('comment', '')

        old_status = order.status
        order.status = new_status
        if comment:
            order.store_comment = comment
        order.save()

        # Log status transition
        history = OrderStatusHistory.objects.create(
            order=order,
            old_status=old_status,
            new_status=new_status,
            changed_by=user,
            comment=comment
        )

        return Response(
            {
                'message': f"Order status updated to '{new_status}'.",
                'order_id': str(order.id),
                'old_status': old_status,
                'new_status': new_status,
                'order': GroceryOrderSerializer(order, context={'request': request}).data
            },
            status=status.HTTP_200_OK
        )


class OrderPDFView(APIView):
    """Generate and stream a professional PDF summary of the grocery order."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk, *args, **kwargs):
        user = request.user
        order = get_object_or_404(
            GroceryOrder.objects.select_related(
                'event',
                'catering_user',
                'catering_user__catering_profile',
                'store'
            ).prefetch_related('items', 'items__grocery_item'),
            pk=pk
        )

        is_admin = user.is_staff or getattr(user, 'role', '') == 'admin'
        is_catering_owner = (order.catering_user == user)
        is_store_owner = (order.store.owner == user)

        if not (is_admin or is_catering_owner or is_store_owner):
            raise PermissionDenied("You do not have permission to view or download this order PDF.")

        pdf_buffer = generate_order_pdf(order)

        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        filename = f"CaterConnect_Order_{order.order_number}.pdf"
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        return response


class OrderDuplicateView(APIView):
    """
    Duplicate an order template: returns the items and store information so
    a catering professional can easily place a similar order for a new event.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        user = request.user
        order = get_object_or_404(
            GroceryOrder.objects.prefetch_related('items', 'items__grocery_item'),
            pk=pk
        )

        is_admin = user.is_staff or getattr(user, 'role', '') == 'admin'
        if not (is_admin or order.catering_user == user):
            raise PermissionDenied("You can only duplicate your own orders.")

        items_data = []
        for item in order.items.all():
            items_data.append({
                'grocery_item': item.grocery_item_id,
                'item_name': item.item_name,
                'custom_item_name': item.custom_item_name,
                'quantity': str(item.quantity),
                'unit': item.unit,
                'notes': item.notes,
            })

        return Response(
            {
                'message': 'Order template duplicated successfully.',
                'source_order_number': order.order_number,
                'store_id': str(order.store_id),
                'store_name': order.store.store_name,
                'special_instructions': order.special_instructions,
                'items': items_data,
            },
            status=status.HTTP_200_OK
        )


class OrderBillUpdateView(APIView):
    """
    Store merchant prepares and updates the itemized bill for an order:
    - Sets unit_price and total_price for each item
    - Sets delivery_charge, tax_amount, discount_amount
    - Computes subtotal and grand total
    - Optionally marks order as 'ready' for caterer pickup
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk, *args, **kwargs):
        user = request.user
        order = get_object_or_404(
            GroceryOrder.objects.select_related('store', 'store__owner').prefetch_related('items'),
            pk=pk
        )

        is_admin = user.is_staff or getattr(user, 'role', '') == 'admin'
        is_store_owner = (order.store.owner == user)

        if not (is_admin or is_store_owner):
            raise PermissionDenied("Only the store merchant or admin can prepare or edit the order bill.")

        serializer = OrderBillSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        with transaction.atomic():
            # Update items pricing
            items_input = data.get('items', [])
            item_map = {item.id: item for item in order.items.all()}

            for item_data in items_input:
                item_id = item_data.get('id')
                if item_id in item_map:
                    it = item_map[item_id]
                    if 'unit_price' in item_data:
                        it.unit_price = item_data['unit_price']
                    if 'total_price' in item_data and item_data['total_price'] > 0:
                        it.total_price = item_data['total_price']
                    else:
                        it.total_price = round(it.quantity * it.unit_price, 2)
                    if 'is_available' in item_data:
                        it.is_available = item_data['is_available']
                    if 'alternative_suggestion' in item_data:
                        it.alternative_suggestion = item_data['alternative_suggestion']
                    it.save()

            # Update bill summary charges
            if 'delivery_charge' in data:
                order.delivery_charge = data['delivery_charge']
            if 'tax_amount' in data:
                order.tax_amount = data['tax_amount']
            if 'discount_amount' in data:
                order.discount_amount = data['discount_amount']
            if data.get('store_comment'):
                order.store_comment = data['store_comment']

            # Recalculate totals
            order.calculate_bill_totals(save=True)

            # Check if store merchant wants to also mark as ready
            if data.get('mark_ready') and order.status in ['accepted', 'preparing']:
                old_status = order.status
                order.status = 'ready'
                order.save()
                OrderStatusHistory.objects.create(
                    order=order,
                    old_status=old_status,
                    new_status='ready',
                    changed_by=user,
                    comment='Bill prepared and order marked ready for pickup by store.',
                )

        updated_order = GroceryOrder.objects.select_related(
            'event', 'catering_user', 'catering_user__catering_profile', 'store', 'store__owner'
        ).prefetch_related('items', 'items__grocery_item', 'status_history').get(pk=order.pk)

        return Response(
            {
                'message': 'Bill successfully generated and saved.',
                'order': GroceryOrderSerializer(updated_order, context={'request': request}).data,
            },
            status=status.HTTP_200_OK
        )


class OrderItemUpdateView(APIView):
    """Update single item availability, price, or substitute suggestion."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, order_id, item_id, *args, **kwargs):
        user = request.user
        order = get_object_or_404(GroceryOrder.objects.select_related('store', 'store__owner'), pk=order_id)

        is_admin = user.is_staff or getattr(user, 'role', '') == 'admin'
        is_store_owner = (order.store.owner == user)

        if not (is_admin or is_store_owner):
            raise PermissionDenied("Only the store owner can update item pricing or status.")

        item = get_object_or_404(GroceryOrderItem, pk=item_id, order=order)

        if 'is_available' in request.data:
            item.is_available = request.data['is_available']
        if 'unit_price' in request.data:
            item.unit_price = request.data['unit_price']
            item.total_price = round(item.quantity * item.unit_price, 2)
        if 'total_price' in request.data:
            item.total_price = request.data['total_price']
        if 'substitute_suggestion' in request.data:
            item.alternative_suggestion = request.data['substitute_suggestion']
        if 'alternative_suggestion' in request.data:
            item.alternative_suggestion = request.data['alternative_suggestion']

        item.save()
        order.calculate_bill_totals(save=True)

        return Response(
            GroceryOrderItemSerializer(item).data,
            status=status.HTTP_200_OK
        )


class StoreStatsView(APIView):
    """
    Returns merchant dashboard statistics including Total Revenue,
    Billed Orders, Completed Orders, Pending Orders, and Average Bill Value.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        base_qs = GroceryOrder.objects.all()

        if user.is_staff or getattr(user, 'role', '') == 'admin':
            pass
        elif getattr(user, 'role', '') == 'store_owner':
            base_qs = base_qs.filter(store__owner=user)
        else:
            base_qs = base_qs.filter(catering_user=user)

        total_orders = base_qs.count()
        pending_orders = base_qs.filter(status='pending').count()
        accepted_orders = base_qs.filter(status='accepted').count()
        preparing_orders = base_qs.filter(status='preparing').count()
        ready_orders = base_qs.filter(status='ready').count()
        completed_orders = base_qs.filter(status='completed').count()

        # Revenue from active/billed orders
        revenue_qs = base_qs.exclude(status__in=['cancelled', 'rejected'])
        total_revenue = sum(float(o.total_amount or 0) for o in revenue_qs)
        billed_orders_count = revenue_qs.filter(is_billed=True).count()
        avg_order_value = round(total_revenue / billed_orders_count, 2) if billed_orders_count > 0 else 0.0

        return Response({
            'total_revenue': round(total_revenue, 2),
            'billed_orders_count': billed_orders_count,
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'accepted_orders': accepted_orders,
            'preparing_orders': preparing_orders,
            'ready_orders': ready_orders,
            'completed_orders': completed_orders,
            'average_order_value': avg_order_value,
        }, status=status.HTTP_200_OK)
