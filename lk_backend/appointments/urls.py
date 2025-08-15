from django.urls import path
from .views import (
    VirtualAppointmentListView,
    PhysicalAppointmentListView,
    AppointmentDetailView,
)

urlpatterns = [
    # Virtual appointment endpoints
    path('virtual/', VirtualAppointmentListView.as_view(), name='virtual-appointments'),
    path('virtual/customer/', VirtualAppointmentListView.as_view(), name='virtual-appointments-customer'),
    path('virtual/<int:pk>/', AppointmentDetailView.as_view(), {'type': 'virtual'}, name='virtual-appointment-detail'),
    
    # Physical visit endpoints
    path('physical/', PhysicalAppointmentListView.as_view(), name='physical-appointments'),
    path('physical/customer/', PhysicalAppointmentListView.as_view(), name='physical-appointments-customer'),
    path('physical/<int:pk>/', AppointmentDetailView.as_view(), {'type': 'physical'}, name='physical-appointment-detail'),
]
