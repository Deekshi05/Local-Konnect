from rest_framework import serializers
from django.utils import timezone
import pytz
from accounts.models import Customer, Supervisor, Contractor
from needs.models import Services
from django.contrib.auth import get_user_model
from .models import (
    Tenders, TenderRequirement, TenderBids, TenderAttachment,
    TenderAuditLog, TenderVersion, TenderAssignment, TenderContractor,
    VirtualAppointment, PhysicalVisit, TenderCreationAssistance,
    SupervisorServices, TenderMilestone, TenderProgress, ContractorRating
)

User = get_user_model()

def get_user_full_name(user):
    """Helper function to get user's full name"""
    return f"{user.first_name} {user.last_name}".strip()

class TenderMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderMilestone
        fields = ['id', 'tender', 'title', 'description', 'due_date', 'completed_date', 'completion_notes', 'attachments', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'tender', 'created_at', 'updated_at']

class TenderProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderProgress
        fields = ['id', 'tender', 'percent_complete', 'last_activity', 'current_phase', 'next_milestone', 'notes']
        read_only_fields = ['id', 'tender', 'last_activity']

# If ProgressNote model exists, add its serializer
try:
    from .models import ProgressNote
    class ProgressNoteSerializer(serializers.ModelSerializer):
        class Meta:
            model = ProgressNote
            fields = '__all__'
except ImportError:
    pass
from rest_framework import serializers
from django.utils import timezone
from accounts.models import Customer, Supervisor, Contractor
from django.contrib.auth import get_user_model

User = get_user_model()

def get_user_full_name(user):
    """Helper function to get user's full name"""
    return f"{user.first_name} {user.last_name}".strip()

from .models import (
    Tenders, TenderRequirement, TenderBids, TenderAttachment,
    TenderAuditLog, TenderVersion, TenderAssignment, TenderContractor,
    VirtualAppointment, PhysicalVisit, TenderCreationAssistance,
    SupervisorServices, TenderMilestone, TenderProgress
)

class SupervisorServicesSerializer(serializers.ModelSerializer):
    supervisor = serializers.SerializerMethodField()
    service_name = serializers.CharField(source='service.name', read_only=True)
    
    class Meta:
        model = SupervisorServices
        fields = ['id', 'supervisor', 'service', 'hourly_rate', 'physical_visit_fee',
                 'available_from', 'available_to', 'service_name', 'expertise_level',
                 'years_experience', 'is_active', 'added_on', 'specializations',
                 'languages', 'available_days']
        read_only_fields = ['added_on']

    def get_supervisor(self, obj):
        return {
            'id': obj.supervisor.id,
            'user': {
                'id': obj.supervisor.user.id,
                'first_name': obj.supervisor.user.first_name,
                'last_name': obj.supervisor.user.last_name,
                'email': obj.supervisor.user.email,
                'phone_number': obj.supervisor.user.phone_number,
                'role': obj.supervisor.user.role
            },
            'city': obj.supervisor.city,
            'state': obj.supervisor.state,
            'rating': obj.supervisor.rating,
            'supervisor_image': obj.supervisor.supervisor_image.url if obj.supervisor.supervisor_image else None
        }

class VirtualAppointmentSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()
    service_name = serializers.CharField(source='service.name', read_only=True)
    project_complexity = serializers.CharField(read_only=True)
    physical_visit_required = serializers.BooleanField(read_only=True)
    skip_physical_visit_reason = serializers.CharField(read_only=True)
    estimated_budget_range = serializers.CharField(read_only=True)
    
    class Meta:
        model = VirtualAppointment
        fields = ['id', 'customer', 'supervisor', 'service', 'scheduled_time', 'duration_minutes',
                 'status', 'meeting_link', 'notes', 'customer_name', 'supervisor_name', 'service_name',
                 'project_complexity', 'physical_visit_required', 'skip_physical_visit_reason', 
                 'estimated_budget_range', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_customer_name(self, obj):
        return get_user_full_name(obj.customer.user)

    def get_supervisor_name(self, obj):
        return get_user_full_name(obj.supervisor.user)

    def validate_scheduled_time(self, value):
        """Ensure appointment is scheduled in the future"""
        if value <= timezone.now():
            raise serializers.ValidationError("Appointment must be scheduled in the future.")
        return value

class VirtualAppointmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating virtual appointments by customers"""
    
    class Meta:
        model = VirtualAppointment
        fields = ['supervisor', 'service', 'scheduled_time', 'duration_minutes', 'notes']
    
    def validate(self, attrs):
        """Validate that supervisor provides the requested service"""
        supervisor = attrs.get('supervisor')
        service = attrs.get('service')
        
        if not SupervisorServices.objects.filter(supervisor=supervisor, service=service).exists():
            raise serializers.ValidationError("Selected supervisor does not provide this service.")
        
        return attrs
    
    def create(self, validated_data):
        """Create appointment with customer from request context"""
        request = self.context['request']
        customer = getattr(request.user, 'customer', None)
        if not customer:
            raise serializers.ValidationError("Only customers can book appointments.")
        
        return VirtualAppointment.objects.create(customer=customer, **validated_data)

class ComplexityAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VirtualAppointment
        fields = ['project_complexity', 'physical_visit_required', 
                 'skip_physical_visit_reason', 'estimated_budget_range']
        
    def validate(self, attrs):
        if attrs.get('project_complexity') == 'complex' and not attrs.get('physical_visit_required'):
            raise serializers.ValidationError(
                "Complex projects must require a physical visit."
            )
        if not attrs.get('physical_visit_required') and not attrs.get('skip_physical_visit_reason'):
            raise serializers.ValidationError(
                "Must provide a reason for skipping physical visit."
            )
        return attrs

class PhysicalVisitSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()
    service_name = serializers.CharField(source='service.name', read_only=True)
    virtual_appointment_id = serializers.IntegerField(source='virtual_appointment.id', read_only=True)
    
    class Meta:
        model = PhysicalVisit
        fields = ['id', 'virtual_appointment', 'customer', 'supervisor', 'service', 'visit_address',
                 'scheduled_date', 'scheduled_time', 'estimated_duration_hours', 'visit_fee',
                 'status', 'payment_status', 'payment_transaction_id', 'supervisor_notes',
                 'customer_willing_for_tender', 'customer_name', 'supervisor_name', 'service_name',
                 'virtual_appointment_id', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def get_customer_name(self, obj):
        return get_user_full_name(obj.customer.user)

    def get_supervisor_name(self, obj):
        return get_user_full_name(obj.supervisor.user)

class PhysicalVisitCreateSerializer(serializers.ModelSerializer):
    """Serializer for scheduling physical visits after virtual appointments"""
    
    class Meta:
        model = PhysicalVisit
        fields = ['virtual_appointment', 'visit_address', 'scheduled_date', 'scheduled_time',
                 'estimated_duration_hours']
    
    def validate_virtual_appointment(self, value):
        """Ensure virtual appointment is completed and belongs to the customer"""
        request = self.context['request']
        customer = getattr(request.user, 'customer', None)
        
        if not customer:
            raise serializers.ValidationError("Only customers can schedule physical visits.")
        
        if value.customer != customer:
            raise serializers.ValidationError("You can only schedule visits for your own appointments.")
        
        if value.status != 'completed':
            raise serializers.ValidationError("Virtual appointment must be completed first.")
        
        if hasattr(value, 'physical_visit'):
            raise serializers.ValidationError("Physical visit already scheduled for this appointment.")
        
        return value
    
    def create(self, validated_data):
        """Create physical visit with data from virtual appointment"""
        virtual_appointment = validated_data['virtual_appointment']
        
        # Get supervisor's fee for this service
        try:
            supervisor_service = SupervisorServices.objects.get(
                supervisor=virtual_appointment.supervisor,
                service=virtual_appointment.service
            )
            visit_fee = supervisor_service.physical_visit_fee
        except SupervisorServices.DoesNotExist:
            visit_fee = 0.00
        
        return PhysicalVisit.objects.create(
            customer=virtual_appointment.customer,
            supervisor=virtual_appointment.supervisor,
            service=virtual_appointment.service,
            visit_fee=visit_fee,
            **validated_data
        )


class DirectPhysicalVisitCreateSerializer(serializers.ModelSerializer):
    """Serializer for booking physical visits directly without prior virtual appointment"""
    
    class Meta:
        model = PhysicalVisit
        fields = ['supervisor', 'service', 'visit_address', 'scheduled_date', 'scheduled_time',
                 'estimated_duration_hours', 'supervisor_notes']
    
    def validate(self, attrs):
        """Validate that supervisor provides the requested service"""
        supervisor = attrs.get('supervisor')
        service = attrs.get('service')
        
        if not SupervisorServices.objects.filter(supervisor=supervisor, service=service).exists():
            raise serializers.ValidationError("Selected supervisor does not provide this service.")
        
        return attrs
    
    def create(self, validated_data):
        """Create physical visit with customer from request context"""
        request = self.context['request']
        customer = getattr(request.user, 'customer', None)
        if not customer:
            raise serializers.ValidationError("Only customers can book physical visits.")
        
        # Get supervisor's fee for this service
        try:
            supervisor_service = SupervisorServices.objects.get(
                supervisor=validated_data['supervisor'],
                service=validated_data['service']
            )
            visit_fee = supervisor_service.physical_visit_fee
        except SupervisorServices.DoesNotExist:
            visit_fee = 0.00
        
        return PhysicalVisit.objects.create(
            customer=customer,
            visit_fee=visit_fee,
            virtual_appointment=None,  # No virtual appointment for direct booking
            **validated_data
        )


class TenderCreationAssistanceSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()
    service_name = serializers.CharField(source='service.name', read_only=True)
    physical_visit_id = serializers.IntegerField(source='physical_visit.id', read_only=True)
    tender_id = serializers.IntegerField(source='tender.id', read_only=True)
    virtual_appointment = serializers.PrimaryKeyRelatedField(
        queryset=VirtualAppointment.objects.all(),
        required=True
    )
    source = serializers.CharField(read_only=True)
    
    # User-friendly requirements field
    requirements_text = serializers.CharField(write_only=True, required=False, allow_blank=True)
    requirements_text_display = serializers.SerializerMethodField()
    
    class Meta:
        model = TenderCreationAssistance
        fields = ['id', 'virtual_appointment', 'physical_visit', 'customer', 'supervisor', 
                 'service', 'status', 'source', 'requirements_discussed', 'requirements_text',
                 'requirements_text_display', 'estimated_budget', 'project_timeline_days', 
                 'special_instructions', 'tender_posted', 'tender', 'customer_name', 
                 'supervisor_name', 'service_name', 'physical_visit_id', 'tender_id', 
                 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'source']

    def get_requirements_text_display(self, obj):
        """Convert JSON requirements to readable text format"""
        if not obj.requirements_discussed:
            return ""
        
        if isinstance(obj.requirements_discussed, list):
            return "\n".join([f"• {req}" for req in obj.requirements_discussed])
        elif isinstance(obj.requirements_discussed, dict):
            text_parts = []
            for category, items in obj.requirements_discussed.items():
                text_parts.append(f"{category.title()}:")
                if isinstance(items, list):
                    text_parts.extend([f"  • {item}" for item in items])
                else:
                    text_parts.append(f"  • {items}")
            return "\n".join(text_parts)
        else:
            return str(obj.requirements_discussed)

    def create(self, validated_data):
        # Handle requirements_text conversion during creation
        if 'requirements_text' in validated_data:
            requirements_text = validated_data.pop('requirements_text')
            if requirements_text:
                # Convert text to structured list
                requirements = [line.strip().lstrip('•').strip() 
                              for line in requirements_text.split('\n') 
                              if line.strip() and not line.strip().endswith(':')]
                validated_data['requirements_discussed'] = requirements
            else:
                validated_data['requirements_discussed'] = []
        
        # Auto-populate customer, supervisor, and service from virtual_appointment
        virtual_appointment = validated_data.get('virtual_appointment')
        if virtual_appointment:
            validated_data['customer'] = virtual_appointment.customer
            validated_data['service'] = virtual_appointment.service
            # supervisor will be set in the view's perform_create method
        
        return super().create(validated_data)

    def get_customer_name(self, obj):
        return get_user_full_name(obj.customer.user)

    def get_supervisor_name(self, obj):
        return get_user_full_name(obj.supervisor.user)

class TenderCreationAssistanceUpdateSerializer(serializers.ModelSerializer):
    """Simplified serializer for updating tender assistance with user-friendly requirements"""
    requirements_text = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = TenderCreationAssistance
        fields = ['requirements_text', 'estimated_budget', 'project_timeline_days', 
                 'special_instructions', 'status']
    
    def update(self, instance, validated_data):
        # Handle requirements_text conversion
        if 'requirements_text' in validated_data:
            requirements_text = validated_data.pop('requirements_text')
            if requirements_text:
                # Convert text to structured list
                requirements = [line.strip().lstrip('•').strip() 
                              for line in requirements_text.split('\n') 
                              if line.strip() and not line.strip().endswith(':')]
                validated_data['requirements_discussed'] = requirements
            else:
                validated_data['requirements_discussed'] = []
        
        return super().update(instance, validated_data)

class TenderAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = TenderAttachment
        fields = ['id', 'name', 'file_type', 'file', 'file_url', 'description', 
                 'uploaded_by', 'uploaded_by_name', 'version', 'access_level',
                 'is_required', 'file_size', 'mime_type', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'uploaded_by', 'file_size']

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return get_user_full_name(obj.uploaded_by)
        return None
        
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

class TenderVersionSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = TenderVersion
        fields = ['id', 'tender', 'version_number', 'data', 'created_by', 
                 'created_by_name', 'comment', 'created_at']
        read_only_fields = ['created_at']

    def get_created_by_name(self, obj):
        if obj.created_by:
            return get_user_full_name(obj.created_by)
        return None

class TenderAuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = TenderAuditLog
        fields = ['id', 'tender', 'user', 'user_name', 'action', 'description',
                 'old_value', 'new_value', 'ip_address', 'created_at']
        read_only_fields = ['created_at']

    def get_user_name(self, obj):
        if obj.user:
            return get_user_full_name(obj.user)
        return None

class TenderSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    selected_contractor = serializers.SerializerMethodField()
    tender_requirements = serializers.SerializerMethodField()
    attachments = TenderAttachmentSerializer(many=True, read_only=True)
    bid_count = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    # These will be handled by to_representation for reading
    supervisor = serializers.PrimaryKeyRelatedField(queryset=Supervisor.objects.all())
    service = serializers.PrimaryKeyRelatedField(queryset=Services.objects.all())
    
    def get_customer(self, obj):
        return {
            'id': obj.customer.id,
            'user': {
                'id': obj.customer.user.id,
                'first_name': obj.customer.user.first_name,
                'last_name': obj.customer.user.last_name,
                'email': obj.customer.user.email,
                'phone_number': obj.customer.user.phone_number,
                'role': obj.customer.user.role
            },
            'city': obj.customer.city,
            'state': obj.customer.state,
            'customer_image': obj.customer.customer_image.url if obj.customer.customer_image else None
        }
    
    def get_selected_contractor(self, obj):
        if obj.selected_contractor:
            return {
                'id': obj.selected_contractor.id,
                'user': {
                    'id': obj.selected_contractor.user.id,
                    'first_name': obj.selected_contractor.user.first_name,
                    'last_name': obj.selected_contractor.user.last_name,
                    'email': obj.selected_contractor.user.email,
                    'phone_number': obj.selected_contractor.user.phone_number,
                    'role': obj.selected_contractor.user.role
                },
                'city': obj.selected_contractor.city,
                'state': obj.selected_contractor.state,
                'rating': obj.selected_contractor.rating,
                'experience': obj.selected_contractor.experience,
                'contractor_image': obj.selected_contractor.contractor_image.url if obj.selected_contractor.contractor_image else None
            }
        return None
    
    def get_progress(self, obj):
        try:
            progress = obj.progress
            return {
                'percent_complete': float(progress.percent_complete),
                'current_phase': progress.current_phase,
                'notes': progress.notes,
                'last_activity': progress.last_activity
            }
        except:
            return {'percent_complete': 0.0, 'current_phase': 'planning', 'notes': '', 'last_activity': None}
    
    class Meta:
        model = Tenders
        fields = ['id', 'title', 'description', 'customer', 'supervisor', 'service', 
                 'location', 'start_date', 'end_date', 'start_time', 'end_time', 'budget', 'selected_contractor', 
                 'consultation', 'status', 'priority', 'is_template', 'template_name', 
                 'version', 'created_at', 'updated_at', 'published_at', 'tender_requirements', 
                 'attachments', 'bid_count', 'progress']
    
    def to_representation(self, instance):
        """Override to format supervisor and service fields for reading"""
        data = super().to_representation(instance)
        
        # Format supervisor field
        if instance.supervisor:
            data['supervisor'] = {
                'id': instance.supervisor.id,
                'user': {
                    'id': instance.supervisor.user.id,
                    'first_name': instance.supervisor.user.first_name,
                    'last_name': instance.supervisor.user.last_name,
                    'email': instance.supervisor.user.email,
                    'phone_number': instance.supervisor.user.phone_number,
                    'role': instance.supervisor.user.role
                },
                'city': instance.supervisor.city,
                'state': instance.supervisor.state,
                'rating': instance.supervisor.rating,
                'supervisor_image': instance.supervisor.supervisor_image.url if instance.supervisor.supervisor_image else None
            }
        else:
            data['supervisor'] = None
            
        # Format service field
        if instance.service:
            data['service'] = {
                'id': instance.service.id,
                'name': instance.service.name,
                'description': instance.service.description,
                'image': instance.service.image.url if instance.service.image else None
            }
        else:
            data['service'] = None
            
        return data
    
    def get_tender_requirements(self, obj):
        requirements = obj.tender_requirements.all()
        return [
            {
                'id': req.id,
                'requirement': {
                    'id': req.requirement.id,
                    'name': req.requirement.name,
                    'description': req.requirement.description
                },
                'category': {
                    'id': req.category.id,
                    'name': req.category.name
                },
                'quantity': req.quantity,
                'units': req.units,
                'description': req.description,
                'is_critical': req.is_critical,
                'version': req.version,
                'created_at': req.created_at,
                'updated_at': req.updated_at
            }
            for req in requirements
        ]
    
    def get_bid_count(self, obj):
        return TenderBids.objects.filter(
            tender_requirement__tender=obj,
            is_final=True
        ).values('contractor').distinct().count()
    
    def create(self, validated_data):
        """Create tender with proper timezone handling"""
        start_time = validated_data.get('start_time')
        end_time = validated_data.get('end_time')
        
        # Convert IST datetime strings to UTC if they are timezone-naive
        if start_time and timezone.is_naive(start_time):
            # Assume the datetime is in IST and convert to UTC
            kolkata_tz = pytz.timezone('Asia/Kolkata')
            start_time_aware = kolkata_tz.localize(start_time)
            validated_data['start_time'] = start_time_aware.astimezone(pytz.utc)
            print(f"DEBUG: Converted start_time from IST {start_time} to UTC {validated_data['start_time']}")
        
        if end_time and timezone.is_naive(end_time):
            # Assume the datetime is in IST and convert to UTC
            kolkata_tz = pytz.timezone('Asia/Kolkata')
            end_time_aware = kolkata_tz.localize(end_time)
            validated_data['end_time'] = end_time_aware.astimezone(pytz.utc)
            print(f"DEBUG: Converted end_time from IST {end_time} to UTC {validated_data['end_time']}")
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update tender with proper timezone handling"""
        start_time = validated_data.get('start_time')
        end_time = validated_data.get('end_time')
        
        # Convert IST datetime strings to UTC if they are timezone-naive
        if start_time and timezone.is_naive(start_time):
            # Assume the datetime is in IST and convert to UTC
            kolkata_tz = pytz.timezone('Asia/Kolkata')
            start_time_aware = kolkata_tz.localize(start_time)
            validated_data['start_time'] = start_time_aware.astimezone(pytz.utc)
            print(f"DEBUG: Converted start_time from IST {start_time} to UTC {validated_data['start_time']}")
        
        if end_time and timezone.is_naive(end_time):
            # Assume the datetime is in IST and convert to UTC
            kolkata_tz = pytz.timezone('Asia/Kolkata')
            end_time_aware = kolkata_tz.localize(end_time)
            validated_data['end_time'] = end_time_aware.astimezone(pytz.utc)
            print(f"DEBUG: Converted end_time from IST {end_time} to UTC {validated_data['end_time']}")
        
        return super().update(instance, validated_data)

class TenderBidSerializer(serializers.ModelSerializer):
    contractor = serializers.SerializerMethodField()
    tender_requirement = serializers.SerializerMethodField()
    attachments = TenderAttachmentSerializer(many=True, read_only=True)
    
    def get_contractor(self, obj):
        return {
            'id': obj.contractor.id,
            'user': {
                'id': obj.contractor.user.id,
                'first_name': obj.contractor.user.first_name,
                'last_name': obj.contractor.user.last_name,
                'email': obj.contractor.user.email,
                'phone_number': obj.contractor.user.phone_number,
                'role': obj.contractor.user.role
            },
            'city': obj.contractor.city,
            'state': obj.contractor.state,
            'rating': obj.contractor.rating,
            'experience': obj.contractor.experience,
            'contractor_image': obj.contractor.contractor_image.url if obj.contractor.contractor_image else None
        }
    
    def get_tender_requirement(self, obj):
        return {
            'id': obj.tender_requirement.id,
            'requirement': {
                'id': obj.tender_requirement.requirement.id,
                'name': obj.tender_requirement.requirement.name,
                'description': obj.tender_requirement.requirement.description
            },
            'category': {
                'id': obj.tender_requirement.category.id,
                'name': obj.tender_requirement.category.name
            },
            'quantity': obj.tender_requirement.quantity,
            'units': obj.tender_requirement.units,
            'description': obj.tender_requirement.description,
            'is_critical': obj.tender_requirement.is_critical
        }
    
    class Meta:
        model = TenderBids
        fields = ['id', 'tender_requirement', 'contractor', 'bid_amount', 
                 'proposal_description', 'attachments', 'is_final', 
                 'timestamp', 'updated_at']
        read_only_fields = ['timestamp', 'updated_at']

class TenderRequirementSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    requirement_name = serializers.CharField(source='requirement.name', read_only=True)
    requirement_description = serializers.CharField(source='requirement.description', read_only=True)
    
    class Meta:
        model = TenderRequirement
        fields = ['id', 'tender', 'category', 'category_name', 'requirement', 
                 'requirement_name', 'requirement_description', 'quantity', 'units',
                 'description', 'version', 'is_critical', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'category']
    
    def create(self, validated_data):
        """Automatically set category from requirement"""
        requirement = validated_data.get('requirement')
        if requirement and not validated_data.get('category'):
            validated_data['category'] = requirement.category
        return super().create(validated_data)

class TenderContractorSerializer(serializers.ModelSerializer):
    contractor_name = serializers.SerializerMethodField()
    contractor_city = serializers.CharField(source='contractor.city', read_only=True)
    contractor_rating = serializers.FloatField(source='contractor.rating', read_only=True)

    def get_contractor_name(self, obj):
        return get_user_full_name(obj.contractor.user)

    class Meta:
        model = TenderContractor
        fields = ['id', 'tender', 'contractor', 'contractor_name', 'contractor_city',
                 'contractor_rating', 'status', 'added_at', 'updated_at']
        read_only_fields = ['added_at', 'updated_at']

class TenderContractorAssignSerializer(serializers.Serializer):
    tender_id = serializers.IntegerField()
    contractor_ids = serializers.ListField(
        child=serializers.IntegerField(), allow_empty=False
    )

    def validate(self, attrs):
        tender_id = attrs['tender_id']
        contractor_ids = attrs['contractor_ids']
        user = self.context['request'].user

        # Check if user is customer or supervisor
        customer = getattr(user, 'customer', None)
        supervisor = getattr(user, 'supervisor', None)
        if not (customer or supervisor):
            raise serializers.ValidationError("Only customers or supervisors can assign contractors.")

        try:
            tender = Tenders.objects.get(id=tender_id)
        except Tenders.DoesNotExist:
            raise serializers.ValidationError("Tender does not exist.")

        # Check if user has permission
        if customer and tender.customer != customer:
            raise serializers.ValidationError("You are not the owner of this tender.")
        elif supervisor and tender.supervisor != supervisor:
            raise serializers.ValidationError("You are not the supervisor for this tender.")

        # Check tender status
        if tender.status not in ['draft', 'published']:
            raise serializers.ValidationError("Contractors can only be assigned to draft or published tenders.")

        # Prevent duplicate assignments
        already_assigned = TenderContractor.objects.filter(
            tender=tender, contractor__id__in=contractor_ids
        ).values_list('contractor__id', flat=True)

        if already_assigned:
            raise serializers.ValidationError(f"Contractors already assigned: {list(already_assigned)}")

        attrs['tender'] = tender
        return attrs

    def create(self, validated_data):
        tender = validated_data['tender']
        contractor_ids = validated_data['contractor_ids']

        contractors = Contractor.objects.filter(id__in=contractor_ids)
        assignments = [
            TenderContractor(tender=tender, contractor=contractor)
            for contractor in contractors
        ]
        return TenderContractor.objects.bulk_create(assignments)

#Basanth edit
class TenderAssignmentSerializer(serializers.ModelSerializer):
    service = serializers.SerializerMethodField()
    tender_title = serializers.CharField(source='tender.title', read_only=True)
    tender_description = serializers.CharField(source='tender.description', read_only=True)
    tender_location = serializers.CharField(source='tender.location', read_only=True)

    class Meta:
        model = TenderAssignment
        fields = ['id', 'tender', 'tender_title', 'tender_description', 'tender_location', 'contractor', 'payment_status', 'start_date', 'due_date', 'service']
        read_only_fields = ['payment_status']  # payment_status managed separately
    
    def get_service(self, obj):
        if obj.tender and obj.tender.service:
            return {
                'id': obj.tender.service.id,
                'name': obj.tender.service.name,
                'description': obj.tender.service.description
            }
        return None

class TenderSelectContractorSerializer(serializers.ModelSerializer):
    selected_contractor = serializers.PrimaryKeyRelatedField(queryset=Contractor.objects.all())
    start_date = serializers.DateField(required=True, write_only=True)
    due_date = serializers.DateField(required=True, write_only=True)
    comment = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = Tenders
        fields = ['id', 'selected_contractor', 'status', 'start_date', 'due_date', 'comment']
        read_only_fields = ['id', 'status']

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        due_date = attrs.get('due_date')
        
        if start_date and due_date and start_date > due_date:
            raise serializers.ValidationError("Due date must be after start date.")
        
        return attrs

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = request.user if request else None
        selected_contractor = validated_data.get('selected_contractor')
        start_date = validated_data.get('start_date')
        due_date = validated_data.get('due_date')
        comment = validated_data.get('comment', '')
        
        print(f"DEBUG: Updating tender {instance.id} with contractor {selected_contractor.id if selected_contractor else 'None'}")
        print(f"DEBUG: Start date: {start_date}, Due date: {due_date}")
        
        # Store old values for audit log
        old_data = {
            'status': instance.status,
            'selected_contractor': instance.selected_contractor.id if instance.selected_contractor else None,
            'version': instance.version
        }
        
        # Get the latest version number for this tender
        latest_version = TenderVersion.objects.filter(tender=instance).order_by('-version_number').first()
        next_version = (latest_version.version_number + 1) if latest_version else 1

        # Update tender
        instance.selected_contractor = selected_contractor
        instance.status = 'in_progress'
        instance.version = next_version
        instance.save()
        
        print(f"DEBUG: Tender updated successfully")

        # Create version record
        TenderVersion.objects.create(
            tender=instance,
            version_number=next_version,
            data={
                'selected_contractor': selected_contractor.id,
                'status': 'in_progress',
                'start_date': str(start_date),
                'due_date': str(due_date)
            },
            created_by=user,
            comment=comment
        )
        
        # Create audit log
        TenderAuditLog.objects.create(
            tender=instance,
            user=user,
            action='contractor_select',
            description=f"Selected contractor {get_user_full_name(selected_contractor.user)} for tender",
            old_value=old_data,
            new_value={
                'status': 'in_progress',
                'selected_contractor': selected_contractor.id,
                'version': instance.version
            },
            ip_address=request.META.get('REMOTE_ADDR') if request else None
        )

        # Create or update TenderAssignment
        assignment, created = TenderAssignment.objects.update_or_create(
            tender=instance,
            defaults={
                'contractor': selected_contractor,
                'payment_status': 'pending',
                'start_date': start_date,
                'due_date': due_date,
            }
        )
        
        # Create TenderContractor record if it doesn't exist, then update status
        tender_contractor, created = TenderContractor.objects.get_or_create(
            tender=instance,
            contractor=selected_contractor,
            defaults={'status': 'accepted'}
        )
        if not created:
            tender_contractor.status = 'accepted'
            tender_contractor.save()
        
        # Update other contractors' status to declined
        TenderContractor.objects.filter(
            tender=instance
        ).exclude(
            contractor=selected_contractor
        ).update(status='declined')
        
        print(f"DEBUG: Contractor selection completed successfully")
        return instance


class TenderCreationAssistanceSerializer(serializers.ModelSerializer):
    requirements_text = serializers.CharField(write_only=True, help_text="Enter requirements in plain text, one per line")
    requirements_text_display = serializers.SerializerMethodField(read_only=True, help_text="User-friendly display of requirements")
    customer_name = serializers.SerializerMethodField()
    supervisor_name = serializers.SerializerMethodField()
    service_name = serializers.SerializerMethodField()

    class Meta:
        model = TenderCreationAssistance
        fields = [
            'id', 'virtual_appointment', 'physical_visit', 'customer', 'supervisor', 'service',
            'status', 'source', 'requirements_discussed', 'requirements_text', 'requirements_text_display',
            'estimated_budget', 'project_timeline_days', 'special_instructions',
            'tender_posted', 'tender', 'customer_name', 'supervisor_name', 'service_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def to_internal_value(self, data):
        """Override to auto-populate customer, supervisor, service before validation"""
        print(f"DEBUG: to_internal_value called with data: {data}")
        
        # Make a copy so we don't modify the original
        data = data.copy()
        
        # Auto-populate from virtual_appointment if provided
        virtual_appointment_id = data.get('virtual_appointment')
        if virtual_appointment_id and not data.get('customer') and not data.get('supervisor') and not data.get('service'):
            try:
                from .models import VirtualAppointment
                virtual_appointment = VirtualAppointment.objects.get(id=virtual_appointment_id)
                data['customer'] = virtual_appointment.customer.id
                data['supervisor'] = virtual_appointment.supervisor.id  
                data['service'] = virtual_appointment.service.id
                data['source'] = 'virtual_only'
                print(f"DEBUG: Auto-populated from virtual appointment: customer={data['customer']}, supervisor={data['supervisor']}, service={data['service']}")
            except Exception as e:
                print(f"DEBUG: Error getting virtual appointment {virtual_appointment_id}: {e}")
        
        # Auto-populate from physical_visit if provided
        physical_visit_id = data.get('physical_visit')
        if physical_visit_id and not data.get('customer') and not data.get('supervisor') and not data.get('service'):
            try:
                from .models import PhysicalVisit
                physical_visit = PhysicalVisit.objects.get(id=physical_visit_id)
                data['customer'] = physical_visit.customer.id
                data['supervisor'] = physical_visit.supervisor.id
                data['service'] = physical_visit.service.id
                data['source'] = 'physical_visit'
                print(f"DEBUG: Auto-populated from physical visit: customer={data['customer']}, supervisor={data['supervisor']}, service={data['service']}")
            except Exception as e:
                print(f"DEBUG: Error getting physical visit {physical_visit_id}: {e}")
        
        print(f"DEBUG: Final data before parent to_internal_value: {data}")
        return super().to_internal_value(data)

    def get_requirements_text_display(self, obj):
        """Convert JSON requirements back to user-friendly text for display"""
        if obj.requirements_discussed:
            if isinstance(obj.requirements_discussed, list):
                return '\n'.join(obj.requirements_discussed)
            elif isinstance(obj.requirements_discussed, str):
                return obj.requirements_discussed
            else:
                return str(obj.requirements_discussed)
        return ""

    def get_customer_name(self, obj):
        if obj.customer and obj.customer.user:
            return f"{obj.customer.user.first_name} {obj.customer.user.last_name}"
        return None

    def get_supervisor_name(self, obj):
        if obj.supervisor and obj.supervisor.user:
            return f"{obj.supervisor.user.first_name} {obj.supervisor.user.last_name}"
        return None

    def get_service_name(self, obj):
        if obj.service:
            return obj.service.name
        return None

    def create(self, validated_data):
        """Create tender assistance with text-to-JSON conversion"""
        print(f"DEBUG: TenderCreationAssistanceSerializer create called with data: {validated_data}")
        
        # Extract requirements_text before processing
        requirements_text = validated_data.pop('requirements_text', '')
        
        # Convert plain text requirements to structured format
        if requirements_text:
            requirements_list = [req.strip() for req in requirements_text.split('\n') if req.strip()]
            validated_data['requirements_discussed'] = requirements_list
            print(f"DEBUG: Converted requirements text to list: {requirements_list}")
        
        print(f"DEBUG: Final validated_data before create: {validated_data}")
        
        try:
            instance = super().create(validated_data)
            print(f"DEBUG: TenderCreationAssistance created successfully with ID: {instance.id}")
            return instance
        except Exception as e:
            print(f"DEBUG: Error creating TenderCreationAssistance: {str(e)}")
            raise


class TenderCreationAssistanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderCreationAssistance
        fields = [
            'status', 'requirements_discussed', 'estimated_budget', 
            'project_timeline_days', 'special_instructions'
        ]


class ContractorRatingSerializer(serializers.ModelSerializer):
    customer_name = serializers.SerializerMethodField()
    contractor_name = serializers.SerializerMethodField()
    tender_title = serializers.CharField(source='tender.title', read_only=True)
    
    class Meta:
        model = ContractorRating
        fields = [
            'id', 'tender', 'tender_title', 'customer', 'contractor', 
            'customer_name', 'contractor_name', 'rating', 'review',
            'work_quality', 'timeliness', 'communication', 'professionalism',
            'would_recommend', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'customer']

    def get_customer_name(self, obj):
        return get_user_full_name(obj.customer.user)

    def get_contractor_name(self, obj):
        return get_user_full_name(obj.contractor.user)

    def validate(self, attrs):
        """Validate rating submission"""
        tender = attrs.get('tender')
        request = self.context.get('request')
        
        if not request:
            raise serializers.ValidationError("Request context is required")
        
        customer = getattr(request.user, 'customer', None)
        if not customer:
            raise serializers.ValidationError("Only customers can submit ratings")
        
        # Check if tender belongs to customer
        if tender.customer != customer:
            raise serializers.ValidationError("You can only rate contractors for your own tenders")
        
        # Check if tender is completed
        if tender.status != 'completed':
            raise serializers.ValidationError("You can only rate contractors for completed tenders")
        
        # Check if contractor is the selected contractor for this tender
        contractor = attrs.get('contractor')
        if tender.selected_contractor != contractor:
            raise serializers.ValidationError("You can only rate the contractor who worked on this tender")
        
        # Check if rating already exists
        if hasattr(tender, 'contractor_rating'):
            raise serializers.ValidationError("You have already rated this contractor for this tender")
        
        return attrs

    def create(self, validated_data):
        request = self.context['request']
        customer = request.user.customer
        
        # Set customer automatically
        validated_data['customer'] = customer
        
        return super().create(validated_data)


class ContractorRatingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing ratings"""
    customer_name = serializers.SerializerMethodField()
    tender_title = serializers.CharField(source='tender.title', read_only=True)
    
    class Meta:
        model = ContractorRating
        fields = [
            'id', 'tender_title', 'customer_name', 'rating', 'review',
            'would_recommend', 'created_at'
        ]

    def get_customer_name(self, obj):
        return get_user_full_name(obj.customer.user)
