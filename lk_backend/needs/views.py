# Servicess/views.py
from rest_framework import generics, permissions,status
from .serializers import ServicesSerializer
from .permissions import IsAdminOrReadOnly
from .models import *
from .serializers import RequirmentsSerializer,ContractorServicesListSerializer,ServicesContractorSerializer,ContractorServicesCreateSerializer
from .permissions import IsSupervisorOrAdminOrReadOnly
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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

class RequirmentsListCreateView(generics.ListCreateAPIView):
    queryset = Requirments.objects.all()
    serializer_class = RequirmentsSerializer
    permission_classes = [IsSupervisorOrAdminOrReadOnly]

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
class ContractorsForServicesView(APIView):
    def get(self, request, service_id):
        try:
            services = Services.objects.get(id=service_id)
        except Services.DoesNotExist:
            return Response({"error": "Service not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ServicesContractorSerializer(services)
        return Response(serializer.data, status=status.HTTP_200_OK)
#---------------------------------------------------------------------------------------------------------------------------
