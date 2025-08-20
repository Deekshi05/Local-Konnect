# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from .serializers import (
    CustomerRegistrationSerializer,
    ContractorRegistrationSerializer,
    SupervisorRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    CustomerSerializer,
    ContractorSerializer
)
from works.models import (
    Tenders,
    TenderContractor,
    VirtualAppointment,
    PhysicalVisit
)
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from .models import Customer, Contractor

class CustomerRegistrationView(APIView):
    def post(self, request):
        serializer = CustomerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Customer registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContractorRegistrationView(APIView):
    def post(self, request):
        serializer = ContractorRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Contractor registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SupervisorRegistrationView(APIView):
    def post(self, request):
        serializer = SupervisorRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Supervisor registered successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            serializer = UserProfileSerializer(request.user)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error in profile GET: {str(e)}")  # For debugging
            return Response(
                {"error": "Failed to retrieve profile"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    def put(self, request):
        try:
            user = request.user
            user_data = request.data.get('user', {})
            
            # Update user fields
            if 'first_name' in user_data:
                user.first_name = user_data['first_name']
            if 'last_name' in user_data:
                user.last_name = user_data['last_name']
            if 'phone' in request.data:
                user.phone_number = request.data['phone']
            
            user.save()
            
            # Update profile-specific fields
            profile = None
            if hasattr(user, 'customer'):
                profile = user.customer
            elif hasattr(user, 'contractor'):
                profile = user.contractor
            elif hasattr(user, 'supervisor'):
                profile = user.supervisor
                
            if profile and 'address' in request.data:
                profile.address = request.data['address']
                profile.save()
            
            # Return updated profile
            return Response(UserProfileSerializer(user).data)
            
        except Exception as e:
            print(f"Error in profile PUT: {str(e)}")  # For debugging
            return Response(
                {"error": "Failed to update profile"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CustomerListView(generics.ListAPIView):
    """List all customers"""
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'supervisor'):
            # Supervisors can only see customers from their tenders and appointments
            supervisor = user.supervisor
            customer_ids = set()
            
            # Get customers from tenders
            tender_customers = Tenders.objects.filter(
                supervisor=supervisor
            ).values_list('customer_id', flat=True)
            customer_ids.update(tender_customers)
            
            # Get customers from virtual appointments
            va_customers = VirtualAppointment.objects.filter(
                supervisor=supervisor
            ).values_list('customer_id', flat=True)
            customer_ids.update(va_customers)
            
            # Get customers from physical visits
            pv_customers = PhysicalVisit.objects.filter(
                supervisor=supervisor
            ).values_list('customer_id', flat=True)
            customer_ids.update(pv_customers)
            
            return Customer.objects.filter(id__in=customer_ids).select_related('user')
        
        return Customer.objects.all().select_related('user')

class ContractorListView(generics.ListAPIView):
    """List all contractors"""
    serializer_class = ContractorSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'supervisor'):
            # Supervisors can only see contractors from their tenders
            supervisor = user.supervisor
            contractor_ids = set()
            
            # Get contractors assigned to supervisor's tenders
            tender_contractors = TenderContractor.objects.filter(
                tender__supervisor=supervisor
            ).values_list('contractor_id', flat=True)
            contractor_ids.update(tender_contractors)
            
            # Get selected contractors from supervisor's tenders
            selected_contractors = Tenders.objects.filter(
                supervisor=supervisor,
                selected_contractor__isnull=False
            ).values_list('selected_contractor_id', flat=True)
            contractor_ids.update(selected_contractors)
            
            return Contractor.objects.filter(id__in=contractor_ids).select_related('user')
        
        return Contractor.objects.all().select_related('user')
