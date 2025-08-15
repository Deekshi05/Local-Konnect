from django.urls import path
from .views import (
    CustomerRegistrationView,
    ContractorRegistrationView,
    SupervisorRegistrationView,
    CustomTokenObtainPairView,
    UserProfileView,
    CustomerListView,
    ContractorListView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/customer/', CustomerRegistrationView.as_view(), name='customer-register'),
    path('register/contractor/', ContractorRegistrationView.as_view(), name='contractor-register'),
    path('register/supervisor/', SupervisorRegistrationView.as_view(), name='supervisor-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('customers/', CustomerListView.as_view(), name='customer-list'),
    path('contractors/', ContractorListView.as_view(), name='contractor-list'),
]
