from .models import User, Customer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Customuser, Admin, Consultant, Customer
from django.contrib.auth.hashers import make_password
from django.db import transaction

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password_confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = get_user_model()  # This will use Customuser
        fields = ['full_name', 'email', 'password',
                  'password_confirmation', 'contact_number', 'address', 'is_admin', 'is_consultant', 'is_customer']

    def validate(self, data):
        # Check if the passwords match
        if data['password'] != data['password_confirmation']:
            raise serializers.ValidationError("Passwords must match")
        return data

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("password_confirmation")
        validated_data["password"] = make_password(password)

        try:
            with transaction.atomic():  # Ensures all or nothing behavior
                user = get_user_model().objects.create(**validated_data)

                if validated_data.get('is_admin', False):
                    user.is_admin = True
                    Admin.objects.create(user=user)

                if validated_data.get('is_consultant', False):
                    user.is_consultant = True
                    Consultant.objects.create(user=user)

                if validated_data.get('is_customer', False):
                    user.is_customer = True
                    Customer.objects.create(user=user)

                user.save()

        except Exception as e:
            # Rollback the transaction if an error occurs
            if user:
                user.delete()
            raise serializers.ValidationError(str(e))

        return user


class OTPLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "User with this email does not exist")
        return value


class ProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    consultant_name = serializers.SerializerMethodField()  # New field

    class Meta:
        model = User
        fields = ('id', 'full_name', 'last_login', 'email', 'contact_number',
                  'profile_photo', 'address', 'created_at', 'status',
                  'deleted_at', 'role', 'consultant_name')  # Added consultant_name

    def get_role(self, obj):
        if hasattr(obj, 'is_admin') and obj.is_admin:
            return "Admin"
        elif hasattr(obj, 'is_consultant') and obj.is_consultant:
            return "Consultant"
        elif hasattr(obj, 'is_customer') and obj.is_customer:
            return "Customer"
        return None

    def get_consultant_name(self, obj):
        if obj.is_customer:
            customer = Customer.objects.filter(
                user=obj, is_approved=True).first()
            print("Customer Entry:", customer)  # Debugging Step 1

            if customer:
                print("Customer ID:", customer.id)
                print("Consultant ID:", customer.consultant_id)

                if customer.consultant_id:
                    consultant_user = Customuser.objects.filter(
                        id=customer.consultant_id).first()
                    # Debugging Step 2
                    print("Consultant User:", consultant_user)

                    if consultant_user:
                        print("Consultant Name:", consultant_user.full_name)
                        return consultant_user.full_name

        return None

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get('role') != 'Customer':
            # Remove consultant_name for non-customers
            data.pop('consultant_name', None)
        return data
