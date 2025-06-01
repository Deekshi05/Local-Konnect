from django.urls import path
from .views import (
    TenderBidCreateView,
    TenderBidUpdateView,
    TenderBidDeleteView,
    ContractorTenderBidListView,
    CustomerTendersView,
    ContractorTenderListView,
    AssignContractorsToTenderView
)
from .views import TenderSelectContractorView, ContractorSelectedTendersView
urlpatterns = [
    # Endpoint to allow contractors to place a new bid on a tender requirement
    path('tender-bids/create/', TenderBidCreateView.as_view(), name='tender-bid-create'),

    # Endpoint to allow a contractor to update their existing bid (only within tender time window)
    path('tender-bids/<int:pk>/update/', TenderBidUpdateView.as_view(), name='tender-bid-update'),

    # Endpoint to allow a contractor to delete their existing bid (only within tender time window)
    path('tender-bids/<int:pk>/delete/', TenderBidDeleteView.as_view(), name='tender-bid-delete'),

    # Endpoint to list all bids by a contractor for a specific tender
    path('tender-bids/tender/<int:tender_id>/', ContractorTenderBidListView.as_view(), name='tender-bid-list'),

    # Endpoint to list all tenders created by the currently logged-in customer
    path('tenders/customer/', CustomerTendersView.as_view(), name='customer-tenders'),

    # Endpoint to list all tenders where the logged-in contractor is listed as a potential bidder
    path('tenders/contractor/listed/', ContractorTenderListView.as_view(), name='contractor-tender-list'),
]

urlpatterns += [
    # Customer assigns contractors to their own tender
    path('tenders/assign-contractors/', AssignContractorsToTenderView.as_view(), name='assign-contractors'),
]


urlpatterns = [
    # Customer sets the selected contractor for a tender
    path('tenders/<int:pk>/select-contractor/', TenderSelectContractorView.as_view(), name='select-contractor'),

    # Contractor views all tenders where they are selected
    path('tenders/contractor/selected/', ContractorSelectedTendersView.as_view(), name='contractor-selected-tenders'),
]