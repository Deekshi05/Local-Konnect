"""
Main orchestrator for Local Konnect seed data generation
Runs all seed data modules in correct order with error handling and progress tracking
"""

import sys
import time
from datetime import datetime
from django.db import transaction, connection
from django.db.models import Count

from .base_config import print_progress
from .cleanup import clear_all_data, verify_cleanup
from .users import UserSeeder
from .services import ServicesSeeder
from .appointments import AppointmentsSeeder
from .tenders import TendersSeeder
from .trust_network import TrustNetworkSeeder

class LocalKonnectMasterSeeder:
    """Master seeder that orchestrates all seed data generation"""
    
    def __init__(self):
        self.start_time = None
        self.data_created = {}
        self.errors = []
        
        # Configuration for data counts
        self.config = {
            'customers': 50,
            'contractors': 30,
            'supervisors': 20,
            'virtual_appointments': 60,
            'physical_visits': 25,
            'tender_assistance': 20,
            'standalone_tenders': 15,
            'trust_connections': 40,
            'quick_jobs': 35
        }

    def run_with_error_handling(self, func, description, *args, **kwargs):
        """Run a function with error handling and progress tracking"""
        print_progress(f"🔄 {description}...")
        
        try:
            result = func(*args, **kwargs)
            print_progress(f"✅ {description} completed successfully")
            return result
        except Exception as e:
            error_msg = f"❌ {description} failed: {str(e)}"
            print_progress(error_msg)
            self.errors.append(error_msg)
            return None

    def cleanup_database(self):
        """Clean existing data with verification"""
        print_progress("🧹 Starting database cleanup...")
        
        if clear_all_data():
            if verify_cleanup():
                print_progress("✅ Database cleanup completed and verified")
                return True
            else:
                print_progress("⚠️  Database cleanup verification failed")
                return False
        else:
            print_progress("❌ Database cleanup failed")
            return False

    def create_users(self):
        """Create all user types"""
        user_seeder = UserSeeder()
        return self.run_with_error_handling(
            user_seeder.create_all_users,
            "Creating users",
            self.config['customers'],
            self.config['contractors'],
            self.config['supervisors']
        )

    def create_services(self, users_data):
        """Create services and assign to users"""
        if not users_data:
            print_progress("❌ Skipping services creation - no users available")
            return None
            
        services_seeder = ServicesSeeder()
        return self.run_with_error_handling(
            services_seeder.create_all_services,
            "Creating services and assignments",
            users_data['contractors'],
            users_data['supervisors']
        )

    def create_appointments(self, users_data, services_data):
        """Create virtual appointments and physical visits"""
        if not all([users_data, services_data]):
            print_progress("❌ Skipping appointments creation - missing dependencies")
            return None
            
        appointments_seeder = AppointmentsSeeder()
        return self.run_with_error_handling(
            appointments_seeder.create_all_appointments,
            "Creating appointments",
            users_data['customers'],
            users_data['supervisors'],
            services_data['services'],
            self.config['virtual_appointments'],
            self.config['physical_visits']
        )

    def create_tenders(self, users_data, services_data, appointments_data):
        """Create tenders and related data"""
        if not all([users_data, services_data, appointments_data]):
            print_progress("❌ Skipping tenders creation - missing dependencies")
            return None
            
        tenders_seeder = TendersSeeder()
        return self.run_with_error_handling(
            tenders_seeder.create_all_tenders,
            "Creating tenders",
            appointments_data['physical_visits'],
            users_data['customers'],
            users_data['supervisors'],
            services_data['services'],
            users_data['contractors'],
            services_data['requirements'],
            self.config['tender_assistance'],
            self.config['standalone_tenders']
        )

    def create_trust_network(self, users_data, services_data, tenders_data):
        """Create trust network and quick jobs"""
        if not all([users_data, services_data]):
            print_progress("❌ Skipping trust network creation - missing dependencies")
            return None
            
        trust_seeder = TrustNetworkSeeder()
        tenders_list = tenders_data['tenders'] if tenders_data else []
        
        return self.run_with_error_handling(
            trust_seeder.create_all_trust_network_data,
            "Creating trust network",
            users_data['users'],
            users_data['contractors'],
            services_data['services'],
            tenders_list,
            self.config['trust_connections'],
            self.config['quick_jobs']
        )

    def print_comprehensive_summary(self):
        """Print detailed summary of all created data"""
        print_progress("\n" + "="*80)
        print_progress("🎉 LOCAL KONNECT SEED DATA GENERATION COMPLETE")
        print_progress("="*80)
        
        # Time taken
        if self.start_time:
            duration = time.time() - self.start_time
            print_progress(f"⏱️  Total Time: {duration:.2f} seconds")
        
        # Database summary
        try:
            from accounts.models import User, Customer, Contractor, Supervisor
            from needs.models import Services, RequirementCategory, Requirements, ContractorServices
            from works.models import (
                Tenders, TenderRequirement, TenderContractor, TenderAssignment,
                VirtualAppointment, PhysicalVisit, TenderCreationAssistance,
                SupervisorServices, TenderMilestone, TenderProgress
            )
            from appointments.models import Appointment
            from trust_network.models import TrustConnection, QuickJob, QuickJobInterest, TrustScoreLog
            
            print_progress("\n📊 DATABASE SUMMARY:")
            print_progress("-" * 40)
            
            # Users section
            print_progress("👥 USERS:")
            print_progress(f"   • Total Users: {User.objects.count()}")
            print_progress(f"   • Customers: {Customer.objects.count()}")
            print_progress(f"   • Contractors: {Contractor.objects.count()}")
            print_progress(f"   • Supervisors: {Supervisor.objects.count()}")
            
            # Services section
            print_progress("\n🔧 SERVICES:")
            print_progress(f"   • Services: {Services.objects.count()}")
            print_progress(f"   • Requirement Categories: {RequirementCategory.objects.count()}")
            print_progress(f"   • Requirements: {Requirements.objects.count()}")
            print_progress(f"   • Contractor Services: {ContractorServices.objects.count()}")
            print_progress(f"   • Supervisor Services: {SupervisorServices.objects.count()}")
            
            # Appointments section
            print_progress("\n📅 APPOINTMENTS:")
            print_progress(f"   • Virtual Appointments: {VirtualAppointment.objects.count()}")
            print_progress(f"   • Physical Visits: {PhysicalVisit.objects.count()}")
            print_progress(f"   • Appointment Records: {Appointment.objects.count()}")
            print_progress(f"   • Tender Creation Assistance: {TenderCreationAssistance.objects.count()}")
            
            # Tenders section
            print_progress("\n📋 TENDERS:")
            print_progress(f"   • Tenders: {Tenders.objects.count()}")
            print_progress(f"   • Tender Requirements: {TenderRequirement.objects.count()}")
            print_progress(f"   • Tender Contractors: {TenderContractor.objects.count()}")
            print_progress(f"   • Tender Assignments: {TenderAssignment.objects.count()}")
            print_progress(f"   • Tender Milestones: {TenderMilestone.objects.count()}")
            print_progress(f"   • Tender Progress: {TenderProgress.objects.count()}")
            
            # Trust Network section
            print_progress("\n🤝 TRUST NETWORK:")
            print_progress(f"   • Trust Connections: {TrustConnection.objects.count()}")
            print_progress(f"   • Quick Jobs: {QuickJob.objects.count()}")
            print_progress(f"   • Quick Job Interests: {QuickJobInterest.objects.count()}")
            print_progress(f"   • Trust Score Logs: {TrustScoreLog.objects.count()}")
            
            # Status distributions
            print_progress("\n📈 STATUS DISTRIBUTIONS:")
            
            # Tender statuses
            tender_statuses = Tenders.objects.values('status').annotate(count=Count('status'))
            if tender_statuses:
                print_progress("   Tender Statuses:")
                for status in tender_statuses:
                    print_progress(f"     - {status['status']}: {status['count']}")
            
            # Quick job statuses
            job_statuses = QuickJob.objects.values('status').annotate(count=Count('status'))
            if job_statuses:
                print_progress("   Quick Job Statuses:")
                for status in job_statuses:
                    print_progress(f"     - {status['status']}: {status['count']}")
            
            # Virtual appointment statuses
            va_statuses = VirtualAppointment.objects.values('status').annotate(count=Count('status'))
            if va_statuses:
                print_progress("   Virtual Appointment Statuses:")
                for status in va_statuses:
                    print_progress(f"     - {status['status']}: {status['count']}")
                    
        except Exception as e:
            print_progress(f"❌ Error generating summary: {e}")
        
        # Errors section
        if self.errors:
            print_progress("\n⚠️  ERRORS ENCOUNTERED:")
            for error in self.errors:
                print_progress(f"   • {error}")
        
        # Final message
        print_progress("\n" + "="*80)
        if self.errors:
            print_progress("⚠️  Seed data generation completed with some errors.")
            print_progress("   Check the errors above and verify data integrity.")
        else:
            print_progress("✅ Seed data generation completed successfully!")
            print_progress("   Your Local Konnect platform now has realistic data.")
        
        print_progress("="*80)

    def run_complete_seed(self, skip_cleanup=False):
        """Run the complete seed data generation process"""
        self.start_time = time.time()
        
        print_progress("🚀 STARTING LOCAL KONNECT SEED DATA GENERATION")
        print_progress("="*60)
        print_progress(f"Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print_progress(f"Configuration: {self.config}")
        print_progress("="*60)
        
        # Step 1: Database cleanup
        if not skip_cleanup:
            if not self.cleanup_database():
                print_progress("❌ Database cleanup failed. Aborting.")
                return False
        
        # Step 2: Create users
        users_data = self.create_users()
        if not users_data:
            print_progress("❌ User creation failed. Aborting.")
            return False
        self.data_created['users'] = users_data
        
        # Step 3: Create services
        services_data = self.create_services(users_data)
        if not services_data:
            print_progress("❌ Services creation failed. Aborting.")
            return False
        self.data_created['services'] = services_data
        
        # Step 4: Create appointments
        appointments_data = self.create_appointments(users_data, services_data)
        if appointments_data:
            self.data_created['appointments'] = appointments_data
        
        # Step 5: Create tenders
        tenders_data = self.create_tenders(users_data, services_data, appointments_data)
        if tenders_data:
            self.data_created['tenders'] = tenders_data
        
        # Step 6: Create trust network
        trust_data = self.create_trust_network(users_data, services_data, tenders_data)
        if trust_data:
            self.data_created['trust_network'] = trust_data
        
        # Step 7: Print summary
        self.print_comprehensive_summary()
        
        return len(self.errors) == 0

    def run_specific_modules(self, modules, skip_cleanup=False):
        """Run only specific modules"""
        print_progress(f"🚀 RUNNING SPECIFIC MODULES: {', '.join(modules)}")
        
        if not skip_cleanup and 'cleanup' in modules:
            self.cleanup_database()
        
        # You can implement selective module running here
        # For now, run complete process
        return self.run_complete_seed(skip_cleanup=True)


def main():
    """Main entry point"""
    seeder = LocalKonnectMasterSeeder()
    
    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == '--skip-cleanup':
            success = seeder.run_complete_seed(skip_cleanup=True)
        elif sys.argv[1] == '--cleanup-only':
            success = seeder.cleanup_database()
        else:
            print_progress("Usage: python master_seeder.py [--skip-cleanup|--cleanup-only]")
            sys.exit(1)
    else:
        success = seeder.run_complete_seed()
    
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
