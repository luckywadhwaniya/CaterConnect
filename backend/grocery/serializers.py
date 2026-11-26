from rest_framework import serializers
from .models import GroceryCategory, GroceryItem


class GroceryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source='category.name')
    category_name_en = serializers.ReadOnlyField(source='category.name_en')

    class Meta:
        model = GroceryItem
        fields = [
            'id',
            'category',
            'category_name',
            'category_name_en',
            'name',
            'name_en',
            'default_unit',
            'is_active',
            'order',
        ]


class GroceryCategorySerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = GroceryCategory
        fields = ['id', 'name', 'name_en', 'order', 'is_active', 'items']

    def get_items(self, obj):
        # Only return active items for regular serialization unless specified in context
        items = obj.items.filter(is_active=True)
        return GroceryItemSerializer(items, many=True).data
