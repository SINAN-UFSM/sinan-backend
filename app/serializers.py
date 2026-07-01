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
    patient_id = serializers.IntegerField(source='patient_id')
    unit_id = serializers.IntegerField(source='unit_id')
    user_id = serializers.IntegerField(
        source='user_id',
        read_only=True,
        help_text='Read-only field set by the authenticated user.',
    )

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
        ]
        read_only_fields = ['id', 'user_id', 'created_at']


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