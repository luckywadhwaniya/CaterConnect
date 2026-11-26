from rest_framework import serializers
from django.db import transaction
from django.utils import timezone
from .models import GroceryOrder, GroceryOrderItem, OrderStatusHistory
from catering.models import CateringEvent
from catering.serializers import CateringEventSerializer
from stores.models import GroceryStore
from grocery.models import GroceryItem
from grocery.serializers import GroceryItemSerializer


class GroceryOrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.ReadOnlyField()
    grocery_item_detail = GroceryItemSerializer(source='grocery_item', read_only=True)
    computed_total = serializers.ReadOnlyField()
    # Expose Gujarati and English names directly at root level
    name = serializers.ReadOnlyField(source='item_name')
    name_en = serializers.SerializerMethodField()
    grocery_item_name = serializers.ReadOnlyField(source='item_name')
    grocery_item_name_en = serializers.SerializerMethodField()

    class Meta:
        model = GroceryOrderItem
        fields = [
            'id',
            'order',
            'grocery_item',
            'grocery_item_detail',
            'custom_item_name',
            'item_name',
            'name',
            'name_en',
            'grocery_item_name',
            'grocery_item_name_en',
            'quantity',
            'unit',
            'notes',
            'is_available',
            'alternative_suggestion',
            'unit_price',
            'total_price',
            'computed_total',
        ]
        read_only_fields = ['id', 'order', 'item_name', 'computed_total']

    def get_name_en(self, obj):
        if obj.grocery_item and hasattr(obj.grocery_item, 'name_en'):
            return obj.grocery_item.name_en or ''
        return ''

    def get_grocery_item_name_en(self, obj):
        if obj.grocery_item and hasattr(obj.grocery_item, 'name_en'):
            return obj.grocery_item.name_en or ''
        return ''


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.ReadOnlyField(source='changed_by.full_name')
    changed_by_email = serializers.ReadOnlyField(source='changed_by.email')

    class Meta:
        model = OrderStatusHistory
        fields = [
            'id',
            'order',
            'old_status',
            'new_status',
            'changed_by',
            'changed_by_name',
            'changed_by_email',
            'comment',
            'changed_at',
        ]
        read_only_fields = ['id', 'order', 'changed_at']


class OrderStoreSerializer(serializers.ModelSerializer):
    owner_name = serializers.ReadOnlyField(source='owner.full_name')

    class Meta:
        model = GroceryStore
        fields = ['id', 'store_name', 'phone', 'address', 'owner_name']


class GroceryOrderSerializer(serializers.ModelSerializer):
    items = GroceryOrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    event = CateringEventSerializer(read_only=True)
    store_details = OrderStoreSerializer(source='store', read_only=True)
    store_name = serializers.ReadOnlyField(source='store.store_name')
    catering_user_name = serializers.ReadOnlyField(source='catering_user.full_name')
    catering_name = serializers.ReadOnlyField(source='catering_user.full_name')
    catering_user_phone = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    total_items = serializers.SerializerMethodField()
    event_name = serializers.SerializerMethodField()
    event_date = serializers.SerializerMethodField()
    delivery_date = serializers.SerializerMethodField()
    delivery_time = serializers.SerializerMethodField()
    event_location = serializers.SerializerMethodField()
    number_of_guests = serializers.SerializerMethodField()
    num_guests = serializers.SerializerMethodField()

    class Meta:
        model = GroceryOrder
        fields = [
            'id',
            'order_number',
            'event',
            'event_name',
            'event_date',
            'delivery_date',
            'delivery_time',
            'event_location',
            'number_of_guests',
            'num_guests',
            'catering_user',
            'catering_user_name',
            'catering_name',
            'catering_user_phone',
            'phone',
            'store',
            'store_name',
            'store_details',
            'status',
            'special_instructions',
            'store_comment',
            'subtotal_amount',
            'tax_amount',
            'delivery_charge',
            'discount_amount',
            'total_amount',
            'is_billed',
            'billed_at',
            'items',
            'total_items',
            'status_history',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'order_number',
            'catering_user',
            'created_at',
            'updated_at',
        ]

    def get_catering_user_phone(self, obj):
        if hasattr(obj.catering_user, 'catering_profile') and obj.catering_user.catering_profile:
            return obj.catering_user.catering_profile.phone
        return ''

    def get_phone(self, obj):
        return self.get_catering_user_phone(obj)

    def get_total_items(self, obj):
        return obj.items.count()

    def get_event_name(self, obj):
        return obj.event.event_name if hasattr(obj, 'event') and obj.event else ''

    def get_event_date(self, obj):
        return str(obj.event.event_date) if hasattr(obj, 'event') and obj.event and obj.event.event_date else ''

    def get_delivery_date(self, obj):
        return str(obj.event.delivery_date) if hasattr(obj, 'event') and obj.event and obj.event.delivery_date else ''

    def get_delivery_time(self, obj):
        return str(obj.event.delivery_time) if hasattr(obj, 'event') and obj.event and obj.event.delivery_time else ''

    def get_event_location(self, obj):
        return obj.event.event_location if hasattr(obj, 'event') and obj.event else ''

    def get_number_of_guests(self, obj):
        return obj.event.num_guests if hasattr(obj, 'event') and obj.event else 0

    def get_num_guests(self, obj):
        return obj.event.num_guests if hasattr(obj, 'event') and obj.event else 0


class BillItemInputSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    total_price = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0.00)
    is_available = serializers.BooleanField(required=False, default=True)
    alternative_suggestion = serializers.CharField(required=False, allow_blank=True, default='')


class OrderBillSerializer(serializers.Serializer):
    items = BillItemInputSerializer(many=True, required=False)
    delivery_charge = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    tax_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    discount_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    store_comment = serializers.CharField(required=False, allow_blank=True, default='')
    mark_ready = serializers.BooleanField(required=False, default=False)


class OrderItemInputSerializer(serializers.Serializer):
    grocery_item = serializers.PrimaryKeyRelatedField(
        queryset=GroceryItem.objects.all(),
        required=False,
        allow_null=True
    )
    custom_item_name = serializers.CharField(max_length=200, required=False, allow_blank=True)
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    unit = serializers.CharField(max_length=20)
    notes = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_unit(self, value):
        val = (value or 'kg').strip().lower()
        mapping = {
            'gm': 'gram',
            'grams': 'gram',
            'gram': 'gram',
            'kgs': 'kg',
            'kg': 'kg',
            'liter': 'litre',
            'liters': 'litre',
            'litres': 'litre',
            'litre': 'litre',
            'l': 'litre',
            'ml': 'ml',
            'mls': 'ml',
            'packet': 'packet',
            'packets': 'packet',
            'pkt': 'packet',
            'piece': 'piece',
            'pieces': 'piece',
            'pcs': 'piece',
            'pc': 'piece',
            'dozen': 'dozen',
            'dozens': 'dozen',
            'tin': 'tin',
            'bag': 'bag',
            'box': 'box',
        }
        return mapping.get(val, val)

    def validate(self, attrs):
        if not attrs.get('grocery_item') and not attrs.get('custom_item_name'):
            attrs['custom_item_name'] = "Catering Ingredient"
        return attrs


class EventInputSerializer(serializers.Serializer):
    event_name = serializers.CharField(max_length=300)
    event_date = serializers.DateField()
    delivery_date = serializers.DateField()
    delivery_time = serializers.TimeField()
    event_location = serializers.CharField()
    num_guests = serializers.IntegerField(min_value=1, required=False)
    number_of_guests = serializers.IntegerField(min_value=1, required=False)
    additional_instructions = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        if 'num_guests' not in attrs and 'number_of_guests' in attrs:
            attrs['num_guests'] = attrs.pop('number_of_guests')
        elif 'num_guests' not in attrs:
            attrs['num_guests'] = 1
        return attrs


class GroceryOrderCreateSerializer(serializers.Serializer):
    event_id = serializers.UUIDField(required=False, allow_null=True)
    event_data = EventInputSerializer(required=False, allow_null=True)
    store = serializers.PrimaryKeyRelatedField(queryset=GroceryStore.objects.filter(is_active=True), required=False)
    special_instructions = serializers.CharField(required=False, allow_blank=True, default='')
    items = OrderItemInputSerializer(many=True, allow_empty=False)

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        # Auto-resolve store if empty or missing
        if not data.get('store'):
            default_store = GroceryStore.objects.filter(is_active=True).first()
            if default_store:
                data['store'] = str(default_store.id)
        # If flat event fields were provided instead of nested event_data, wrap them
        if not data.get('event_data') and data.get('event_name'):
            data['event_data'] = {
                'event_name': data.get('event_name'),
                'event_date': data.get('event_date'),
                'delivery_date': data.get('delivery_date'),
                'delivery_time': data.get('delivery_time'),
                'event_location': data.get('event_location'),
                'num_guests': data.get('num_guests') or data.get('number_of_guests') or 1,
                'additional_instructions': data.get('additional_instructions', ''),
            }
        return super().to_internal_value(data)

    def validate(self, attrs):
        # Ensure store is resolved
        if not attrs.get('store'):
            default_store = GroceryStore.objects.filter(is_active=True).first()
            if default_store:
                attrs['store'] = default_store
            else:
                raise serializers.ValidationError({"store": "No active grocery store found."})

        event_id = attrs.get('event_id')
        event_data = attrs.get('event_data')

        if not event_id and not event_data:
            raise serializers.ValidationError("Either 'event_id' or 'event_data' must be supplied.")

        if event_id:
            user = self.context['request'].user
            try:
                event = CateringEvent.objects.get(id=event_id)
                if not (user.is_staff or getattr(user, 'role', '') == 'admin' or event.catering_user == user):
                    raise serializers.ValidationError("Event does not belong to you.")
                if hasattr(event, 'order') and event.order is not None:
                    raise serializers.ValidationError("An order has already been created for this event.")
                attrs['resolved_event'] = event
            except CateringEvent.DoesNotExist:
                raise serializers.ValidationError({"event_id": "Event not found."})

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        store = validated_data['store']
        special_instructions = validated_data.get('special_instructions', '')
        items_data = validated_data['items']

        with transaction.atomic():
            # Create or resolve event
            if 'resolved_event' in validated_data:
                event = validated_data['resolved_event']
            else:
                event_info = validated_data['event_data'].copy()
                # Clean up any unsupported fields from event_info
                valid_fields = {'event_name', 'event_date', 'delivery_date', 'delivery_time', 'event_location', 'num_guests', 'additional_instructions'}
                clean_event_info = {k: v for k, v in event_info.items() if k in valid_fields}
                if 'num_guests' not in clean_event_info:
                    clean_event_info['num_guests'] = 1

                event = CateringEvent.objects.create(
                    catering_user=user,
                    **clean_event_info
                )

            # Create order
            order = GroceryOrder.objects.create(
                event=event,
                catering_user=user,
                store=store,
                status='pending',
                special_instructions=special_instructions,
            )

            # Create items
            order_items = []
            for item_info in items_data:
                order_items.append(
                    GroceryOrderItem(
                        order=order,
                        grocery_item=item_info.get('grocery_item'),
                        custom_item_name=item_info.get('custom_item_name', ''),
                        quantity=item_info['quantity'],
                        unit=item_info['unit'],
                        notes=item_info.get('notes', ''),
                        is_available=True,
                    )
                )
            GroceryOrderItem.objects.bulk_create(order_items)

            # Initial status history log
            OrderStatusHistory.objects.create(
                order=order,
                old_status='',
                new_status='pending',
                changed_by=user,
                comment='Order placed by catering professional.',
            )

        return order


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=GroceryOrder.STATUS_CHOICES)
    comment = serializers.CharField(required=False, allow_blank=True, default='')
