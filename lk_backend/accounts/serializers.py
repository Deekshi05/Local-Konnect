# serializers.py
from rest_framework import serializers
from .models import User, Customer, Contractor, Supervisor
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate

# Base User Serializer
class UserBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'role']

# ---------------------------- REGISTRATION SERIALIZERS ----------------------------

class CustomerRegistrationSerializer(serializers.ModelSerializer):
    city = serializers.CharField(write_only=True, required=False)
    state = serializers.CharField(write_only=True, required=False)
    customer_image = serializers.ImageField(write_only=True, required=False)

    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number', 'city', 'state', 'customer_image']

    def create(self, validated_data):
        city = validated_data.pop('city', '')
        state = validated_data.pop('state', '')
        customer_image = validated_data.pop('customer_image', None)

        user = User.objects.create_user(role=User.Roles.CUSTOMER, **validated_data)
        Customer.objects.create(user=user, city=city, state=state, customer_image=customer_image)
        return user


class ContractorRegistrationSerializer(serializers.ModelSerializer):
    city = serializers.CharField(write_only=True, required=False)
    state = serializers.CharField(write_only=True, required=False)
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, required=False)
    experience = serializers.IntegerField(required=False)
    address = serializers.CharField(required=False)
    contractor_image = serializers.ImageField(write_only=True, required=False)

    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 'phone_number',
                  'city', 'state', 'contractor_image', 'rating', 'experience', 'address']

    def create(self, validated_data):
        city = validated_data.pop('city', '')
        state = validated_data.pop('state', '')
        rating = validated_data.pop('rating', 0)
        experience = validated_data.pop('experience', 0)
        address = validated_data.pop('address', '')
        contractor_image = validated_data.pop('contractor_image', None)

        user = User.objects.create_user(role=User.Roles.CONTRACTOR, **validated_data)
        Contractor.objects.create(user=user, city=city, state=state, contractor_image=contractor_image,
                                  rating=rating, experience=experience, address=address)
        return user


class SupervisorRegistrationSerializer(serializers.ModelSerializer):
    city = serializers.CharField(write_only=True, required=False)
    state = serializers.CharField(write_only=True, required=False)
    rating = serializers.DecimalField(max_digits=3, decimal_places=2, required=False)
    address = serializers.CharField(required=False)
    supervisor_image = serializers.ImageField(write_only=True, required=False)

    first_name = serializers.CharField()
    last_name = serializers.CharField()
    phone_number = serializers.CharField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'password', 'first_name', 'last_name', 'phone_number',
            'city', 'state', 'supervisor_image', 'rating', 'address'
        ]

    def create(self, validated_data):
        city = validated_data.pop('city', '')
        state = validated_data.pop('state', '')
        rating = validated_data.pop('rating', 0)
        address = validated_data.pop('address', '')
        supervisor_image = validated_data.pop('supervisor_image', None)

        user = User.objects.create_user(role=User.Roles.SUPERVISOR, **validated_data)
        Supervisor.objects.create(user=user, city=city, state=state, supervisor_image=supervisor_image,
                                  rating=rating, address=address)
        return user


# ---------------------------- LOGIN SERIALIZER ----------------------------
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(request=self.context.get("request"), email=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid email or password")
        else:
            raise serializers.ValidationError("Email and password are required")

        data = super().validate(attrs)
        data["email"] = user.email
        return data


# ---------------------------- PROFILE SERIALIZERS ----------------------------
class CustomerSerializer(serializers.ModelSerializer):
    user = UserBaseSerializer()

    class Meta:
        model = Customer
        fields = ['user', 'city', 'state', 'customer_image']

class ContractorSerializer(serializers.ModelSerializer):
    user = UserBaseSerializer()

    class Meta:
        model = Contractor
        fields = ['user', 'city', 'state', 'contractor_image', 'rating', 'experience', 'address']

class SupervisorSerializer(serializers.ModelSerializer):
    user = UserBaseSerializer()

    class Meta:
        model = Supervisor
        fields = ['user', 'city', 'state', 'supervisor_image', 'rating', 'address']


class UserProfileSerializer(serializers.ModelSerializer):
    profile_data = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'profile_data']

    def get_profile_data(self, obj):
        if obj.role == User.Roles.CUSTOMER and hasattr(obj, 'customer'):
            return CustomerSerializer(obj.customer).data
        elif obj.role == User.Roles.CONTRACTOR and hasattr(obj, 'contractor'):
            return ContractorSerializer(obj.contractor).data
        elif obj.role == User.Roles.SUPERVISOR and hasattr(obj, 'supervisor'):
            return SupervisorSerializer(obj.supervisor).data
        return None
