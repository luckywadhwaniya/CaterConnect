from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, CateringProfile


class CateringProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CateringProfile
        fields = ['id', 'business_name', 'phone', 'address', 'gst_number', 'created_at']


class StoreProfileSummarySerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True)
    store_name = serializers.CharField(read_only=True)
    phone = serializers.CharField(read_only=True)
    address = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    catering_profile = CateringProfileSerializer(read_only=True)
    store = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'role',
            'is_active',
            'is_staff',
            'catering_profile',
            'store',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'is_staff', 'created_at', 'updated_at']

    def get_store(self, obj):
        if hasattr(obj, 'store') and obj.store:
            return StoreProfileSummarySerializer(obj.store).data
        return None


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=False)
    
    # Optional profile fields during registration
    business_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    store_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)
    gst_number = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'password',
            'password_confirm',
            'first_name',
            'last_name',
            'role',
            'business_name',
            'store_name',
            'phone',
            'address',
            'gst_number',
        ]

    def validate_email(self, value):
        norm_email = value.lower().strip()
        if User.objects.filter(email__iexact=norm_email).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return norm_email

    def validate(self, attrs):
        pw = attrs.get('password')
        pw_confirm = attrs.get('password_confirm')
        if pw_confirm and pw != pw_confirm:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        # Pop custom profile fields
        validated_data.pop('password_confirm', None)
        business_name = validated_data.pop('business_name', '')
        store_name = validated_data.pop('store_name', '')
        phone = validated_data.pop('phone', '')
        address = validated_data.pop('address', '')
        gst_number = validated_data.pop('gst_number', '')

        password = validated_data.pop('password')
        role = validated_data.get('role', 'catering')
        
        # Set is_staff if role is admin
        if role == 'admin':
            validated_data['is_staff'] = True

        user = User.objects.create_user(password=password, **validated_data)

        # Create role-specific profiles
        if role == 'catering':
            CateringProfile.objects.create(
                user=user,
                business_name=business_name or f"{user.full_name}'s Catering",
                phone=phone,
                address=address,
                gst_number=gst_number,
            )
        elif role == 'store_owner':
            from stores.models import GroceryStore
            GroceryStore.objects.create(
                owner=user,
                store_name=store_name or business_name or f"{user.full_name}'s Grocery Store",
                phone=phone,
                address=address,
                is_active=True,
            )

        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'), email=email, password=password)
            if not user:
                # Fallback check if user exists to provide helpful error
                try:
                    existing_user = User.objects.get(email__iexact=email)
                    if not existing_user.check_password(password):
                        raise serializers.ValidationError("Invalid email or password.")
                    if not existing_user.is_active:
                        raise serializers.ValidationError("This account has been disabled.")
                    user = existing_user
                except User.DoesNotExist:
                    raise serializers.ValidationError("Invalid email or password.")

            if not user.is_active:
                raise serializers.ValidationError("This account has been disabled.")
        else:
            raise serializers.ValidationError("Both email and password are required.")

        attrs['user'] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct.")
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
