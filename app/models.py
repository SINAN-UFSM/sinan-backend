from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

# --- MASTER REGISTRY (Source of Truth) ---

class Unit(models.Model):
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The email field is required.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        unit_admin, _ = Unit.objects.get_or_create(
            name="Central Administration Unit",
            city="Central City",
            state="CC"
        )
        extra_fields.setdefault('unit', unit_admin)

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None 
    
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=100)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role']

    objects = UserManager()

    def __str__(self):
        return self.email
    

class Patient(models.Model):
    # Immutable and reference data
    document = models.CharField(max_length=14, unique=True)
    birth_date = models.DateField()
    birth_city = models.CharField(max_length=100)
    sus_card = models.CharField(max_length=20)
    race_color = models.CharField(max_length=50)

    # Mutable data (can be updated in the main registry)
    name = models.CharField(max_length=255)
    gender = models.CharField(max_length=50)
    education_level = models.CharField(max_length=100)
    current_address = models.TextField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.document})"


class Notification(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=50)  # e.g., "draft", "published"
    notification_type_slug = models.CharField(max_length=100)
    notification_date = models.DateField()
    occurrence_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class BaseNotification(models.Model):
    """
    This class stores data captured AT THE TIME of the notification.
    Even immutable fields are copied here to 'freeze' the historical record.
    """
    notification = models.OneToOneField(Notification, primary_key=True, on_delete=models.CASCADE)

    # Snapshot of Immutable Data
    document_snapshot = models.CharField(max_length=14)
    birth_date_snapshot = models.DateField()
    birth_city_snapshot = models.CharField(max_length=100)
    sus_card_snapshot = models.CharField(max_length=20)
    race_color_snapshot = models.CharField(max_length=50)

    # Snapshot of Mutable Data
    name_snapshot = models.CharField(max_length=255)
    gender_snapshot = models.CharField(max_length=50)
    education_level_snapshot = models.CharField(max_length=100)
    address_snapshot = models.TextField()
    phone_snapshot = models.CharField(max_length=20, blank=True, null=True)

    class Meta:
        abstract = True


class AidsNotification(BaseNotification):
    vertical_transmission = models.CharField(max_length=100)
    sexual_exposure = models.CharField(max_length=100)
    injecting_drug_use = models.CharField(max_length=100)
    screening_test_result = models.CharField(max_length=100)
    health_outcome = models.CharField(max_length=100)
    treatment_provided = models.TextField()


class BotulismNotification(BaseNotification):
    first_care_date = models.DateField()
    is_hospitalized = models.CharField(max_length=50)
    has_fever = models.CharField(max_length=50)
    has_blurred_vision = models.CharField(max_length=50)
    has_ptosis = models.CharField(max_length=50)
    food_transmission_source = models.CharField(max_length=100)
    has_antibotulinum_serum_treatment = models.CharField(max_length=50)
    final_classification = models.CharField(max_length=100)


class EpizooticNotification(BaseNotification):
    epizootic_onset_date = models.DateField()
    information_source = models.CharField(max_length=255)
    occurrence_state = models.CharField(max_length=2)
    zone_type = models.CharField(max_length=50)
    animal_type = models.CharField(max_length=50)
    dead_animals_count = models.IntegerField()
    primary_suspicion = models.CharField(max_length=100)
    lab_result = models.CharField(max_length=100)


class SchistosomiasisNotification(BaseNotification):
    stool_examination_date = models.DateField()
    quantitative_analysis_status = models.CharField(max_length=100)
    treatment_status = models.CharField(max_length=100)
    clinical_form_type = models.CharField(max_length=100)
    case_evolution_type = models.CharField(max_length=100)


class YellowFeverNotification(BaseNotification):
    is_vaccinated_yellow_fever = models.CharField(max_length=50)
    has_hemorrhagic_syndrome = models.CharField(max_length=50)
    has_renal_dysfunction = models.CharField(max_length=50)
    tgo_ast_level = models.CharField(max_length=100)
    final_classification = models.CharField(max_length=100)


class DengueChikungunyaNotification(BaseNotification):
    has_fever = models.CharField(max_length=50)
    has_severe_arthralgia = models.CharField(max_length=50)
    chik_s1_result = models.CharField(max_length=50)
    ns1_result = models.CharField(max_length=50)
    classification_type = models.CharField(max_length=100)
    has_shock = models.CharField(max_length=50)


class VenomousAnimalNotification(BaseNotification):
    accident_type = models.CharField(max_length=100)
    accident_location = models.CharField(max_length=100)
    administered_antivenom = models.CharField(max_length=50)
    antivenom_vials_count = models.IntegerField()
    case_classification = models.CharField(max_length=100)


class RabiesProphylaxisNotification(BaseNotification):
    exposure_type = models.CharField(max_length=100)
    animal_type = models.CharField(max_length=100)
    animal_observation_status = models.CharField(max_length=100)
    post_exposure_prophylaxis_type = models.CharField(max_length=100)


class CholeraNotification(BaseNotification):
    dehydration_level = models.CharField(max_length=100)
    is_hospitalized = models.CharField(max_length=50)
    stool_culture_result = models.CharField(max_length=100)
    water_source = models.CharField(max_length=100)


class ChikungunyaNotification(BaseNotification):
    has_fever = models.CharField(max_length=50)
    has_joint_pain = models.CharField(max_length=50)
    has_skin_rash = models.CharField(max_length=50)
    lab_test_result = models.CharField(max_length=100)
    is_hospitalized = models.CharField(max_length=50)


class WhoopingCoughNotification(BaseNotification):
    cough_duration_weeks = models.IntegerField()
    vaccination_status = models.CharField(max_length=100)
    has_whooping_sound = models.CharField(max_length=50)
    has_apnea = models.CharField(max_length=50)
    lab_confirmation_status = models.CharField(max_length=100)