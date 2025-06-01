# services/serializers.py
from rest_framework import serializers
from .models import *
from accounts.models import User 
class ServicesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Services
        fields = '__all__'

class RequirmentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requirments
        fields = '__all__'

#---------------------------------------------------------------------------------------------------------------------------
class ServiceNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Services
        fields = ['id', 'name', 'description', 'image']

class ContractorServicesListSerializer(serializers.ModelSerializer):
    service = ServiceNestedSerializer()

    class Meta:
        model = ContractorServices
        fields = ['service', 'added_on']
#---------------------------------------------------------------------------------------------------------------------------
# serializers.py


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'  

class ContractorFullSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Contractor
        fields = '__all__'  # This includes all contractor fields + nested user data

class ServicesContractorSerializer(serializers.ModelSerializer):
    contractors = serializers.SerializerMethodField()

    class Meta:
        model = Services
        fields = ['id', 'name', 'description', 'image', 'contractors']

    def get_contractors(self, service):
        contractor_links = ContractorServices.objects.filter(service=service)
        contractors = [link.contractor for link in contractor_links]
        return ContractorFullSerializer(contractors, many=True).data
#---------------------------------------------------------------------------------------------------------------------------
class ContractorServicesCreateSerializer(serializers.ModelSerializer):
    service_id = serializers.PrimaryKeyRelatedField(queryset=Services.objects.all(), source='service')

    class Meta:
        model = ContractorServices
        fields = ['service_id']

    def create(self, validated_data):
        user = self.context['request'].user
        contractor = Contractor.objects.get(user=user)
        return ContractorServices.objects.create(contractor=contractor, **validated_data)
