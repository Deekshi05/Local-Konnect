# services/views.py
from rest_framework import generics, permissions, status
from .serializers import (
    ServicesSerializer, RequirementsSerializer, RequirementCategorySerializer,
    ContractorServicesListSerializer, ServicesContractorSerializer,
    ContractorServicesCreateSerializer
)
from .permissions import IsAdminOrReadOnly
from .models import Services, Requirements, RequirementCategory, ContractorServices, Contractor
from .permissions import IsSupervisorOrAdminOrReadOnly
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import traceback
from django.core.exceptions import ObjectDoesNotExist

#--------------------------------------------------------------------------------------------------------------------

class ServicesListCreateView(generics.ListCreateAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [IsAdminOrReadOnly]

class ServicesRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Services.objects.all()
    serializer_class = ServicesSerializer
    permission_classes = [IsAdminOrReadOnly]
#--------------------------------------------------------------------------------------------------------------------

class RequirementCategoryListCreateView(generics.ListCreateAPIView):
    queryset = RequirementCategory.objects.all()
    serializer_class = RequirementCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class RequirementsListCreateView(generics.ListCreateAPIView):
    queryset = Requirements.objects.all()
    serializer_class = RequirementsSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category', None)
        if category_id is not None:
            queryset = queryset.filter(category_id=category_id)
        return queryset
    

#--------------------------------------------------------------------------------------------------------------------
class ContractorServicesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        user = request.user
        try:
            contractor = Contractor.objects.get(user=user)
        except Contractor.DoesNotExist:
            return Response ({'error':'User is not a contractor'},status=403)
        
        contractor_services = ContractorServices.objects.filter(contractor=contractor)
        serializer = ContractorServicesListSerializer(contractor_services,many = True)
        return Response(serializer.data)

class AddContractorServicesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.role != 'CONTRACTOR':
            return Response({"error": "Only contractors can add services."}, status=403)

        serializer = ContractorServicesCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Service added successfully."}, status=201)
        return Response(serializer.errors, status=400)


class DeleteContractorServicesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, service_id):
        if request.user.role != 'CONTRACTOR':
            return Response({"error": "Only contractors can delete services."}, status=403)

        try:
            contractor = Contractor.objects.get(user=request.user)
            contractor_service = ContractorServices.objects.get(contractor=contractor, service__id=service_id)
            contractor_service.delete()
            return Response({"message": "Service removed successfully."}, status=204)
        except ContractorServices.DoesNotExist:
            return Response({"error": "Service not found for this contractor."}, status=404)

#---------------------------------------------------------------------------------------------------------------------------
class ContractorServicesView(APIView):
    """Get all services offered by a specific contractor"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, contractor_id):
        try:
            contractor = Contractor.objects.get(id=contractor_id)
            contractor_services = ContractorServices.objects.filter(contractor=contractor).select_related('service')
            
            # Extract just the services
            services = [cs.service for cs in contractor_services]
            serializer = ServicesSerializer(services, many=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Contractor.DoesNotExist:
            return Response({"error": "Contractor not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error fetching services for contractor {contractor_id}: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#---------------------------------------------------------------------------------------------------------------------------
class ContractorsForServicesView(APIView):
    def get(self, request, service_id):
        try:
            service = Services.objects.get(id=service_id)
            print("✅ Found service:", service)

            serializer = ServicesContractorSerializer(service)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            print(f"❌ Service with ID {service_id} not found.")
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            print(f"🔥 Unexpected error while fetching contractors for service_id = {service_id}")
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#---------------------------------------------------------------------------------------------------------------------------

class SupervisorsForServiceView(APIView):
    """Get all supervisors who provide a specific service"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, service_id):
        try:
            from works.models import SupervisorServices
            from works.serializers import SupervisorServicesSerializer
            
            service = Services.objects.get(id=service_id)
            supervisor_services = SupervisorServices.objects.filter(
                service=service,
                is_active=True
            ).select_related('supervisor__user', 'service').order_by('-expertise_level', '-years_experience')
            
            serializer = SupervisorServicesSerializer(supervisor_services, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Services.DoesNotExist:
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"🔥 Error fetching supervisors for service {service_id}: {str(e)}")
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#---------------------------------------------------------------------------------------------------------------------------
