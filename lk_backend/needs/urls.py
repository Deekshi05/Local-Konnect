from django.urls import path
from .views import ServicesListCreateView, ServicesRetrieveUpdateDestroyView,ContractorServicesListView,AddContractorServicesView,DeleteContractorServicesView

urlpatterns = [
    path('services/', ServicesListCreateView.as_view(), name='service-list-create'),
    path('services/<int:pk>/', ServicesRetrieveUpdateDestroyView.as_view(), name='service-detail'),
    path('contractor/services/', ContractorServicesListView.as_view(), name='contractor-services'),
    path('contractor/services/add/', AddContractorServicesView.as_view(), name='add-contractor-service'),
    path('contractor/services/<int:service_id>/remove/', DeleteContractorServicesView.as_view(), name='delete-contractor-service'),
]
