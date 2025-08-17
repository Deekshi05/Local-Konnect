from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from works.models import VirtualAppointment, PhysicalVisit
from works.serializers import VirtualAppointmentSerializer, PhysicalVisitSerializer, VirtualAppointmentCreateSerializer
from django.utils import timezone
from accounts.models import Customer, Supervisor

class CustomerRequiredMixin:
    def check_customer(self):
        user = self.request.user
        if user.role != 'CUSTOMER':
            raise PermissionDenied("Only customers can access this endpoint")
        try:
            customer = Customer.objects.get(user=user)
            return customer
        except Customer.DoesNotExist:
            raise PermissionDenied("Customer profile not found")

class SupervisorRequiredMixin:
    def check_supervisor(self):
        user = self.request.user
        try:
            return user.supervisor
        except Supervisor.DoesNotExist:
            raise PermissionDenied("Only supervisors can access this endpoint")

class VirtualAppointmentListView(CustomerRequiredMixin, generics.ListCreateAPIView):
    serializer_class = VirtualAppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return VirtualAppointmentCreateSerializer
        return VirtualAppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        
        if 'customer' in self.request.path:
            # Customer-specific endpoint: Shows all appointments including completed ones
            if user.role != 'CUSTOMER':
                return VirtualAppointment.objects.none()
            customer = self.check_customer()
            return VirtualAppointment.objects.filter(customer=customer).order_by('-scheduled_time')
        
        # General endpoint: Shows only active/upcoming appointments
        if user.role == 'CUSTOMER':
            try:
                customer = user.customer
                return VirtualAppointment.objects.filter(
                    customer=customer,
                    status__in=['scheduled', 'confirmed'],
                    scheduled_time__gte=timezone.now()
                ).order_by('scheduled_time')
            except Customer.DoesNotExist:
                return VirtualAppointment.objects.none()
        elif user.role == 'SUPERVISOR':
            try:
                supervisor = user.supervisor
                return VirtualAppointment.objects.filter(
                    supervisor=supervisor,
                    status__in=['scheduled', 'confirmed'],
                    scheduled_time__gte=timezone.now()
                ).order_by('scheduled_time')
            except Supervisor.DoesNotExist:
                return VirtualAppointment.objects.none()
                
        return VirtualAppointment.objects.none()

class PhysicalAppointmentListView(CustomerRequiredMixin, generics.ListCreateAPIView):
    serializer_class = PhysicalVisitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if 'customer' in self.request.path:
            customer = self.check_customer()
            return PhysicalVisit.objects.filter(customer=customer)
        
        user = self.request.user
        try:
            if hasattr(user, 'customer'):
                return PhysicalVisit.objects.filter(customer__user=user)
            elif hasattr(user, 'supervisor'):
                return PhysicalVisit.objects.filter(supervisor__user=user)
        except (Customer.DoesNotExist, Supervisor.DoesNotExist):
            pass
        return PhysicalVisit.objects.none()

class AppointmentDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        appointment_type = self.kwargs.get('type', '')
        if appointment_type == 'virtual':
            return VirtualAppointmentSerializer
        return PhysicalVisitSerializer

    def get_queryset(self):
        appointment_type = self.kwargs.get('type', '')
        user = self.request.user
        try:
            if hasattr(user, 'customer'):
                customer = user.customer
                if appointment_type == 'virtual':
                    return VirtualAppointment.objects.filter(customer=customer)
                return PhysicalVisit.objects.filter(customer=customer)
            elif hasattr(user, 'supervisor'):
                supervisor = user.supervisor
                if appointment_type == 'virtual':
                    return VirtualAppointment.objects.filter(supervisor=supervisor)
                return PhysicalVisit.objects.filter(supervisor=supervisor)
        except (Customer.DoesNotExist, Supervisor.DoesNotExist):
            pass
        return VirtualAppointment.objects.none() if appointment_type == 'virtual' else PhysicalVisit.objects.none()

    def perform_update(self, serializer):
        status = self.request.data.get('status')
        if status == 'completed':
            serializer.save(completed_at=timezone.now())
        else:
            serializer.save()
