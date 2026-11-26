from rest_framework import serializers
from .models import GroceryStore


class StoreOwnerSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(read_only=True)
    last_name = serializers.CharField(read_only=True)
    full_name = serializers.CharField(read_only=True)


class GroceryStoreSerializer(serializers.ModelSerializer):
    owner_details = StoreOwnerSerializer(source='owner', read_only=True)
    owner_email = serializers.ReadOnlyField(source='owner.email')
    owner_name = serializers.ReadOnlyField(source='owner.full_name')

    class Meta:
        model = GroceryStore
        fields = [
            'id',
            'owner',
            'owner_details',
            'owner_name',
            'owner_email',
            'store_name',
            'phone',
            'address',
            'is_active',
            'created_at',
        ]
        read_only_fields = ['id', 'owner', 'created_at']
