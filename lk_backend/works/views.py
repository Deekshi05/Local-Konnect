import logging
from decimal import Decimal
from django.db import models
from django.utils import timezone
import pytz
from rest_framework import generics, permissions, status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from http import HTTPStatus

from .permissions import IsSupervisor
from .models import (
    Tenders, TenderRequirement, TenderBids, TenderAttachment,
    TenderAuditLog, TenderVersion, TenderAssignment, TenderContractor,
    VirtualAppointment, PhysicalVisit, TenderCreationAssistance,
    SupervisorServices, TenderMilestone, TenderProgress, ProgressNote,
    ContractorRating
)
from .serializers import (
    TenderSerializer, TenderRequirementSerializer, TenderBidSerializer,
    TenderContractorSerializer, TenderAttachmentSerializer,
    TenderVersionSerializer, TenderAuditLogSerializer,
    TenderContractorAssignSerializer, TenderSelectContractorSerializer,
    TenderAssignmentSerializer, VirtualAppointmentSerializer,
    VirtualAppointmentCreateSerializer, PhysicalVisitSerializer,
    PhysicalVisitCreateSerializer, DirectPhysicalVisitCreateSerializer,
    TenderCreationAssistanceSerializer, TenderCreationAssistanceUpdateSerializer,
    SupervisorServicesSerializer,
    ComplexityAssessmentSerializer, TenderMilestoneSerializer,
    TenderProgressSerializer, ProgressNoteSerializer,
    ContractorRatingSerializer, ContractorRatingListSerializer
)

logger = logging.getLogger(__name__)

# --- Tender Milestone Views ---
class TenderMilestoneListCreateView(generics.ListCreateAPIView):
    serializer_class = TenderMilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tender_id = self.kwargs['tender_id']
        return TenderMilestone.objects.filter(tender_id=tender_id)

    def perform_create(self, serializer):
        tender_id = self.kwargs['tender_id']
        print(f"DEBUG: Creating milestone for tender {tender_id}")
        print(f"DEBUG: Milestone data: {self.request.data}")
        
        tender = Tenders.objects.get(id=tender_id)
        
        # Check if supervisor can add milestones to this tender
        if tender.status in ['completed', 'cancelled', 'published', 'bidding', 'contractor_selection']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied(f"Cannot add milestones for tenders in '{tender.status}' state. Only 'in_progress' tenders can have milestones added.")
        
        serializer.save(tender=tender)
        print(f"DEBUG: Milestone created successfully")
    
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"DEBUG: Milestone creation error: {e}")
            raise

class TenderMilestoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TenderMilestone.objects.all()
    serializer_class = TenderMilestoneSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        milestone = super().get_object()
        
        # Check if supervisor can edit/delete milestones for this tender
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if milestone.tender.status in ['completed', 'cancelled', 'published', 'bidding', 'contractor_selection']:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied(f"Cannot modify milestones for tenders in '{milestone.tender.status}' state. Only 'in_progress' tenders can have milestones modified.")
        
        return milestone

# --- Tender Progress Views ---
class TenderProgressView(generics.RetrieveUpdateAPIView):
    serializer_class = TenderProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        tender_id = self.kwargs['tender_id']
        print(f"DEBUG: Getting progress for tender {tender_id}")
        
        # Get the tender first to check its status
        tender = Tenders.objects.get(id=tender_id)
        
        # Check if supervisor can edit this tender's progress
        if self.request.method in ['PUT', 'PATCH', 'POST']:
            if tender.status in ['completed', 'cancelled', 'published', 'bidding', 'contractor_selection']:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied(f"Cannot edit progress for tenders in '{tender.status}' state. Only 'in_progress' tenders can be edited.")
        
        try:
            progress = TenderProgress.objects.get(tender_id=tender_id)
            print(f"DEBUG: Found existing progress: {progress}")
            return progress
        except TenderProgress.DoesNotExist:
            print(f"DEBUG: No progress found, creating new one")
            # Create a progress record if it doesn't exist
            progress = TenderProgress.objects.create(tender=tender)
            print(f"DEBUG: Created new progress: {progress}")
            return progress
    
    def update(self, request, *args, **kwargs):
        print(f"DEBUG: Update request data: {request.data}")
        try:
            return super().update(request, *args, **kwargs)
        except Exception as e:
            print(f"DEBUG: Update error: {e}")
            raise

# --- Tender Attachment Views ---
class TenderAttachmentListCreateView(generics.ListCreateAPIView):
    serializer_class = TenderAttachmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tender_id = self.kwargs['tender_id']
        return TenderAttachment.objects.filter(tender_id=tender_id)

    def perform_create(self, serializer):
        tender_id = self.kwargs['tender_id']
        tender = Tenders.objects.get(id=tender_id)
        serializer.save(tender=tender, uploaded_by=self.request.user)

class TenderAttachmentDetailView(generics.RetrieveDestroyAPIView):
    queryset = TenderAttachment.objects.all()
    serializer_class = TenderAttachmentSerializer
    permission_classes = [IsAuthenticated]

# --- Tender Audit Log View ---
class TenderAuditLogListView(generics.ListAPIView):
    serializer_class = TenderAuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tender_id = self.kwargs['tender_id']
        return TenderAuditLog.objects.filter(tender_id=tender_id)

# --- Tender Version View ---
class TenderVersionListView(generics.ListAPIView):
    serializer_class = TenderVersionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tender_id = self.kwargs['tender_id']
        return TenderVersion.objects.filter(tender_id=tender_id)

# --- Tender Assignment View ---
class TenderAssignmentDetailView(generics.RetrieveUpdateAPIView):
    queryset = TenderAssignment.objects.all()
    serializer_class = TenderAssignmentSerializer
    permission_classes = [IsAuthenticated]

# --- Supervisor Services Management ---
class SupervisorServicesListCreateView(generics.ListCreateAPIView):
    serializer_class = SupervisorServicesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            supervisor = self.request.user.supervisor
            return SupervisorServices.objects.filter(supervisor=supervisor).select_related(
                'supervisor__user', 'service'
            )
        except AttributeError:
            # User doesn't have a supervisor profile
            return SupervisorServices.objects.none()

    def perform_create(self, serializer):
        try:
            supervisor = self.request.user.supervisor
            serializer.save(supervisor=supervisor)
        except AttributeError:
            raise PermissionDenied("Only supervisors can create services.")

class SupervisorServicesUpdateView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SupervisorServicesSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        supervisor = self.request.user.supervisor
        pk = self.kwargs['pk']
        return SupervisorServices.objects.get(supervisor=supervisor, id=pk)

# --- Progress Notes (if model exists) ---
class ProgressNoteListCreateView(generics.ListCreateAPIView):
    serializer_class = ProgressNoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tender_id = self.kwargs['tender_id']
        return ProgressNote.objects.filter(tender_id=tender_id)

    def perform_create(self, serializer):
        tender_id = self.kwargs['tender_id']
        tender = Tenders.objects.get(id=tender_id)
        serializer.save(tender=tender, author=self.request.user)

class TenderDetailView(generics.RetrieveAPIView):
    """Get details of a specific tender"""
    serializer_class = TenderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Build base queryset with all relationships
        queryset = Tenders.objects.select_related(
            'customer__user',
            'supervisor__user',
            'service',
            'selected_contractor__user'
        ).prefetch_related(
            'tender_requirements',
            'tender_contractors',
            'attachments',
            'versions',
            'audit_logs',
            'tender_requirements__bids',
            'tender_requirements__attachments'
        )
        
        # Filter based on user role
        if hasattr(user, 'customer'):
            return queryset.filter(customer=user.customer)
        elif hasattr(user, 'contractor'):
            return queryset.filter(
                tender_contractors__contractor=user.contractor,
                tender_contractors__status='accepted'
            )
        elif hasattr(user, 'supervisor'):
            return queryset.filter(supervisor=user.supervisor)
            
        return Tenders.objects.none()
    
    def get_object(self):
        try:
            return super().get_object()
        except NotFound:
            raise NotFound("Tender not found or you don't have permission to view it.")

class TenderListView(generics.ListAPIView):
    """List all tenders"""
    serializer_class = TenderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Tenders.objects.all()
        
        # Filter by status
        status = self.request.query_params.get('status')
        if status and status != 'all':
            queryset = queryset.filter(status=status)
        
        # Filter by search term
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search) |
                models.Q(location__icontains=search)
            )
        
        # Sort by given field
        sort = self.request.query_params.get('sort', 'date_desc')
        if sort == 'date_desc':
            queryset = queryset.order_by('-created_at')
        elif sort == 'date_asc':
            queryset = queryset.order_by('created_at')
        elif sort == 'budget_desc':
            queryset = queryset.order_by('-budget')
        elif sort == 'budget_asc':
            queryset = queryset.order_by('budget')
        elif sort == 'priority_desc':
            queryset = queryset.order_by(
                models.Case(
                    models.When(priority='urgent', then=0),
                    models.When(priority='high', then=1),
                    models.When(priority='medium', then=2),
                    models.When(priority='low', then=3),
                    default=4,
                    output_field=models.IntegerField(),
                )
            )
        elif sort == 'priority_asc':
            queryset = queryset.order_by(
                models.Case(
                    models.When(priority='low', then=0),
                    models.When(priority='medium', then=1),
                    models.When(priority='high', then=2),
                    models.When(priority='urgent', then=3),
                    default=4,
                    output_field=models.IntegerField(),
                )
            )
        
        # Handle pagination
        page = int(self.request.query_params.get('page', 1))
        limit = int(self.request.query_params.get('limit', 10))
        if page and limit:
            start = (page - 1) * limit
            end = start + limit
            queryset = queryset[start:end]
        
        return queryset

class TenderCreateView(generics.CreateAPIView):
    queryset = Tenders.objects.all()
    serializer_class = TenderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Tender create failed:", serializer.errors)
            return Response(serializer.errors, status=HTTPStatus.BAD_REQUEST)

        customer = getattr(request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can create tenders.")

        serializer.save(customer=customer)
        return Response(serializer.data, status=HTTPStatus.CREATED)

class TenderRequirementCreateView(generics.CreateAPIView):
    queryset = TenderRequirement.objects.all()
    serializer_class = TenderRequirementSerializer
    permission_classes = [permissions.IsAuthenticated]

class AssignContractorsToTenderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TenderContractorAssignSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Contractors assigned successfully."}, status=201)
        return Response(serializer.errors, status=400)
    
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

class TenderBidListForCustomerView(generics.ListAPIView):
    """
    Lets a customer view all bids submitted for a specific tender.
    """
    serializer_class = TenderBidSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        tender_id = self.kwargs['tender_id']
        user = self.request.user
        customer = getattr(user, 'customer', None)

        if not customer:
            raise PermissionDenied("Only customers can access this view.")

        try:
            tender = Tenders.objects.get(id=tender_id)
        except Tenders.DoesNotExist:
            raise PermissionDenied("Tender not found.")

        if tender.customer != customer:
            raise PermissionDenied("You can only view bids for your own tenders.")

        return TenderBids.objects.filter(tender_requirement__tender=tender)
    
# views.py

class ContractorTenderRequirementBidStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, tender_id):
        contractor = getattr(request.user, 'contractor', None)
        if not contractor:
            raise PermissionDenied("Only contractors can access this.")

        if not TenderContractor.objects.filter(
            tender_id=tender_id, contractor=contractor
        ).exists():
            raise PermissionDenied("You are not assigned to this tender.")

        # Get tender details first
        try:
            tender = Tenders.objects.select_related('service').get(id=tender_id)
        except Tenders.DoesNotExist:
            return Response({"detail": "Tender not found"}, status=404)

        requirements = TenderRequirement.objects.filter(
            tender_id=tender_id
        ).select_related('requirement')

        bid_map = {
            bid.tender_requirement_id: bid
            for bid in TenderBids.objects.filter(
                contractor=contractor,
                tender_requirement__tender_id=tender_id
            )
        }

        # Add tender details to response
        response_data = {
            "tender_id": tender.id,
            "tender_title": tender.title,
            "service_name": tender.service.name if tender.service else None,
            "requirements": []
        }

        for req in requirements:
            bid = bid_map.get(req.id)
            response_data["requirements"].append({
                "requirement_id": req.id,
                "requirement_name": req.requirement.name,
                "category_name": req.category.name,
                "quantity": req.quantity,
                "units": req.units,
                "description": req.description,
                "is_critical": req.is_critical,
                "bid_status": "placed" if bid else "not_placed",
                "bid_amount": str(bid.bid_amount) if bid else None,
                "bid_id": bid.id if bid else None,
                "has_attachments": bool(req.attachments.exists()) if bid else False
            })
        
        return Response(response_data)


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

#Basanth edit
# the below view is for actual tender creation 
class SubmitAllTenderBidsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, tender_id):
        contractor = getattr(request.user, 'contractor', None)
        if not contractor:
            raise PermissionDenied("Only contractors can place bids.")

        tender_contractor = TenderContractor.objects.filter(
            tender_id=tender_id, contractor=contractor
        ).first()
        
        if not tender_contractor:
            raise PermissionDenied("You are not assigned to this tender.")
            
        print(f"DEBUG: Contractor status for tender {tender_id}: {tender_contractor.status}")

        try:
            tender = Tenders.objects.get(id=tender_id)
        except Tenders.DoesNotExist:
            return Response({"detail": "Tender not found"}, status=404)

        # Check if tender is in active bidding period using start_time and end_time
        now = timezone.now()  # Keep in current timezone (IST) as configured in settings
        
        print(f"DEBUG: Current time (timezone.now()): {now}")
        print(f"DEBUG: Current timezone: {now.tzinfo}")
        print(f"DEBUG: Tender start_time: {tender.start_time}")
        print(f"DEBUG: Tender end_time: {tender.end_time}")
        print(f"DEBUG: Tender start_date: {tender.start_date}")
        print(f"DEBUG: Tender end_date: {tender.end_date}")
        
        if tender.start_time and tender.end_time:
            print(f"DEBUG: Using start_time and end_time fields")
            print(f"DEBUG: start_time <= now: {tender.start_time <= now}")
            print(f"DEBUG: now <= end_time: {now <= tender.end_time}")
            print(f"DEBUG: Full condition: {tender.start_time <= now <= tender.end_time}")
            
            if not (tender.start_time <= now <= tender.end_time):
                print(f"DEBUG: Tender is not in active bidding period - TIME CHECK FAILED")
                print(f"DEBUG: Now: {now}")
                print(f"DEBUG: Start: {tender.start_time}")
                print(f"DEBUG: End: {tender.end_time}")
                raise PermissionDenied("Tender is not in active bidding period.")
        elif tender.start_date and tender.end_date:
            print(f"DEBUG: Using start_date and end_date fields (fallback)")
            # Fallback to date fields if time fields are not set
            today = timezone.now().date()  # Use current timezone's date
            print(f"DEBUG: Today: {today}")
            print(f"DEBUG: start_date <= today: {tender.start_date <= today}")
            print(f"DEBUG: today <= end_date: {today <= tender.end_date}")
            
            if not (tender.start_date <= today <= tender.end_date):
                print(f"DEBUG: Tender is not in active bidding period - DATE CHECK FAILED")
                raise PermissionDenied("Tender is not in active bidding period.")
        else:
            print(f"DEBUG: Tender bidding period is not properly configured")
            raise PermissionDenied("Tender bidding period is not properly configured.")

        requirements = TenderRequirement.objects.filter(tender=tender)
        requirement_ids = set(req.id for req in requirements)

        data = request.data.get("bids", [])
        if len(data) != len(requirements):
            return Response({"detail": "You must submit bids for all requirements."}, status=400)

        submitted_ids = set(b["requirement_id"] for b in data)
        if submitted_ids != requirement_ids:
            return Response({"detail": "Missing bids for some requirements."}, status=400)

        # Check for existing bids
        existing_bids = TenderBids.objects.filter(
            contractor=contractor,
            tender_requirement_id__in=submitted_ids
        )
        
        if existing_bids.exists():
            print(f"DEBUG: Found existing bids for requirements: {[b.tender_requirement_id for b in existing_bids]}")
            return Response({"detail": "You have already placed bids for some or all requirements of this tender."}, status=400)

        # Bulk create
        bid_objects = []
        for bid in data:
            bid_objects.append(TenderBids(
                contractor=contractor,
                tender_requirement_id=bid["requirement_id"],
                bid_amount=bid["bid_amount"]
            ))

        TenderBids.objects.bulk_create(bid_objects)
        return Response({"message": "All bids submitted successfully."})


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
            tender_requirement__tender__id=tender_id
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

        tender = bid.tender_requirement.tender
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

        tender = bid.tender_requirement.tender
        now = timezone.now()

        if not (tender.start_time <= now <= tender.end_time):
            raise PermissionDenied("Cannot delete bid outside of tender's time window.")

        return bid



class ContractorTenderListView(APIView):
    """
    Allows a contractor to view all tenders they are assigned to.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'contractor'):
            return Response({"detail": "Only contractors can access this."}, status=403)

        contractor = user.contractor
        tender_links = TenderContractor.objects.filter(
            contractor=contractor, 
            status='accepted'
        ).select_related('tender')
        tenders = [link.tender for link in tender_links]

        serializer = TenderSerializer(tenders, many=True)
        return Response(serializer.data)
    
#Basanth edit
# the below view just returns bids the status where they placed or not 
class ContractorTenderListWithBidStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        contractor = getattr(request.user, 'contractor', None)
        if not contractor:
            raise PermissionDenied("Only contractors can access this.")

        print(f"DEBUG: Fetching tenders for contractor ID: {contractor.id}")
        
        assigned_links = TenderContractor.objects.filter(
            contractor=contractor
        ).select_related("tender", "tender__service")

        print(f"DEBUG: Found {assigned_links.count()} assigned tenders")

        data = []
        for link in assigned_links:
            tender = link.tender
            requirements = TenderRequirement.objects.filter(tender=tender)
            requirement_ids = set(req.id for req in requirements)

            print(f"DEBUG: Processing tender ID: {tender.id}")
            print(f"DEBUG: Found {len(requirement_ids)} requirements")

            placed_bids = TenderBids.objects.filter(
                contractor=contractor,
                tender_requirement_id__in=requirement_ids
            ).count()

            print(f"DEBUG: Found {placed_bids} placed bids")

            bid_status = "placed" if placed_bids == len(requirement_ids) else "not_placed"
            tender_status = tender.status if hasattr(tender, 'status') else 'unknown'

            data.append({
                "tender_id": tender.id,
                "title": tender.title,
                "service": tender.service.name if tender.service else "Unknown Service",
                "location": tender.location,
                "start_time": tender.start_time,
                "end_time": tender.end_time,
                "bid_status": bid_status,
                "status": tender_status,
                "assignment_status": link.status,
                "description": tender.description
            })

        return Response(data)

    
# 1. Customer selects contractor for a tender
class TenderSelectContractorView(generics.UpdateAPIView):
    queryset = Tenders.objects.all()
    serializer_class = TenderSelectContractorSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'tender_id'

    def get_object(self):
        tender = super().get_object()
        # Only the tender's customer can set the contractor
        customer = getattr(self.request.user, 'customer', None)
        if not customer or customer != tender.customer:
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
    
from django.db.models import Prefetch
from decimal import Decimal

class ContractorBidSummaryForTenderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, tender_id):
        user = request.user
        customer = getattr(user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can access this endpoint.")

        try:
            tender = Tenders.objects.prefetch_related(
                'tender_requirements__requirement'
            ).get(id=tender_id)
        except Tenders.DoesNotExist:
            return Response({"detail": "Tender not found"}, status=404)

        if tender.customer != customer:
            raise PermissionDenied("You can only view bids for your own tenders.")

        requirements = tender.tender_requirements.all()
        bids = TenderBids.objects.filter(tender_requirement__in=requirements).select_related(
            'contractor', 'tender_requirement__requirement'
        )

        contractor_map = {}

        for bid in bids:
            contractor = bid.contractor
            req = bid.tender_requirement
            req_name = req.requirement.name
            quantity = req.quantity
            subtotal = Decimal(bid.bid_amount) * quantity

            if contractor.id not in contractor_map:
                contractor_map[contractor.id] = {
                    "contractor_id": contractor.id,
                    "name": f"{contractor.user.first_name} {contractor.user.last_name}".strip(),
                    "city": contractor.city,
                    "state": contractor.state,
                    "rating": contractor.rating,
                    "experience": contractor.experience,
                    "bids": [],
                    "total_bid": Decimal("0.00")
                }

            contractor_map[contractor.id]["bids"].append({
                "requirement": req_name,
                "quantity": quantity,
                "bid_amount": str(bid.bid_amount),
                "subtotal": str(subtotal)
            })
            contractor_map[contractor.id]["total_bid"] += subtotal

        result = list(contractor_map.values())
        for c in result:
            c["total_bid"] = str(c["total_bid"])

        return Response(result)

class CustomerTenderAssignmentsView(generics.ListAPIView):
    serializer_class = TenderAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        customer = getattr(self.request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can access this endpoint.")

        return TenderAssignment.objects.filter(tender__customer=customer)

class TenderCancelView(APIView):
    """
    Allows customers to cancel their tenders if no contractor has been selected yet.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, tender_id):
        customer = getattr(request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can cancel tenders.")

        try:
            tender = Tenders.objects.get(id=tender_id)
        except Tenders.DoesNotExist:
            return Response({"detail": "Tender not found"}, status=404)

        if tender.customer != customer:
            raise PermissionDenied("You can only cancel your own tenders.")

        if tender.selected_contractor:
            return Response({"detail": "Cannot cancel tender - contractor already selected."}, status=400)

        tender.status = 'cancelled'
        tender.save()

        return Response({"message": "Tender cancelled successfully."})

class TenderCompleteView(APIView):
    """
    Allows customers to mark their tenders as complete when work is finished.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, tender_id):
        customer = getattr(request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can mark tenders as complete.")

        try:
            tender = Tenders.objects.get(id=tender_id)
        except Tenders.DoesNotExist:
            return Response({"detail": "Tender not found"}, status=404)

        if tender.customer != customer:
            raise PermissionDenied("You can only mark your own tenders as complete.")

        if tender.status != 'in_progress':
            return Response({
                "detail": f"Cannot mark tender as complete. Current status: {tender.status}. Only 'in_progress' tenders can be marked as complete."
            }, status=400)

        if not tender.selected_contractor:
            return Response({"detail": "Cannot mark tender as complete - no contractor selected."}, status=400)

        # Mark tender as complete
        tender.status = 'completed'
        tender.save()

        # Create audit log for completion
        TenderAuditLog.objects.create(
            tender=tender,
            user=request.user,
            action='tender_complete',
            description=f"Tender marked as complete by customer",
            old_value={'status': 'in_progress'},
            new_value={'status': 'completed'},
            ip_address=request.META.get('REMOTE_ADDR')
        )

        # Create version record for completion
        latest_version = TenderVersion.objects.filter(tender=tender).order_by('-version_number').first()
        next_version = (latest_version.version_number + 1) if latest_version else 1
        
        TenderVersion.objects.create(
            tender=tender,
            version_number=next_version,
            data={
                'status': 'completed',
                'completed_by': 'customer',
                'completion_date': str(timezone.now().date())
            },
            created_by=request.user,
            comment="Tender marked as complete by customer"
        )

        return Response({"message": "Tender marked as complete successfully."})

class TenderRequirementsListView(APIView):
    """
    Allows customers to view requirements for their tenders.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tender_id = request.query_params.get('tenders')
        if not tender_id:
            return Response({"detail": "tender_id parameter is required"}, status=400)

        customer = getattr(request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can access this endpoint.")

        try:
            tender = Tenders.objects.get(id=tender_id)
        except Tenders.DoesNotExist:
            return Response({"detail": "Tender not found"}, status=404)

        if tender.customer != customer:
            raise PermissionDenied("You can only view requirements for your own tenders.")

        requirements = TenderRequirement.objects.filter(tender=tender).select_related('requirement')
        
        result = []
        for req in requirements:
            result.append({
                "id": req.id,
                "requirement": req.requirement.name,
                "quantity": req.quantity,
                "units": req.units,
                "description": req.requirement.description,
                "is_critical": req.is_critical,
                "category": req.category.name if req.category else None
            })

        return Response(result)


# -------------------- SUPERVISOR APPOINTMENT VIEWS -------------------- #

class AssessProjectComplexityView(generics.UpdateAPIView):
    """Update project complexity after virtual consultation"""
    serializer_class = ComplexityAssessmentSerializer
    permission_classes = [IsAuthenticated, IsSupervisor]
    
    def get_queryset(self):
        return VirtualAppointment.objects.filter(
            supervisor=self.request.user.supervisor,
            status='completed'
        )
    
    def perform_update(self, serializer):
        instance = serializer.save()
        # If physical visit is required, we'll create a notification or task
        if instance.physical_visit_required:
            # Here you could add notification logic
            pass

class SupervisorServicesListView(generics.ListAPIView):
    """List all supervisors available for a specific service"""
    serializer_class = SupervisorServicesSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        service_id = self.request.query_params.get('service_id')
        if service_id:
            return SupervisorServices.objects.filter(service_id=service_id).select_related(
                'supervisor__user', 'service'
            )
        return SupervisorServices.objects.all().select_related('supervisor__user', 'service')


class VirtualAppointmentCreateView(generics.CreateAPIView):
    """Customer books a virtual appointment with a supervisor"""
    serializer_class = VirtualAppointmentCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        customer = getattr(self.request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can book appointments.")
        serializer.save()


class CustomerVirtualAppointmentsView(generics.ListAPIView):
    """List all virtual appointments for a customer"""
    serializer_class = VirtualAppointmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        customer = getattr(self.request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can access this endpoint.")
        return VirtualAppointment.objects.filter(customer=customer).select_related(
            'customer__user', 'supervisor__user', 'service'
        ).order_by('-scheduled_time')


class SupervisorVirtualAppointmentsView(generics.ListAPIView):
    """List all virtual appointments for a supervisor"""
    serializer_class = VirtualAppointmentSerializer
    permission_classes = [IsAuthenticated, IsSupervisor]
    
    def get_queryset(self):
        supervisor = getattr(self.request.user, 'supervisor', None)
        if not supervisor:
            raise PermissionDenied("Only supervisors can access this endpoint.")
        now = timezone.now()
        return VirtualAppointment.objects.filter(
            supervisor=supervisor,
            scheduled_time__gte=now - timezone.timedelta(days=30)  # Show last 30 days and future
        ).select_related(
            'customer__user', 
            'supervisor__user', 
            'service'
        ).order_by('scheduled_time')


class VirtualAppointmentUpdateView(generics.UpdateAPIView):
    """Update virtual appointment status and notes (for supervisors)"""
    serializer_class = VirtualAppointmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        supervisor = getattr(self.request.user, 'supervisor', None)
        if not supervisor:
            raise PermissionDenied("Only supervisors can update appointments.")
        return VirtualAppointment.objects.filter(supervisor=supervisor)


class PhysicalVisitCreateView(generics.CreateAPIView):
    """Customer schedules a physical visit after virtual appointment"""
    serializer_class = PhysicalVisitCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        customer = getattr(self.request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can schedule physical visits.")
        serializer.save()


class DirectPhysicalVisitCreateView(generics.CreateAPIView):
    """Customer books a physical visit directly without prior virtual appointment"""
    serializer_class = DirectPhysicalVisitCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        customer = getattr(self.request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can book physical visits.")
        serializer.save()


class CustomerPhysicalVisitsView(generics.ListAPIView):
    """List all physical visits for a customer"""
    serializer_class = PhysicalVisitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        customer = getattr(self.request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can access this endpoint.")
        return PhysicalVisit.objects.filter(customer=customer).select_related(
            'customer__user', 'supervisor__user', 'service', 'virtual_appointment'
        ).order_by('-scheduled_date')


class SupervisorPhysicalVisitsView(generics.ListAPIView):
    """List all physical visits for a supervisor"""
    serializer_class = PhysicalVisitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        supervisor = getattr(self.request.user, 'supervisor', None)
        if not supervisor:
            raise PermissionDenied("Only supervisors can access this endpoint.")
        today = timezone.now().date()
        return PhysicalVisit.objects.filter(
            supervisor=supervisor,
            scheduled_date__gte=today - timezone.timedelta(days=30)  # Show last 30 days and future
        ).select_related(
            'customer__user', 
            'supervisor__user', 
            'service', 
            'virtual_appointment'
        ).order_by('scheduled_date', 'scheduled_time')


class PhysicalVisitPaymentConfirmView(APIView):
    """Confirm payment for physical visit"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, visit_id):
        customer = getattr(request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can confirm payments.")
        
        try:
            visit = PhysicalVisit.objects.get(id=visit_id, customer=customer)
        except PhysicalVisit.DoesNotExist:
            return Response({"detail": "Physical visit not found"}, status=404)
        
        if visit.payment_status == 'paid':
            return Response({"detail": "Payment already confirmed"}, status=400)
        
        # In a real implementation, this would integrate with a payment gateway
        transaction_id = request.data.get('transaction_id')
        if not transaction_id:
            return Response({"detail": "Transaction ID is required"}, status=400)
        
        visit.payment_status = 'paid'
        visit.payment_transaction_id = transaction_id
        visit.status = 'confirmed'
        visit.save()
        
        return Response({"message": "Payment confirmed successfully"})


class PhysicalVisitUpdateView(generics.UpdateAPIView):
    """Update physical visit status and notes (for supervisors)"""
    serializer_class = PhysicalVisitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        supervisor = getattr(self.request.user, 'supervisor', None)
        if not supervisor:
            raise PermissionDenied("Only supervisors can update physical visits.")
        return PhysicalVisit.objects.filter(supervisor=supervisor)


class TenderCreationAssistanceCreateView(generics.CreateAPIView):
    """Create tender creation assistance after consultation"""
    serializer_class = TenderCreationAssistanceSerializer
    permission_classes = []  # Explicitly empty permissions for testing
    
    def create(self, request, *args, **kwargs):
        try:
            print(f"DEBUG: Create tender assistance request data: {request.data}")
            print(f"DEBUG: Request data keys: {list(request.data.keys())}")
            
            # Pre-process the data to populate required fields from virtual appointment
            data = request.data.copy()
            print(f"DEBUG: Data copy created: {data}")
            
            if 'virtual_appointment' in data:
                print(f"DEBUG: virtual_appointment found in data: {data['virtual_appointment']}")
                try:
                    from appointments.models import VirtualAppointment
                    print(f"DEBUG: About to query VirtualAppointment with id: {data['virtual_appointment']}")
                    virtual_appointment = VirtualAppointment.objects.get(id=data['virtual_appointment'])
                    print(f"DEBUG: Found virtual appointment: {virtual_appointment.id}")
                    
                    # Auto-populate required fields
                    data['customer'] = virtual_appointment.customer.id
                    data['supervisor'] = virtual_appointment.supervisor.id
                    data['service'] = virtual_appointment.service.id
                    
                    print(f"DEBUG: Auto-populated fields - customer: {data['customer']}, supervisor: {data['supervisor']}, service: {data['service']}")
                    
                    # Handle requirements as JSON
                    if 'requirements_text' in data:
                        requirements = []
                        for req in data['requirements_text'].split(','):
                            req = req.strip()
                            if req:
                                requirements.append({'description': req})
                        data['requirements'] = requirements
                        print(f"DEBUG: Converted requirements: {data['requirements']}")
                    
                    # Update request data
                    print(f"DEBUG: About to update request.data")
                    request._mutable = True
                    request.data.update(data)
                    request._mutable = False
                    print(f"DEBUG: Updated request.data: {request.data}")
                    
                except VirtualAppointment.DoesNotExist:
                    print(f"DEBUG: Virtual appointment not found: {data['virtual_appointment']}")
                    return Response(
                        {'error': 'Virtual appointment not found'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                except Exception as e:
                    print(f"DEBUG: Error processing virtual appointment: {str(e)}")
                    print(f"DEBUG: Exception type: {type(e)}")
            else:
                print(f"DEBUG: virtual_appointment NOT found in data keys: {list(data.keys())}")
        except Exception as e:
            print(f"DEBUG: Error in create method: {str(e)}")
            print(f"DEBUG: Exception type: {type(e)}")
            return Response(
                {'error': f'Processing error: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"DEBUG: Create tender assistance error: {str(e)}")
            print(f"DEBUG: Exception type: {type(e)}")
            raise
    
    def perform_create(self, serializer):
        print(f"DEBUG: Serializer validated data: {serializer.validated_data}")
        # supervisor = getattr(self.request.user, 'supervisor', None)
        # if not supervisor:
        #     raise PermissionDenied("Only supervisors can create tender assistance.")
        
        virtual_appointment = serializer.validated_data['virtual_appointment']
        physical_visit = serializer.validated_data.get('physical_visit')
        
        # For testing, skip these validations temporarily
        # # Validate virtual appointment
        # if virtual_appointment.status != 'completed':
        #     raise PermissionDenied("Virtual appointment must be completed first.")
        
        # if virtual_appointment.supervisor != supervisor:
        #     raise PermissionDenied("You can only create assistance for your own consultations.")
            
        # # Check if physical visit is required
        # if virtual_appointment.physical_visit_required and not physical_visit:
        #     raise PermissionDenied("Physical visit is required for this project.")
            
        # # If physical visit is provided, validate it
        # if physical_visit:
        #     if physical_visit.supervisor != supervisor:
        #         raise PermissionDenied("You can only use your own physical visits.")
        #     if physical_visit.status != 'completed':
        #         raise PermissionDenied("Physical visit must be completed first.")
        
        # Set source based on physical visit
        source = 'physical_visit' if physical_visit else 'virtual_only'
        
        serializer.save(
            # supervisor=supervisor,  # Disabled for testing
            source=source
        )


class CustomerTenderAssistanceView(generics.ListAPIView):
    """List all tender creation assistance for a customer"""
    serializer_class = TenderCreationAssistanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        customer = getattr(self.request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can access this endpoint.")
        return TenderCreationAssistance.objects.filter(customer=customer).select_related(
            'customer__user', 'supervisor__user', 'service', 'physical_visit', 'tender'
        ).order_by('-created_at')


class SupervisorTenderListView(generics.ListAPIView):
    """List tenders where the supervisor was engaged, grouped by status"""
    serializer_class = TenderSerializer
    permission_classes = [IsAuthenticated, IsSupervisor]

    def get_queryset(self):
        try:
            supervisor = self.request.user.supervisor
            status = self.request.query_params.get('status', None)

            # Supervisors should not see draft tenders
            queryset = Tenders.objects.filter(
                supervisor=supervisor
            ).exclude(status='draft').select_related(
                'customer__user',
                'supervisor__user',
                'service',
                'selected_contractor__user'
            )

            if status:
                queryset = queryset.filter(status=status)
            
            return queryset.order_by('-created_at')
        except AttributeError:
            # User doesn't have supervisor profile
            return Tenders.objects.none()

class SupervisorTenderAssistanceView(generics.ListAPIView):
    """List all tender creation assistance for a supervisor"""
    serializer_class = TenderCreationAssistanceSerializer
    permission_classes = [IsAuthenticated, IsSupervisor]
    
    def get_queryset(self):
        supervisor = getattr(self.request.user, 'supervisor', None)
        if not supervisor:
            raise PermissionDenied("Only supervisors can access this endpoint.")
        
        # Focus on active and recent assistance
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        return TenderCreationAssistance.objects.filter(
            supervisor=supervisor
        ).filter(
            models.Q(status='in_progress') |  # Show all in-progress
            models.Q(created_at__gte=thirty_days_ago)  # And recent ones
        ).select_related(
            'customer__user',
            'supervisor__user',
            'service',
            'physical_visit',
            'tender'
        ).order_by('-status', '-created_at')


class TenderAssistanceDetailView(generics.RetrieveUpdateAPIView):
    """Get and update details of a specific tender assistance"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'customer'):
            return TenderCreationAssistance.objects.filter(customer=user.customer)
        elif hasattr(user, 'supervisor'):
            return TenderCreationAssistance.objects.filter(supervisor=user.supervisor)
        return TenderCreationAssistance.objects.none()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TenderCreationAssistanceUpdateSerializer
        return TenderCreationAssistanceSerializer


class TenderCreationAssistanceCreateView(generics.CreateAPIView):
    """Create tender assistance from virtual appointment or physical visit"""
    serializer_class = TenderCreationAssistanceSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print(f"DEBUG: Create tender assistance request data: {request.data}")
        
        try:
            response = super().create(request, *args, **kwargs)
            print(f"DEBUG: Create tender assistance success: {response.data}")
            return response
        except Exception as e:
            print(f"DEBUG: Create tender assistance error: {e}")
            print(f"DEBUG: Exception type: {type(e)}")
            if hasattr(e, 'detail'):
                print(f"DEBUG: Exception detail: {e.detail}")
            raise


class CustomerTenderAssistanceView(generics.ListAPIView):
    """List all tender assistances for the authenticated customer"""
    serializer_class = TenderCreationAssistanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        customer = getattr(self.request.user, 'customer', None)
        if not customer:
            return TenderCreationAssistance.objects.none()
        return TenderCreationAssistance.objects.filter(customer=customer)


class SupervisorTenderAssistanceView(generics.ListAPIView):
    """List all tender assistances for the authenticated supervisor"""
    serializer_class = TenderCreationAssistanceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        supervisor = getattr(self.request.user, 'supervisor', None)
        if not supervisor:
            return TenderCreationAssistance.objects.none()
        return TenderCreationAssistance.objects.filter(supervisor=supervisor)


class TenderAssistanceDetailView(generics.RetrieveUpdateAPIView):
    """Get and update details of a specific tender assistance"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'customer'):
            return TenderCreationAssistance.objects.filter(customer=user.customer)
        elif hasattr(user, 'supervisor'):
            return TenderCreationAssistance.objects.filter(supervisor=user.supervisor)
        return TenderCreationAssistance.objects.none()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return TenderCreationAssistanceUpdateSerializer
        return TenderCreationAssistanceSerializer


class AssistedTenderCreateView(APIView):
    """Allow only the customer to post the final tender using supervisor assistance"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        customer = getattr(request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can post assisted tenders.")

        assistance_id = request.data.get('assistance_id')
        if not assistance_id:
            return Response({"detail": "Assistance ID is required"}, status=400)

        try:
            assistance = TenderCreationAssistance.objects.get(
                id=assistance_id, customer=customer
            )
        except TenderCreationAssistance.DoesNotExist:
            return Response({"detail": "Tender assistance not found or not owned by this customer"}, status=404)

        if assistance.tender_posted:
            return Response({"detail": "Tender already posted for this assistance"}, status=400)

        # Create tender with assistance data
        tender_data = {
            'customer': customer.id,
            'supervisor': assistance.supervisor.id,
            'service': assistance.service.id,
            'location': request.data.get('location', ''),
            'start_time': request.data.get('start_time'),
            'end_time': request.data.get('end_time'),
            'customer_limit': request.data.get('customer_limit', 5)
        }

        tender_serializer = TenderSerializer(data=tender_data)
        if tender_serializer.is_valid():
            tender = tender_serializer.save(customer=customer)

            # Update assistance record
            assistance.tender = tender
            assistance.tender_posted = True
            assistance.status = 'completed'
            assistance.save()

            return Response({
                "message": "Tender created successfully with supervisor assistance",
                "tender_id": tender.id
            }, status=201)

        return Response(tender_serializer.errors, status=400)


class ContractorRatingCreateView(generics.CreateAPIView):
    """
    Allow customers to rate contractors for completed tenders.
    """
    serializer_class = ContractorRatingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        customer = getattr(self.request.user, 'customer', None)
        if not customer:
            raise PermissionDenied("Only customers can rate contractors.")
        
        serializer.save(customer=customer)


class ContractorRatingListView(generics.ListAPIView):
    """
    List ratings for a specific contractor.
    """
    serializer_class = ContractorRatingListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        contractor_id = self.kwargs.get('contractor_id')
        if contractor_id:
            return ContractorRating.objects.filter(
                contractor_id=contractor_id
            ).order_by('-created_at')
        return ContractorRating.objects.none()


class TenderRatingView(generics.RetrieveAPIView):
    """
    Get rating for a specific tender (if exists).
    """
    serializer_class = ContractorRatingListSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        tender_id = self.kwargs.get('tender_id')
        try:
            return ContractorRating.objects.get(tender_id=tender_id)
        except ContractorRating.DoesNotExist:
            return None

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            return Response({"detail": "No rating found for this tender."}, status=404)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
