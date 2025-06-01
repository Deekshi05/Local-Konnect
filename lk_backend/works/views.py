from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from .models import *
from .serializers import TenderBidSerializer, TenderSerializer, TenderContractorAssignSerializer,TenderSelectContractorSerializer,TenderAssignmentSerializer



class AssignContractorsToTenderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TenderContractorAssignSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Contractors assigned successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CustomerTendersView(generics.ListAPIView):
    """
    Allows a customer to view all tenders they have created.
    """
    serializer_class = TenderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        customer = getattr(self.request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can access this endpoint.")
        return Tenders.objects.filter(customer=customer)

    
class TenderBidCreateView(generics.CreateAPIView):
    """
    Allows contractors to place a bid on a tender requirement.
    """
    serializer_class = TenderBidSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        contractor = getattr(self.request.user, 'contractor', None)
        if not contractor:
            raise PermissionDenied("Only contractors can place bids.")
        serializer.save()



class ContractorTenderBidListView(generics.ListAPIView):
    """
    List all bids made by the contractor for a specific tender.
    """
    serializer_class = TenderBidSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        contractor = getattr(self.request.user, 'contractor', None)
        if not contractor:
            raise PermissionDenied("Only contractors can view their bids.")

        tender_id = self.kwargs.get('tender_id')
        return TenderBids.objects.filter(
            contractor=contractor,
            tenders_requirments__tenders__id=tender_id
        )


class TenderBidUpdateView(generics.UpdateAPIView):
    """
    Allows contractors to update their bid within the tender's active time window.
    """
    queryset = TenderBids.objects.all()
    serializer_class = TenderBidSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        bid = super().get_object()
        contractor = getattr(self.request.user, 'contractor', None)

        if not contractor or bid.contractor != contractor:
            raise PermissionDenied("You do not have permission to edit this bid.")

        tender = bid.tenders_requirments.tenders
        now = timezone.now()

        if not (tender.start_time <= now <= tender.end_time):
            raise PermissionDenied("Cannot edit bid outside of the tender's active timeframe.")

        return bid


class TenderBidDeleteView(generics.DestroyAPIView):
    """
    Allows contractors to delete their bid during the tender's active timeframe.
    """
    queryset = TenderBids.objects.all()
    permission_classes = [IsAuthenticated]

    def get_object(self):
        bid = super().get_object()
        contractor = getattr(self.request.user, 'contractor', None)

        if not contractor or bid.contractor != contractor:
            raise PermissionDenied("You do not have permission to delete this bid.")

        tender = bid.tenders_requirments.tenders
        now = timezone.now()

        if not (tender.start_time <= now <= tender.end_time):
            raise PermissionDenied("Cannot delete bid outside of tender's time window.")

        return bid



class ContractorTenderListView(APIView):
    """
    Allows a contractor to view all tenders they are assigned to via Tender_contractors.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not hasattr(user, 'contractor'):
            return Response({"detail": "Only contractors can access this."}, status=status.HTTP_403_FORBIDDEN)

        contractor = user.contractor
        tender_links = Tender_contractors.objects.filter(tender_contractor=contractor)
        tenders = [link.tenders for link in tender_links]

        serializer = TenderSerializer(tenders, many=True)
        return Response(serializer.data)
# 1. Customer selects contractor for a tender
class TenderSelectContractorView(generics.UpdateAPIView):
    queryset = Tenders.objects.all()
    serializer_class = TenderSelectContractorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        tender = super().get_object()
        # Only the tender's customer can set the contractor
        if self.request.user.customer != tender.customer:
            raise PermissionDenied("You do not have permission to set contractor for this tender.")
        return tender

# 2. Contractor sees all tenders where he is selected (via TenderAssignment)
class ContractorSelectedTendersView(generics.ListAPIView):
    serializer_class = TenderAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        contractor = getattr(self.request.user, 'contractor', None)
        if not contractor:
            raise PermissionDenied("Only contractors can access this endpoint.")

        return TenderAssignment.objects.filter(contractor=contractor)