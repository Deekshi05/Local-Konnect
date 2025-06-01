from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


# Core user creation manager
class UserManager(BaseUserManager):

    # Create regular user
    def create_user(self, email, password=None, role='CUSTOMER', first_name='', last_name='', phone_number=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)
        user = self.model(
            email=email,
            role=role,
            phone_number=phone_number,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)  
        return user

    # Create superuser
    def create_superuser(self, email, password=None, first_name='', last_name='', **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(
            email,
            password,
            role='ADMIN',
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
