from django.contrib.auth.hashers import make_password
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.utils.timezone import now
from datetime import timedelta
from django.conf import settings

from django.contrib.auth.models import AbstractUser, AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)  # Hashes the password properly
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if password is None:
            raise ValueError('Superusers must have a password.')

        return self.create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class Customuser(AbstractBaseUser, PermissionsMixin):
    full_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, max_length=100, null=False)
    contact_number = models.CharField(max_length=15)
    profile_photo = models.BinaryField(null=True, blank=True)
    address = models.CharField(max_length=1000)
    created_at = models.DateTimeField(auto_now_add=True)
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('deleted', 'Deleted')
    ]
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default='active')
    deleted_at = models.DateTimeField(null=True, blank=True)

    is_admin = models.BooleanField(default=False)
    is_consultant = models.BooleanField(default=False)
    is_customer = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    groups = models.ManyToManyField(
        "auth.Group",
        related_name="customuser_groups",
        blank=True
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        related_name="customuser_permissions",
        blank=True
    )


class Admin(models.Model):
    user = models.OneToOneField(Customuser, on_delete=models.CASCADE)


class Consultant(models.Model):
    user = models.OneToOneField(Customuser, on_delete=models.CASCADE)
    IS_APPROVED_CHOICES = {
        0: 'Rejected',
        1: 'Pending',
        2: 'Accepted'
    }
    is_approved = models.SmallIntegerField(
        choices=IS_APPROVED_CHOICES.items(), default=1)


class Customer(models.Model):
    IS_APPROVED_CHOICES = {
        0: 'Rejected',
        1: 'Pending',
        2: 'Accepted'
    }
    user = models.OneToOneField(Customuser, on_delete=models.CASCADE)
    consultant = models.ForeignKey(
        Consultant, on_delete=models.CASCADE, null=True)
    is_approved = models.SmallIntegerField(
        choices=IS_APPROVED_CHOICES.items(), default=1)


class OTP(models.Model):
    # user = models.ForeignKey(Customuser, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        # OTP expiration time is 5 minutes
        return now() > self.created_at + timedelta(minutes=5)
