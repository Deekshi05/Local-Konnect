from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from .managers import UserManager  

# User model (blueprint of the user)
class User(AbstractBaseUser, PermissionsMixin):

    # Enum for fixed role choices
    class Roles(models.TextChoices):
        CUSTOMER = 'CUSTOMER'
        CONTRACTOR = 'CONTRACTOR'
        SUPERVISOR = 'SUPERVISOR'  
        ADMIN = 'ADMIN'

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)  # Fixed to allow NULL values
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.CUSTOMER)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return self.email  # Better for debugging/admin

# Extended model for Customer
class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    city = models.CharField(max_length=40)
    state = models.CharField(max_length=40)
    address = models.TextField(blank=True, null=True)  # Added address field
    customer_image = models.ImageField(upload_to="customer_images/", blank=True, null=True)

# Extended model for Contractor
class Contractor(models.Model):  # Fixed typo from 'Modle' to 'Model'
    # Contractor Type Choices for Dual-Track System
    class ContractorType(models.TextChoices):
        VERIFIED = 'VERIFIED', 'Verified'  # Formally vetted contractors
        COMMUNITY = 'COMMUNITY', 'Community'  # Trust network contractors
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    city = models.CharField(max_length=40)
    state = models.CharField(max_length=40)
    contractor_image = models.ImageField(upload_to="contractor_images/", blank=True, null=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)  
    experience = models.IntegerField(default=0)
    address = models.CharField(max_length=255)  # Defined max_length
    
    # NEW FIELDS FOR TRUST NETWORK
    type = models.CharField(max_length=20, choices=ContractorType.choices, default=ContractorType.VERIFIED)
    trust_score = models.FloatField(default=0.0, help_text="Calculated trust score based on recommendations")
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.type})"

# Extended model for Supervisor
class Supervisor(models.Model):  # Fixed typo from 'Modle' to 'Model'
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    city = models.CharField(max_length=40)
    state = models.CharField(max_length=40)
    supervisor_image = models.ImageField(upload_to="supervisor_images/", blank=True, null=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    address = models.CharField(max_length=255)
    experience = models.IntegerField(default=0)
    qualification = models.CharField(max_length=255, blank=True)
    total_consultations = models.PositiveIntegerField(default=0)
    verified = models.BooleanField(default=False)  # Admin verification status
    bio = models.TextField(blank=True)  # Professional bio/description


