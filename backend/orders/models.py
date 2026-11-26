import uuid
import random
from django.db import models
from django.conf import settings
from django.utils import timezone
from stores.models import GroceryStore
from catering.models import CateringEvent
from grocery.models import GroceryItem


class GroceryOrder(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('completed', 'Completed'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    UNIT_CHOICES = [
        ('kg', 'Kilogram (kg)'),
        ('gram', 'Gram (gm)'),
        ('litre', 'Litre'),
        ('ml', 'Millilitre (ml)'),
        ('piece', 'Piece'),
        ('packet', 'Packet'),
        ('dozen', 'Dozen'),
        ('tin', 'Tin'),
        ('bag', 'Bag'),
        ('box', 'Box'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=50, unique=True, blank=True)
    event = models.OneToOneField(CateringEvent, on_delete=models.CASCADE, related_name='order')
    catering_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    store = models.ForeignKey(GroceryStore, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    special_instructions = models.TextField(blank=True)
    store_comment = models.TextField(blank=True)
    subtotal_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    is_billed = models.BooleanField(default=False)
    billed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def calculate_bill_totals(self, save=True):
        """Calculate and update subtotal, total, and billing state based on item prices."""
        items_sum = sum(
            (item.total_price if item.total_price and item.total_price > 0 else (item.quantity * item.unit_price if item.unit_price else 0))
            for item in self.items.filter(is_available=True)
        )
        self.subtotal_amount = items_sum
        deliv = self.delivery_charge or 0
        tax = self.tax_amount or 0
        disc = self.discount_amount or 0
        self.total_amount = max(0, items_sum + deliv + tax - disc)
        if items_sum > 0:
            self.is_billed = True
            if not self.billed_at:
                self.billed_at = timezone.now()
        if save:
            self.save()
        return self.total_amount

    def save(self, *args, **kwargs):
        if not self.order_number:
            count = GroceryOrder.objects.count() + 101
            generated_number = f'ORD-{count}'
            while GroceryOrder.objects.filter(order_number=generated_number).exists():
                count += 1
                generated_number = f'ORD-{count}'
            self.order_number = generated_number
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.order_number} ({self.get_status_display()})"


class GroceryOrderItem(models.Model):
    UNIT_CHOICES = GroceryOrder.UNIT_CHOICES

    order = models.ForeignKey(GroceryOrder, on_delete=models.CASCADE, related_name='items')
    grocery_item = models.ForeignKey(GroceryItem, on_delete=models.SET_NULL, null=True, blank=True)
    custom_item_name = models.CharField(max_length=200, blank=True)  # for custom items
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    notes = models.TextField(blank=True)
    is_available = models.BooleanField(default=True)  # store can mark unavailable
    alternative_suggestion = models.TextField(blank=True)  # store suggestion
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    @property
    def item_name(self):
        if self.grocery_item:
            return self.grocery_item.name
        return self.custom_item_name or "Unnamed Item"

    @property
    def computed_total(self):
        if self.total_price and self.total_price > 0:
            return float(self.total_price)
        if self.unit_price and self.unit_price > 0:
            return float(round(self.quantity * self.unit_price, 2))
        return 0.00

    def __str__(self):
        return f"{self.item_name} - {self.quantity} {self.unit}"


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(GroceryOrder, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    comment = models.TextField(blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-changed_at']

    def __str__(self):
        return f"{self.order.order_number}: {self.old_status} -> {self.new_status}"
