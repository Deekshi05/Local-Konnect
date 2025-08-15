from rest_framework import serializers
from .models import Appointment
from needs.serializers import ServicesSerializer

class AppointmentSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    supervisor_name = serializers.CharField(source='supervisor.get_full_name', read_only=True)
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'customer', 'supervisor', 'service', 'service_name',
            'supervisor_name', 'customer_name', 'type', 'type_display',
            'status', 'status_display', 'scheduled_time', 'completed_at',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
