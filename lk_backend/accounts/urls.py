from django.urls import path
from .views import (
    CustomerRegistrationView,
    ContractorRegistrationView,
    SupervisorRegistrationView,
    CustomTokenObtainPairView,
    UserProfileView
)

urlpatterns = [
    path('register/customer/', CustomerRegistrationView.as_view(), name='customer-register'),
    path('register/contractor/', ContractorRegistrationView.as_view(), name='contractor-register'),
    path('register/supervisor/', SupervisorRegistrationView.as_view(), name='supervisor-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]
