import uuid
from tokenize import TokenError
from django.db import transaction

from rest_framework import viewsets, status, permissions, filters
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from drf_spectacular.utils import extend_schema, OpenApiExample
from .models import *
from .serializers import *
from .notifications.polymorphic import (
    POLYMORPHIC_REGISTRY,
    build_snapshot_payload,
    build_specific_payload,
)

# --- PAGINATION CONFIG ---

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


# --- UTILITIES ---

@api_view(['GET'])
def healthcheck(request):
    """
    Simple endpoint to check if the API is online.
    """
    return Response({"status": "ok", "message": "The API is operating flawlessly!"})


# --- AUTHENTICATION VIEWS ---

class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        """
        User authentication endpoint.
        Returns JWT tokens (access and refresh) upon valid credentials.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data.get('access')

        return Response(
            {
                'access': token,
                'refresh': serializer.validated_data.get('refresh')
            },
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        User logout endpoint.
        Blacklists the provided refresh token.
        """
        try:
            refresh_token = request.data.get("refresh")
            
            if not refresh_token:
                return Response(
                    {
                        "type": "validation_error",
                        "detail": "The 'refresh' field is required.",
                        "code": "missing_field"
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(status=status.HTTP_204_NO_CONTENT)
        except TokenError as e:
            return Response(
                {
                    "type": "token_error",
                    "detail": f"Failed to invalidate token: {str(e)}",
                    "code": "token_error"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {
                    "type": "server_error",
                    "detail": f"Internal server error processing logout: {str(e)}",
                    "request_id": str(uuid.uuid4())
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# --- MAIN VIEWSETS ---

class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.filter(is_active=True)
    serializer_class = UnitSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']

    def destroy(self, request, *args, **kwargs):
        """
        Logical deletion for health units to preserve audit history.
        """
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.filter(is_active=True).order_by('-id')
    serializer_class = PatientSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'document']
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']

    def destroy(self, request, *args, **kwargs):
        """
        Logical deletion for patients to shield epidemiological disease tracking integrity.
        """
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

# --- EPIDEMIOLOGICAL NOTIFICATION VIEWSETS ---

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        notification_type = request.data.get('notification_type_slug')
        polymorphic_config = POLYMORPHIC_REGISTRY.get(notification_type)

        # Keep default behavior for non-polymorphic notification types.
        if not polymorphic_config:
            return super().create(request, *args, **kwargs)

        specific_fields = request.data.get('specific_fields')
        if not isinstance(specific_fields, dict):
            return Response(
                {
                    'type': 'validation_error',
                    'detail': "The 'specific_fields' field is required and must be an object for polymorphic notifications.",
                    'code': 'invalid_specific_fields',
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        normalized_slug = polymorphic_config['storage_slug']

        base_payload = {
            'patient_id': request.data.get('patient_id'),
            'unit_id': request.data.get('unit_id'),
            'status': request.data.get('status'),
            'notification_type_slug': normalized_slug,
            'notification_date': request.data.get('notification_date'),
            'occurrence_date': request.data.get('occurrence_date'),
            'notes': request.data.get('notes'),
        }

        serializer = self.get_serializer(data=base_payload)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            notification = serializer.save(user=request.user)
            patient = notification.patient
            specific_payload = build_specific_payload(specific_fields, polymorphic_config)
            snapshot_payload = build_snapshot_payload(patient)

            specific_notification = polymorphic_config['specific_model'].objects.create(
                notification=notification,
                **snapshot_payload,
                **specific_payload,
            )

        response_data = serializer.data
        response_data['specific_fields'] = {
            field_name: getattr(specific_notification, field_name)
            for field_name in polymorphic_config.get('field_aliases', {}).keys()
        }

        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)


class AidsNotificationViewSet(viewsets.ModelViewSet):
    queryset = AidsNotification.objects.all()
    serializer_class = AidsNotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]


class BotulismNotificationViewSet(viewsets.ModelViewSet):
    queryset = BotulismNotification.objects.all()
    serializer_class = BotulismNotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]


class EpizooticNotificationViewSet(viewsets.ModelViewSet):
    queryset = EpizooticNotification.objects.all()
    serializer_class = EpizooticNotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]


class SchistosomiasisNotificationViewSet(viewsets.ModelViewSet):
    queryset = SchistosomiasisNotification.objects.all()
    serializer_class = SchistosomiasisNotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]


class YellowFeverNotificationViewSet(viewsets.ModelViewSet):
    queryset = YellowFeverNotification.objects.all()
    serializer_class = YellowFeverNotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]


class DengueChikungunyaNotificationViewSet(viewsets.ModelViewSet):
    queryset = DengueChikungunyaNotification.objects.all()
    serializer_class = DengueChikungunyaNotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]


class VenomousAnimalNotificationViewSet(viewsets.ModelViewSet):
    queryset = VenomousAnimalNotification.objects.all()
    serializer_class = VenomousAnimalNotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]


class RabiesProphylaxisNotificationViewSet(viewsets.ModelViewSet):
    queryset = RabiesProphylaxisNotification.objects.all()
    serializer_class = RabiesProphylaxisNotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]


class CholeraNotificationViewSet(viewsets.ModelViewSet):
    queryset = CholeraNotification.objects.all()
    serializer_class = CholeraNotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]


class ChikungunyaNotificationViewSet(viewsets.ModelViewSet):
    queryset = ChikungunyaNotification.objects.all()
    serializer_class = ChikungunyaNotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]


class WhoopingCoughNotificationViewSet(viewsets.ModelViewSet):
    queryset = WhoopingCoughNotification.objects.all()
    serializer_class = WhoopingCoughNotificationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]