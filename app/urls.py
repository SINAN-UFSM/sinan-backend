from django.urls import path, include
from rest_framework import routers

from .views import *

router = routers.DefaultRouter(trailing_slash=False)

# --- CORE ROUTES ---

router.register(r'units', UnitViewSet)
router.register(r'users', UserViewSet)
router.register(r'patients', PatientViewSet)


# --- EPIDEMIOLOGICAL NOTIFICATION ROUTES ---

router.register(r'notifications', NotificationViewSet)
router.register(r'aids-notifications', AidsNotificationViewSet)
router.register(r'botulism-notifications', BotulismNotificationViewSet)
router.register(r'epizootic-notifications', EpizooticNotificationViewSet)
router.register(r'schistosomiasis-notifications', SchistosomiasisNotificationViewSet)
router.register(r'yellow-fever-notifications', YellowFeverNotificationViewSet)
router.register(r'dengue-chikungunya-notifications', DengueChikungunyaNotificationViewSet)
router.register(r'venomous-animal-notifications', VenomousAnimalNotificationViewSet)
router.register(r'rabies-prophylaxis-notifications', RabiesProphylaxisNotificationViewSet)
router.register(r'cholera-notifications', CholeraNotificationViewSet)
router.register(r'chikungunya-notifications', ChikungunyaNotificationViewSet)
router.register(r'whooping-cough-notifications', WhoopingCoughNotificationViewSet)


# --- URL PATTERNS ---

urlpatterns = [
    path('api/v1/auth/login', LoginView.as_view(), name='login'),
    path('api/v1/auth/logout', LogoutView.as_view(), name='logout'),

    path('health/', healthcheck, name='healthcheck'),
    path('api/v1/', include(router.urls)),
]