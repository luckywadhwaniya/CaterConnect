from rest_framework import serializers
from .models import CateringEvent


class CateringEventSerializer(serializers.ModelSerializer):
    catering_user_name = serializers.ReadOnlyField(source='catering_user.full_name')
    has_order = serializers.SerializerMethodField()
    order_id = serializers.SerializerMethodField()

    class Meta:
        model = CateringEvent
        fields = [
            'id',
            'catering_user',
            'catering_user_name',
            'event_name',
            'event_date',
            'delivery_date',
            'delivery_time',
            'event_location',
            'num_guests',
            'additional_instructions',
            'has_order',
            'order_id',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'catering_user', 'created_at', 'updated_at']

    def get_has_order(self, obj):
        return hasattr(obj, 'order') and obj.order is not None

    def get_order_id(self, obj):
        if hasattr(obj, 'order') and obj.order:
            return str(obj.order.id)
        return None

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['catering_user'] = user
        return super().create(validated_data)
