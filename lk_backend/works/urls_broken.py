from django.urls import path
from .views import (
    TenderListView,
    TenderDetailView,
    TenderBidCreateView,
    # Physical Visits
    path('visits/physical/create/', DirectPhysicalVisitCreateView.as_view(), name='physical-visit-create'),
    path('visits/physical/create-after-virtual/', PhysicalVisitCreateView.as_view(), name='physical-visit-create-after-virtual'),  TenderBidUpdateView,
    TenderBidDeleteView,
    ContractorTenderBidListView,
    TenderBidListForCustomerView,
    CustomerTendersView,
    ContractorTenderListView,
    AssignContractorsToTenderView,
    TenderCreateView,
    TenderSelectContractorView,
    ContractorSelectedTendersView,
    TenderRequirementCreateView,
    CustomerTenderAssignmentsView,
    TenderCancelView,
    TenderRequirementsListView,
    ContractorTenderRequirementBidStatusView,
    SubmitAllTenderBidsView,
    ContractorTenderListWithBidStatusView,
    ContractorBidSummaryForTenderView,
    # Supervisor views
    SupervisorTenderListView,
    SupervisorServicesListView,
    VirtualAppointmentCreateView,
    CustomerVirtualAppointmentsView,
    SupervisorVirtualAppointmentsView,
    VirtualAppointmentUpdateView,
    AssessProjectComplexityView,
    PhysicalVisitCreateView,
    DirectPhysicalVisitCreateView,
    CustomerPhysicalVisitsView,
    SupervisorPhysicalVisitsView,
    PhysicalVisitPaymentConfirmView,
    PhysicalVisitUpdateView,
    TenderCreationAssistanceCreateView,
    CustomerTenderAssistanceView,
    SupervisorTenderAssistanceView,
    TenderAssistanceDetailView,
    AssistedTenderCreateView,
    # New views
    TenderMilestoneListCreateView, TenderMilestoneDetailView,
    TenderProgressView, TenderAttachmentListCreateView, TenderAttachmentDetailView,
    TenderAuditLogListView, TenderVersionListView, TenderAssignmentDetailView,
    SupervisorServicesListCreateView, SupervisorServicesDeleteView, ProgressNoteListCreateView
)


urlpatterns = [

    # Milestones
    path('tenders/<int:tender_id>/milestones/', TenderMilestoneListCreateView.as_view(), name='tender-milestone-list-create'),
    path('tender-milestones/<int:pk>/', TenderMilestoneDetailView.as_view(), name='tender-milestone-detail'),

    # Progress
    path('tenders/<int:tender_id>/progress/', TenderProgressView.as_view(), name='tender-progress'),

    # Attachments
    path('tenders/<int:tender_id>/attachments/', TenderAttachmentListCreateView.as_view(), name='tender-attachment-list-create'),
    path('tender-attachments/<int:pk>/', TenderAttachmentDetailView.as_view(), name='tender-attachment-detail'),

    # Audit Log
    path('tenders/<int:tender_id>/audit-log/', TenderAuditLogListView.as_view(), name='tender-audit-log'),

    # Version History
    path('tenders/<int:tender_id>/versions/', TenderVersionListView.as_view(), name='tender-version-list'),

    # Assignment
    path('tender-assignments/<int:pk>/', TenderAssignmentDetailView.as_view(), name='tender-assignment-detail'),

    # Supervisor Services Management
    path('supervisor/services/', SupervisorServicesListCreateView.as_view(), name='supervisor-services-list-create'),
    path('supervisor/services/<int:service_id>/', SupervisorServicesDeleteView.as_view(), name='supervisor-services-delete'),

    # Progress Notes
    path('tenders/<int:tender_id>/progress-notes/', ProgressNoteListCreateView.as_view(), name='tender-progress-notes'),
    # Generic tender list and detail
    
    path('tenders/<int:pk>/', TenderDetailView.as_view(), name='tender-detail'),
    
    # Bidding
    path('tender-bids/<int:pk>/update/', TenderBidUpdateView.as_view(), name='tender-bid-update'),
    path('tender-bids/<int:pk>/delete/', TenderBidDeleteView.as_view(), name='tender-bid-delete'),
    path('tender-bids/tender/<int:tender_id>/', ContractorTenderBidListView.as_view(), name='tender-bid-list'),
    path('customer/tender-bids/<int:tender_id>/', TenderBidListForCustomerView.as_view(), name='customer-tender-bids'),

    # Customer & Contractor tender views
    path('tenders/customer/', CustomerTendersView.as_view(), name='customer-tenders'),
    path('tenders/contractor/listed/', ContractorTenderListView.as_view(), name='contractor-tender-list'),
    path('tenders/contractor/selected/', ContractorSelectedTendersView.as_view(), name='contractor-selected-tenders'),
    path('tenders/customer/assignments/', CustomerTenderAssignmentsView.as_view(), name='customer-tender-assignments'),

    # Tender creation and assignments
    path('tenders/create/', TenderCreateView.as_view(), name='tender-create'),
    path('tenders/assign-contractors/', AssignContractorsToTenderView.as_view(), name='assign-contractors'),
    path('tenders/<int:pk>/select-contractor/', TenderSelectContractorView.as_view(), name='select-contractor'),
    path('tenders/<int:tender_id>/cancel/', TenderCancelView.as_view(), name='tender-cancel'),
    path('tender-requirements/', TenderRequirementsListView.as_view(), name='tender-requirements-list'),

    # Tender requirements 
    path('tender-requirements/create/', TenderRequirementCreateView.as_view(), name='tender-requirement-create'),

    # Bid management
    path('customer/tender/<int:tender_id>/bid-summary/', ContractorBidSummaryForTenderView.as_view(), name='tender-bid-summary'),
    path('tenders/contractor/assigned-with-bid-status/', ContractorTenderListWithBidStatusView.as_view(), name='contractor-tender-list-with-bid-status'),
    path('tenders/<int:tender_id>/requirements-with-bids/', ContractorTenderRequirementBidStatusView.as_view(), name='tender-requirements-with-bids'),
    path('tenders/<int:tender_id>/submit-bids/', SubmitAllTenderBidsView.as_view(), name='tender-submit-bids'),

    # Supervisor Views
    # Supervisor dashboard data
    path('tenders/supervisor/', SupervisorTenderListView.as_view(), name='supervisor-tenders'),
    path('supervisors/services/', SupervisorServicesListView.as_view(), name='supervisor-services-list'),
    
    # Virtual appointments
    path('appointments/virtual/create/', VirtualAppointmentCreateView.as_view(), name='virtual-appointment-create'),
    path('appointments/virtual/customer/', CustomerVirtualAppointmentsView.as_view(), name='customer-virtual-appointments'),
    path('appointments/virtual/supervisor/', SupervisorVirtualAppointmentsView.as_view(), name='supervisor-virtual-appointments'),
    path('appointments/virtual/<int:pk>/update/', VirtualAppointmentUpdateView.as_view(), name='virtual-appointment-update'),
    path('appointments/virtual/<int:pk>/assess-complexity/', AssessProjectComplexityView.as_view(), name='assess-project-complexity'),
    
    # Physical visits
    path('visits/physical/create/', PhysicalVisitCreateView.as_view(), name='physical-visit-create'),
    path('visits/physical/customer/', CustomerPhysicalVisitsView.as_view(), name='customer-physical-visits'),
    path('visits/physical/supervisor/', SupervisorPhysicalVisitsView.as_view(), name='supervisor-physical-visits'),
    path('visits/physical/<int:visit_id>/payment/confirm/', PhysicalVisitPaymentConfirmView.as_view(), name='physical-visit-payment-confirm'),
    path('visits/physical/<int:pk>/update/', PhysicalVisitUpdateView.as_view(), name='physical-visit-update'),
    
    # Tender creation assistance
    path('tender-assistance/create/', TenderCreationAssistanceCreateView.as_view(), name='tender-assistance-create'),
    path('tender-assistance/<int:pk>/', TenderAssistanceDetailView.as_view(), name='tender-assistance-detail'),
    path('tender-assistance/customer/', CustomerTenderAssistanceView.as_view(), name='customer-tender-assistance'),
    path('tender-assistance/supervisor/', SupervisorTenderAssistanceView.as_view(), name='supervisor-tender-assistance'),
    path('tenders/assisted/create/', AssistedTenderCreateView.as_view(), name='assisted-tender-create'),

    # Alias for tender list view
    path('tenders/', TenderListView.as_view(), name='tender-list-alias'),
]
