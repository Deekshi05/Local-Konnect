"""
Database cleanup utilities for seed data generation
"""

from django.db import transaction
from .base_config import print_progress

def clear_all_data():
    """Clear all existing data in correct dependency order"""
    print_progress("🧹 Starting database cleanup...")
    
    try:
        with transaction.atomic():
            # Import all models
            from trust_network.models import TrustScoreLog, QuickJobInterest, QuickJob, TrustConnection
            from appointments.models import Appointment
            from works.models import (
                TenderProgress, TenderMilestone, TenderAssignment, TenderCreationAssistance,
                PhysicalVisit, VirtualAppointment, TenderBids, TenderAttachment,
                TenderRequirement, TenderContractor, Tenders, SupervisorServices
            )
            from needs.models import ContractorServices, Requirements, RequirementCategory, Services
            from accounts.models import Customer, Contractor, Supervisor, User
            
            # Clear in reverse dependency order
            deletion_order = [
                # Trust Network
                (TrustScoreLog, "Trust Score Logs"),
                (QuickJobInterest, "Quick Job Interests"),
                (QuickJob, "Quick Jobs"),
                (TrustConnection, "Trust Connections"),
                
                # Appointments
                (Appointment, "Appointment Records"),
                
                # Works - Complex dependencies first
                (TenderProgress, "Tender Progress"),
                (TenderMilestone, "Tender Milestones"),
                (TenderAssignment, "Tender Assignments"),
                (TenderCreationAssistance, "Tender Creation Assistance"),
                (PhysicalVisit, "Physical Visits"),
                (VirtualAppointment, "Virtual Appointments"),
                (TenderBids, "Tender Bids"),
                (TenderAttachment, "Tender Attachments"),
                (TenderRequirement, "Tender Requirements"),
                (TenderContractor, "Tender Contractors"),
                (Tenders, "Tenders"),
                
                # Services relationships
                (SupervisorServices, "Supervisor Services"),
                (ContractorServices, "Contractor Services"),
                (Requirements, "Requirements"),
                (RequirementCategory, "Requirement Categories"),
                (Services, "Services"),
                
                # User profiles
                (Customer, "Customers"),
                (Contractor, "Contractors"),
                (Supervisor, "Supervisors"),
                (User, "Users"),
            ]
            
            for model, name in deletion_order:
                count = model.objects.count()
                if count > 0:
                    model.objects.all().delete()
                    print_progress(f"   Deleted {count} {name}")
            
            print_progress("✅ Database cleanup completed successfully")
            return True
            
    except Exception as e:
        print_progress(f"❌ Error during database cleanup: {e}")
        return False

def clear_specific_tables(table_list):
    """Clear specific tables only"""
    print_progress(f"🧹 Clearing specific tables: {', '.join(table_list)}")
    
    # Define model mapping
    model_mapping = {
        'users': 'accounts.models.User',
        'customers': 'accounts.models.Customer',
        'contractors': 'accounts.models.Contractor',
        'supervisors': 'accounts.models.Supervisor',
        'services': 'needs.models.Services',
        'requirements': 'needs.models.Requirements',
        'tenders': 'works.models.Tenders',
        'appointments': 'works.models.VirtualAppointment',
        'trust_network': 'trust_network.models.TrustConnection',
        'quick_jobs': 'trust_network.models.QuickJob'
    }
    
    try:
        with transaction.atomic():
            for table in table_list:
                if table in model_mapping:
                    # Dynamic import and deletion
                    module_path, class_name = model_mapping[table].rsplit('.', 1)
                    module = __import__(module_path, fromlist=[class_name])
                    model_class = getattr(module, class_name)
                    
                    count = model_class.objects.count()
                    if count > 0:
                        model_class.objects.all().delete()
                        print_progress(f"   Deleted {count} {table}")
                else:
                    print_progress(f"   Warning: Unknown table '{table}' skipped")
        
        print_progress("✅ Specific table cleanup completed")
        return True
        
    except Exception as e:
        print_progress(f"❌ Error during specific table cleanup: {e}")
        return False

def verify_cleanup():
    """Verify that cleanup was successful"""
    print_progress("🔍 Verifying cleanup...")
    
    from accounts.models import User, Customer, Contractor, Supervisor
    from needs.models import Services, Requirements
    from works.models import Tenders, VirtualAppointment
    from trust_network.models import QuickJob, TrustConnection
    
    checks = [
        (User, "Users"),
        (Customer, "Customers"),
        (Contractor, "Contractors"),
        (Supervisor, "Supervisors"),
        (Services, "Services"),
        (Requirements, "Requirements"),
        (Tenders, "Tenders"),
        (VirtualAppointment, "Virtual Appointments"),
        (QuickJob, "Quick Jobs"),
        (TrustConnection, "Trust Connections")
    ]
    
    all_clean = True
    for model, name in checks:
        count = model.objects.count()
        if count > 0:
            print_progress(f"   ⚠️  {name}: {count} records remaining")
            all_clean = False
        else:
            print_progress(f"   ✅ {name}: Clean")
    
    if all_clean:
        print_progress("✅ Database verification passed - all tables clean")
    else:
        print_progress("⚠️  Database verification found remaining data")
    
    return all_clean
