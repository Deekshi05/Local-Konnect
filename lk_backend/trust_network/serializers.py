from rest_framework import serializers
from django.db.models import Q
from .models import TrustConnection, QuickJob, QuickJobInterest, TrustScoreLog
from accounts.serializers import UserBaseSerializer, ContractorSerializer
from accounts.models import Customer, Contractor
from needs.serializers import ServicesSerializer
from needs.models import ContractorServices
from works.models import Tenders, VirtualAppointment, TenderAssignment
from appointments.models import Appointment


class TrustConnectionSerializer(serializers.ModelSerializer):
    recommender_details = UserBaseSerializer(source='recommender', read_only=True)
    contractor_details = ContractorSerializer(source='contractor', read_only=True)
    service_details = ServicesSerializer(source='service_context', read_only=True)
    
    class Meta:
        model = TrustConnection
        fields = [
            'id', 'recommender', 'contractor', 'comment', 'trust_level',
            'service_context', 'created_at', 'updated_at',
            'recommender_details', 'contractor_details', 'service_details'
        ]
        read_only_fields = ('created_at', 'updated_at', 'recommender')
    
    def validate(self, data):
        """Custom validation for trust connections"""
        contractor = data.get('contractor')
        service_context = data.get('service_context')
        request = self.context.get('request')
        
        if not request or not request.user:
            raise serializers.ValidationError("Authentication required")
        
        recommender = request.user
        
        # 1. Prevent Self-Recommendation
        if hasattr(recommender, 'contractor') and recommender.contractor == contractor:
            raise serializers.ValidationError("You cannot recommend yourself")
        
        # 2. Service Alignment: Only allow recommendations for services the contractor provides
        if service_context:
            contractor_provides_service = ContractorServices.objects.filter(
                contractor=contractor,
                service=service_context
            ).exists()
            
            if not contractor_provides_service:
                raise serializers.ValidationError(
                    f"This contractor does not provide {service_context.name} services. "
                    f"Please select a service they actually offer."
                )
        
        # 3. Geographic Restrictions: Only recommend contractors in the same city/region
        try:
            recommender_customer = Customer.objects.get(user=recommender)
            if (recommender_customer.city.lower() != contractor.city.lower() or 
                recommender_customer.state.lower() != contractor.state.lower()):
                raise serializers.ValidationError(
                    f"You can only recommend contractors from your location "
                    f"({recommender_customer.city}, {recommender_customer.state}). "
                    f"This contractor is from {contractor.city}, {contractor.state}."
                )
        except Customer.DoesNotExist:
            # If the recommender is not a customer, check if they have location info
            # This handles cases where contractors or supervisors might recommend
            pass
        
        # 4. Experience-Based: Require some prior interaction before allowing recommendations
        # Temporarily disabled for testing - can be enabled later
        # has_prior_interaction = self._check_prior_interaction(recommender, contractor)
        # if not has_prior_interaction:
        #     raise serializers.ValidationError(
        #         "You can only recommend contractors you have previously worked with. "
        #         "Prior interaction required through completed tenders, appointments, or quick jobs."
        #     )
        
        return data
    
    def _check_prior_interaction(self, recommender, contractor):
        """Check if the recommender has had prior interaction with the contractor"""
        
        # Check completed tenders
        completed_tenders = Tenders.objects.filter(
            customer__user=recommender,
            selected_contractor=contractor,
            status='completed'
        ).exists()
        
        if completed_tenders:
            return True
        
        # Check completed quick jobs where this contractor was assigned
        completed_quick_jobs = QuickJob.objects.filter(
            customer=recommender,
            assigned_contractor=contractor,
            status='COMPLETED'
        ).exists()
        
        if completed_quick_jobs:
            return True
        
        # Check completed virtual appointments that led to work with this contractor
        try:
            # Check if any tender creation assistance led to work with this contractor
            related_work = Tenders.objects.filter(
                customer__user=recommender,
                selected_contractor=contractor,
                status__in=['completed', 'in_progress']
            ).exists()
            
            if related_work:
                return True
        except:
            # Handle any model issues gracefully
            pass
        
        # For now, if none of the above, allow recommendations
        # This can be made stricter in the future
        return False


class QuickJobInterestSerializer(serializers.ModelSerializer):
    contractor_details = ContractorSerializer(source='contractor', read_only=True)
    
    class Meta:
        model = QuickJobInterest
        fields = [
            'id', 'quick_job', 'contractor', 'message', 'proposed_price', 'created_at',
            'contractor_details'
        ]
        read_only_fields = ('created_at', 'contractor')
    
    def to_representation(self, instance):
        """Override to include contractor details in both fields for compatibility"""
        data = super().to_representation(instance)
        # Include contractor details in the contractor field as well
        if 'contractor_details' in data and data['contractor_details']:
            data['contractor'] = data['contractor_details']
        return data


class QuickJobSerializer(serializers.ModelSerializer):
    customer_details = UserBaseSerializer(source='customer', read_only=True)
    service_details = ServicesSerializer(source='service', read_only=True)
    assigned_contractor_details = ContractorSerializer(source='assigned_contractor', read_only=True)
    interests = QuickJobInterestSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuickJob
        fields = [
            'id', 'customer', 'service', 'title', 'description', 'location',
            'status', 'urgency', 'budget_suggestion', 'assigned_contractor',
            'assigned_at', 'completed_at', 'raw_query', 'parsed_intent',
            'created_at', 'updated_at',
            'customer_details', 'service_details', 'assigned_contractor_details',
            'interests'
        ]
        read_only_fields = (
            'created_at', 'updated_at', 'assigned_at', 'completed_at'
        )


class QuickJobCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating quick jobs"""
    
    class Meta:
        model = QuickJob
        fields = [
            'service', 'title', 'description', 'location', 'urgency',
            'budget_suggestion', 'raw_query'
        ]
    
    def validate_service(self, value):
        """Validate that the service exists"""
        if not value:
            raise serializers.ValidationError("Service selection is required")
        return value
    
    def validate_location(self, value):
        """Validate location field"""
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("Please provide a complete address with at least 5 characters")
        return value.strip()
    
    def validate_title(self, value):
        """Validate title field"""
        if not value or len(value.strip()) < 3:
            raise serializers.ValidationError("Job title must be at least 3 characters long")
        return value.strip()
    
    def validate_description(self, value):
        """Validate description field"""
        if not value or len(value.strip()) < 10:
            raise serializers.ValidationError("Job description must be at least 10 characters long")
        return value.strip()
    
    def create(self, validated_data):
        # Set customer from request user
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)


class TrustScoreLogSerializer(serializers.ModelSerializer):
    contractor_details = ContractorSerializer(source='contractor', read_only=True)
    
    class Meta:
        model = TrustScoreLog
        fields = [
            'id', 'contractor', 'old_score', 'new_score', 'reason',
            'calculation_details', 'created_at', 'contractor_details'
        ]
        read_only_fields = ('created_at',)


class TrustedContractorRecommendationSerializer(serializers.Serializer):
    """Serializer for trusted contractor recommendations"""
    contractor = ContractorSerializer(read_only=True)
    trust_score = serializers.FloatField(read_only=True)
    recommendation_count = serializers.IntegerField(read_only=True)
    direct_recommendations = serializers.IntegerField(read_only=True)
    indirect_recommendations = serializers.IntegerField(read_only=True)
    connection_path = serializers.ListField(
        child=serializers.CharField(),
        read_only=True
    )
