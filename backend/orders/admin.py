from django.contrib import admin
from .models import GroceryOrder, GroceryOrderItem, OrderStatusHistory


class GroceryOrderItemInline(admin.TabularInline):
    model = GroceryOrderItem
    extra = 0
    fields = ('grocery_item', 'custom_item_name', 'quantity', 'unit', 'is_available', 'notes')


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ('old_status', 'new_status', 'changed_by', 'comment', 'changed_at')
    can_delete = False


@admin.register(GroceryOrder)
class GroceryOrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number',
        'catering_user',
        'store',
        'status',
        'event_name_display',
        'item_count',
        'created_at',
    )
    list_filter = ('status', 'created_at', 'store')
    search_fields = (
        'order_number',
        'catering_user__email',
        'catering_user__first_name',
        'store__store_name',
        'event__event_name',
    )
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    inlines = [GroceryOrderItemInline, OrderStatusHistoryInline]

    def event_name_display(self, obj):
        return obj.event.event_name if obj.event else '-'
    event_name_display.short_description = 'Event'

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Items'


@admin.register(GroceryOrderItem)
class GroceryOrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'item_name', 'quantity', 'unit', 'is_available')
    list_filter = ('is_available', 'unit')
    search_fields = ('order__order_number', 'grocery_item__name', 'custom_item_name')


@admin.register(OrderStatusHistory)
class OrderStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('order', 'old_status', 'new_status', 'changed_by', 'changed_at')
    list_filter = ('new_status', 'changed_at')
    search_fields = ('order__order_number', 'changed_by__email')
    readonly_fields = ('order', 'old_status', 'new_status', 'changed_by', 'comment', 'changed_at')
