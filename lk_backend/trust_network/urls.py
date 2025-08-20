from django.urls import path
from . import views

urlpatterns = [
    # Trust connections
    path('trust-connections/', views.TrustConnectionListCreateView.as_view(), name='trust-connections'),
    
    # Quick jobs
    path('quick-jobs/', views.QuickJobListCreateView.as_view(), name='quick-jobs'),
    path('quick-jobs/<int:pk>/', views.QuickJobDetailView.as_view(), name='quick-job-detail'),
    path('quick-jobs/<int:job_id>/assign/', views.assign_quick_job, name='assign-quick-job'),
    path('my-quick-jobs/', views.MyQuickJobsView.as_view(), name='my-quick-jobs'),
    
    # Quick job interests
    path('quick-job-interests/', views.QuickJobInterestCreateView.as_view(), name='quick-job-interests'),
    
    # Contractor job management
    path('contractor-assigned-jobs/', views.contractor_assigned_jobs, name='contractor-assigned-jobs'),
    path('contractor-completed-jobs/', views.contractor_completed_jobs, name='contractor-completed-jobs'),
    
    # Trust network features -#Pramodh Edit
    path('trusted-contractors/', views.trusted_contractors, name='trusted-contractors'),
    path('contractor-work-history/<int:contractor_id>/', views.contractor_work_history, name='contractor-work-history'),
    path('customer-worked-contractors/', views.customer_worked_contractors, name='customer-worked-contractors'),
    
    # NLP integration
    path('parse-voice-query/', views.parse_voice_query, name='parse-voice-query'),
    path('service-suggestions/', views.get_service_suggestions, name='service-suggestions'),
    path('test-voice-parsing/', views.test_voice_parsing, name='test-voice-parsing'),
]
