from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import User, CateringProfile
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    ChangePasswordSerializer,
    CateringProfileSerializer,
)
from .permissions import IsAdminUser


def get_tokens_for_user(user):
    """Generate JWT access and refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    # Add custom claims to the token
    refresh['email'] = user.email
    refresh['role'] = user.role
    refresh['full_name'] = user.full_name

    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class RegisterView(generics.CreateAPIView):
    """Register a new user and return tokens and profile data."""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user, context={'request': request}).data

        return Response(
            {
                'message': 'Registration successful.',
                'tokens': tokens,
                'user': user_data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """Authenticate user with email and password, returning tokens and profile."""
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user, context={'request': request}).data

        return Response(
            {
                'message': 'Login successful.',
                'tokens': tokens,
                'user': user_data,
            },
            status=status.HTTP_200_OK,
        )


class MeView(generics.RetrieveUpdateAPIView):
    """Retrieve or update profile of current authenticated user."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        user_serializer = self.get_serializer(user, data=request.data, partial=True)
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()

        # If catering profile fields provided, update catering profile
        if user.role == 'catering':
            profile, _ = CateringProfile.objects.get_or_create(user=user)
            catering_data = request.data.get('catering_profile') or request.data
            profile_serializer = CateringProfileSerializer(profile, data=catering_data, partial=True)
            if profile_serializer.is_valid():
                profile_serializer.save()

        return Response(
            UserSerializer(user, context={'request': request}).data,
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(generics.GenericAPIView):
    """Change password for the current authenticated user."""
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {'message': 'Password updated successfully.'},
            status=status.HTTP_200_OK,
        )


class AdminUserListView(generics.ListCreateAPIView):
    """Admin-only view to list and create users."""
    queryset = User.objects.all().select_related('catering_profile', 'store')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active', 'is_staff']
    search_fields = ['email', 'first_name', 'last_name']
    ordering_fields = ['created_at', 'email', 'first_name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserRegistrationSerializer
        return UserSerializer


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin-only view to retrieve, update, or deactivate/delete a user."""
    queryset = User.objects.all().select_related('catering_profile', 'store')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'
