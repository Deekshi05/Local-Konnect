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
    phone_number = models.CharField(max_length=15, blank=True)  # Fixed incorrect usage
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.CUSTOMER)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)

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
    customer_image = models.ImageField(upload_to="customer_images/", blank=True, null=True)

# Extended model for Contractor
class Contractor(models.Model):  # Fixed typo from 'Modle' to 'Model'
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    city = models.CharField(max_length=40)
    state = models.CharField(max_length=40)
    contractor_image = models.ImageField(upload_to="contractor_images/", blank=True, null=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)  
    experience = models.IntegerField(default=0)
    address = models.CharField(max_length=255)  # Defined max_length

# Extended model for Supervisor
class Supervisor(models.Model):  # Fixed typo from 'Modle' to 'Model'
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    city = models.CharField(max_length=40)
    state = models.CharField(max_length=40)
    supervisor_image = models.ImageField(upload_to="supervisor_images/", blank=True, null=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    address = models.CharField(max_length=255)


