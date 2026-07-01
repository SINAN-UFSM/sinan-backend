'''
Serialization Module (API Integration)
    * Transforms Django models into JSON format and vice versa.
    * Facilitates seamless communication between the database and the front-end.
    * Defines serializers for all core entities and disease notification types.
'''

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import *

# --- AUTHENTICATION SERIALIZERS ---

class LoginSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer inheriting from SimpleJWT.
    """
    pass


# --- MAIN CORE SERIALIZERS ---

class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'

        extra_kwargs = {
            'is_active': {'read_only': True}
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Exclude password for security when returning user lists
        extra_kwargs = {'password': {'write_only': True}}
        fields = ['id', 'email', 'name', 'role', 'unit', 'password']


class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

        extra_kwargs = {
            'is_active': {'read_only': True}
        }

# --- EPIDEMIOLOGICAL NOTIFICATION SERIALIZERS ---

class NotificationSerializer(serializers.ModelSerializer):
    patient_id = serializers.IntegerField()
    unit_id = serializers.IntegerField()
    user_id = serializers.IntegerField(
        read_only=True,
        help_text='Read-only field set by the authenticated user.',
    )
    specific_fields = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'patient_id',
            'unit_id',
            'user_id',
            'status',
            'notification_type_slug',
            'notification_date',
            'occurrence_date',
            'notes',
            'created_at',
            'specific_fields',
        ]
        read_only_fields = ['id', 'user_id', 'created_at', 'specific_fields']

    def get_specific_fields(self, obj):
        """Return specific_fields from related polymorphic notification model."""
        from .notifications.polymorphic import POLYMORPHIC_REGISTRY
        
        polymorphic_config = POLYMORPHIC_REGISTRY.get(obj.notification_type_slug)
        if not polymorphic_config:
            return {}
        
        specific_model = polymorphic_config['specific_model']
        try:
            specific_instance = specific_model.objects.get(notification=obj)
            field_aliases = polymorphic_config.get('field_aliases', {})
            return {
                model_field: getattr(specific_instance, model_field, None)
                for model_field in field_aliases.keys()
            }
        except specific_model.DoesNotExist:
            return {}


class AidsNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AidsNotification
        fields = '__all__'


class BotulismNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotulismNotification
        fields = '__all__'


class EpizooticNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EpizooticNotification
        fields = '__all__'


class SchistosomiasisNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchistosomiasisNotification
        fields = '__all__'


class YellowFeverNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = YellowFeverNotification
        fields = '__all__'


class DengueChikungunyaNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DengueChikungunyaNotification
        fields = '__all__'


class VenomousAnimalNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenomousAnimalNotification
        fields = '__all__'


class RabiesProphylaxisNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RabiesProphylaxisNotification
        fields = '__all__'


class CholeraNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CholeraNotification
        fields = '__all__'


class ChikungunyaNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChikungunyaNotification
        fields = '__all__'


class WhoopingCoughNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhoopingCoughNotification
        fields = '__all__'