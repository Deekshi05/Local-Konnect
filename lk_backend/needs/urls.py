from django.urls import path
from .views import (
    ServicesListCreateView, ServicesRetrieveUpdateDestroyView,
    ContractorServicesListView, AddContractorServicesView,
    DeleteContractorServicesView, ContractorsForServicesView,
    ContractorServicesView, RequirementCategoryListCreateView, 
    RequirementsListCreateView, SupervisorsForServiceView
)

urlpatterns = [
    # Services URLs
    path('services/', ServicesListCreateView.as_view(), name='service-list-create'),
    path('services/<int:pk>/', ServicesRetrieveUpdateDestroyView.as_view(), name='service-detail'),
    path('services/<int:service_id>/contractors/', ContractorsForServicesView.as_view(), name='service-contractors'),
    path('services/<int:service_id>/supervisors/', SupervisorsForServiceView.as_view(), name='service-supervisors'),
    
    # Contractor Services URLs
    path('contractor/services/', ContractorServicesListView.as_view(), name='contractor-services'),
    path('contractor/services/add/', AddContractorServicesView.as_view(), name='add-contractor-service'),
    path('contractor/services/<int:service_id>/remove/', DeleteContractorServicesView.as_view(), name='delete-contractor-service'),
    path('contractors/<int:contractor_id>/services/', ContractorServicesView.as_view(), name='contractor-services-by-id'),
    
    # Requirements and Categories URLs
    path('requirement-categories/', RequirementCategoryListCreateView.as_view(), name='requirement-category-list'),
    path('requirements/', RequirementsListCreateView.as_view(), name='requirements-list'),
]