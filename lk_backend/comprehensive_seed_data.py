"""
Comprehensive seed data generator for Local Konnect platform
Generates realistic data across all apps with proper relationships and timelines
"""

import os
import sys
import django
from datetime import datetime, timedelta, date, time
from decimal import Decimal
import random
from faker import Faker
from django.utils import timezone
import pytz

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lk_backend.settings')
django.setup()

# Import all models
from accounts.models import User, Customer, Contractor, Supervisor
from needs.models import Services, RequirementCategory, Requirements, ContractorServices
from works.models import (
    Tenders, TenderRequirement, TenderContractor, TenderAttachment, 
    TenderBids, VirtualAppointment, PhysicalVisit, TenderCreationAssistance,
    SupervisorServices, TenderAssignment, TenderMilestone, TenderProgress
)
from appointments.models import Appointment
from trust_network.models import TrustConnection, QuickJob, QuickJobInterest, TrustScoreLog

fake = Faker('en_IN')  # Indian locale for realistic data

class LocalKonnectSeeder:
    def __init__(self):
        self.users = []
        self.customers = []
        self.contractors = []
        self.supervisors = []
        self.services = []
        self.requirements = []
        self.tenders = []
        self.virtual_appointments = []
        self.physical_visits = []
        self.quick_jobs = []
        
        # Date ranges for realistic timelines
        self.today = date.today()
        self.six_months_ago = self.today - timedelta(days=180)
        self.three_months_ago = self.today - timedelta(days=90)
        self.one_month_ago = self.today - timedelta(days=30)
        self.one_week_ago = self.today - timedelta(days=7)
        self.tomorrow = self.today + timedelta(days=1)
        self.next_week = self.today + timedelta(days=7)
        self.next_month = self.today + timedelta(days=30)

    def clear_existing_data(self):
        """Clear existing data to start fresh"""
        print("🧹 Clearing existing data...")
        
        # Clear in reverse dependency order
        TrustScoreLog.objects.all().delete()
        QuickJobInterest.objects.all().delete()
        QuickJob.objects.all().delete()
        TrustConnection.objects.all().delete()
        
        Appointment.objects.all().delete()
        
        TenderProgress.objects.all().delete()
        TenderMilestone.objects.all().delete()
        TenderAssignment.objects.all().delete()
        TenderCreationAssistance.objects.all().delete()
        PhysicalVisit.objects.all().delete()
        VirtualAppointment.objects.all().delete()
        
        TenderBids.objects.all().delete()
        TenderAttachment.objects.all().delete()
        TenderRequirement.objects.all().delete()
        TenderContractor.objects.all().delete()
        Tenders.objects.all().delete()
        
        SupervisorServices.objects.all().delete()
        ContractorServices.objects.all().delete()
        Requirements.objects.all().delete()
        RequirementCategory.objects.all().delete()
        Services.objects.all().delete()
        
        Customer.objects.all().delete()
        Contractor.objects.all().delete()
        Supervisor.objects.all().delete()
        User.objects.all().delete()
        
        print("✅ Existing data cleared")

    def create_services_and_requirements(self):
        """Create services and their requirements"""
        print("🔧 Creating services and requirements...")
        
        services_data = [
            {
                'name': 'Plumbing',
                'description': 'Professional plumbing services for residential and commercial properties',
                'categories': {
                    'Installation': ['Pipe Installation', 'Faucet Installation', 'Toilet Installation', 'Water Heater Installation'],
                    'Repair': ['Leak Repair', 'Drain Cleaning', 'Pipe Repair', 'Fixture Repair'],
                    'Maintenance': ['Preventive Maintenance', 'System Inspection', 'Water Quality Testing']
                }
            },
            {
                'name': 'Electrical',
                'description': 'Certified electrical services for homes and businesses',
                'categories': {
                    'Installation': ['Wiring Installation', 'Light Fixture Installation', 'Outlet Installation', 'Panel Installation'],
                    'Repair': ['Circuit Repair', 'Appliance Repair', 'Emergency Electrical Repair'],
                    'Upgrade': ['Panel Upgrade', 'Smart Home Integration', 'Energy Efficiency Upgrades']
                }
            },
            {
                'name': 'Construction',
                'description': 'Complete construction and renovation services',
                'categories': {
                    'Residential': ['Home Construction', 'Room Addition', 'Kitchen Renovation', 'Bathroom Renovation'],
                    'Commercial': ['Office Construction', 'Retail Space Build-out', 'Warehouse Construction'],
                    'Specialty': ['Foundation Work', 'Roofing', 'Flooring', 'Painting']
                }
            },
            {
                'name': 'HVAC',
                'description': 'Heating, ventilation, and air conditioning services',
                'categories': {
                    'Installation': ['AC Installation', 'Heating System Installation', 'Ductwork Installation'],
                    'Maintenance': ['AC Servicing', 'Filter Replacement', 'System Cleaning'],
                    'Repair': ['AC Repair', 'Heating Repair', 'Ductwork Repair']
                }
            },
            {
                'name': 'Landscaping',
                'description': 'Professional landscaping and garden maintenance',
                'categories': {
                    'Design': ['Garden Design', 'Landscape Planning', 'Irrigation Design'],
                    'Installation': ['Plant Installation', 'Hardscape Installation', 'Irrigation Installation'],
                    'Maintenance': ['Lawn Care', 'Tree Trimming', 'Garden Maintenance']
                }
            },
            {
                'name': 'Cleaning',
                'description': 'Professional cleaning services for homes and offices',
                'categories': {
                    'Residential': ['House Cleaning', 'Deep Cleaning', 'Move-in/out Cleaning'],
                    'Commercial': ['Office Cleaning', 'Post-Construction Cleaning', 'Event Cleanup'],
                    'Specialty': ['Carpet Cleaning', 'Window Cleaning', 'Pressure Washing']
                }
            }
        ]
        
        for service_data in services_data:
            service = Services.objects.create(
                name=service_data['name'],
                description=service_data['description']
            )
            self.services.append(service)
            
            for category_name, requirements_list in service_data['categories'].items():
                category = RequirementCategory.objects.create(
                    name=category_name,
                    description=f"{category_name} requirements for {service.name}",
                    service=service
                )
                
                for req_name in requirements_list:
                    requirement = Requirements.objects.create(
                        name=req_name,
                        description=f"Professional {req_name.lower()} service",
                        category=category,
                        default_unit='service' if 'Installation' in req_name or 'Repair' in req_name else 'sqft'
                    )
                    self.requirements.append(requirement)
        
        print(f"✅ Created {len(self.services)} services with {len(self.requirements)} requirements")

    def create_users(self):
        """Create diverse user base"""
        print("👥 Creating users...")
        
        # Indian cities for realistic data
        indian_cities = [
            ('Mumbai', 'Maharashtra'), ('Delhi', 'Delhi'), ('Bangalore', 'Karnataka'),
            ('Hyderabad', 'Telangana'), ('Chennai', 'Tamil Nadu'), ('Kolkata', 'West Bengal'),
            ('Pune', 'Maharashtra'), ('Ahmedabad', 'Gujarat'), ('Jaipur', 'Rajasthan'),
            ('Lucknow', 'Uttar Pradesh'), ('Kanpur', 'Uttar Pradesh'), ('Nagpur', 'Maharashtra')
        ]
        
        # Create admin user
        admin_user = User.objects.create_user(
            email='admin@localkonnect.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role=User.Roles.ADMIN,
            phone_number='+91-9876543210'
        )
        self.users.append(admin_user)
        
        # Create customers (50)
        for i in range(50):
            city, state = random.choice(indian_cities)
            user = User.objects.create_user(
                email=f'customer{i+1}@{fake.domain_name()}',
                password='password123',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                role=User.Roles.CUSTOMER,
                phone_number=f'+91-{fake.numerify("##########")}'
            )
            self.users.append(user)
            
            customer = Customer.objects.create(
                user=user,
                city=city,
                state=state
            )
            self.customers.append(customer)
        
        # Create contractors (30)
        contractor_skills = [
            ['Plumbing', 'HVAC'], ['Electrical'], ['Construction', 'Landscaping'],
            ['Plumbing'], ['Electrical', 'HVAC'], ['Construction'], ['Cleaning'],
            ['Landscaping', 'Cleaning'], ['HVAC'], ['Plumbing', 'Electrical']
        ]
        
        for i in range(30):
            city, state = random.choice(indian_cities)
            user = User.objects.create_user(
                email=f'contractor{i+1}@{fake.domain_name()}',
                password='password123',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                role=User.Roles.CONTRACTOR,
                phone_number=f'+91-{fake.numerify("##########")}'
            )
            self.users.append(user)
            
            contractor = Contractor.objects.create(
                user=user,
                city=city,
                state=state,
                rating=Decimal(str(round(random.uniform(3.5, 5.0), 1))),
                experience=random.randint(1, 15),
                address=fake.address(),
                type=random.choice(['VERIFIED', 'COMMUNITY']),
                trust_score=round(random.uniform(6.0, 9.5), 1)
            )
            self.contractors.append(contractor)
            
            # Add services for contractor
            skills = random.choice(contractor_skills)
            for skill in skills:
                service = Services.objects.filter(name=skill).first()
                if service:
                    ContractorServices.objects.create(
                        contractor=contractor,
                        service=service
                    )
        
        # Create supervisors (15)
        supervisor_specialties = ['Plumbing', 'Electrical', 'Construction', 'HVAC', 'Landscaping', 'Cleaning']
        
        for i in range(15):
            city, state = random.choice(indian_cities)
            user = User.objects.create_user(
                email=f'supervisor{i+1}@{fake.domain_name()}',
                password='password123',
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                role=User.Roles.SUPERVISOR,
                phone_number=f'+91-{fake.numerify("##########")}'
            )
            self.users.append(user)
            
            supervisor = Supervisor.objects.create(
                user=user,
                city=city,
                state=state,
                rating=Decimal(str(round(random.uniform(4.0, 5.0), 1))),
                address=fake.address(),
                experience=random.randint(5, 20),
                qualification=f"B.Tech in {random.choice(['Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering'])}",
                total_consultations=random.randint(20, 200),
                verified=True,
                bio=fake.text(max_nb_chars=200)
            )
            self.supervisors.append(supervisor)
            
            # Add supervisor services
            specialties = random.sample(supervisor_specialties, random.randint(2, 4))
            for specialty in specialties:
                service = Services.objects.filter(name=specialty).first()
                if service:
                    SupervisorServices.objects.create(
                        supervisor=supervisor,
                        service=service,
                        hourly_rate=Decimal(str(random.randint(500, 2000))),
                        physical_visit_fee=Decimal(str(random.randint(200, 1000))),
                        years_experience=random.randint(3, 15),
                        expertise_level=random.choice(['intermediate', 'senior', 'expert']),
                        specializations=[f"{specialty} {random.choice(['Installation', 'Repair', 'Maintenance'])}"],
                        languages=['English', 'Hindi'],
                        available_days=[1, 2, 3, 4, 5]  # Monday to Friday
                    )
        
        print(f"✅ Created {len(self.users)} users: {len(self.customers)} customers, {len(self.contractors)} contractors, {len(self.supervisors)} supervisors")

    def create_virtual_appointments(self):
        """Create virtual appointments with realistic timeline"""
        print("📅 Creating virtual appointments...")
        
        # Past appointments (completed)
        for i in range(40):
            customer = random.choice(self.customers)
            supervisor = random.choice(self.supervisors)
            service = random.choice(self.services)
            
            scheduled_time = fake.date_time_between(
                start_date=self.six_months_ago, 
                end_date=self.one_week_ago
            )
            # Make timezone-aware
            scheduled_time = timezone.make_aware(scheduled_time)
            
            appointment = VirtualAppointment.objects.create(
                customer=customer,
                supervisor=supervisor,
                service=service,
                scheduled_time=scheduled_time,
                duration_minutes=random.choice([30, 45, 60]),
                status='completed',
                notes=fake.text(max_nb_chars=300),
                project_complexity=random.choice(['simple', 'medium', 'complex']),
                physical_visit_required=random.choice([True, False]),
                estimated_budget_range=f"₹{random.randint(10, 100)}K - ₹{random.randint(100, 500)}K"
            )
            self.virtual_appointments.append(appointment)
        
        # Upcoming appointments
        for i in range(15):
            customer = random.choice(self.customers)
            supervisor = random.choice(self.supervisors)
            service = random.choice(self.services)
            
            scheduled_time = fake.date_time_between(
                start_date=self.tomorrow,
                end_date=self.next_month
            )
            # Make timezone-aware
            scheduled_time = timezone.make_aware(scheduled_time)
            
            appointment = VirtualAppointment.objects.create(
                customer=customer,
                supervisor=supervisor,
                service=service,
                scheduled_time=scheduled_time,
                duration_minutes=random.choice([30, 45, 60]),
                status='scheduled',
                meeting_link=f"https://meet.localkonnect.com/{fake.uuid4()[:8]}"
            )
            self.virtual_appointments.append(appointment)
        
        print(f"✅ Created {len(self.virtual_appointments)} virtual appointments")

    def create_physical_visits(self):
        """Create physical visits following virtual appointments"""
        print("🏠 Creating physical visits...")
        
        # Create physical visits for some completed virtual appointments
        completed_virtuals = [va for va in self.virtual_appointments if va.status == 'completed' and va.physical_visit_required]
        
        for virtual_app in completed_virtuals[:20]:  # Create 20 physical visits
            visit_date = virtual_app.scheduled_time.date() + timedelta(days=random.randint(1, 7))
            
            physical_visit = PhysicalVisit.objects.create(
                virtual_appointment=virtual_app,
                customer=virtual_app.customer,
                supervisor=virtual_app.supervisor,
                service=virtual_app.service,
                visit_address=fake.address(),
                scheduled_date=visit_date,
                scheduled_time=time(random.randint(9, 17), random.choice([0, 30])),
                estimated_duration_hours=random.randint(2, 6),
                visit_fee=Decimal(str(random.randint(500, 2000))),
                status='completed',
                payment_status='paid',
                payment_transaction_id=fake.uuid4()[:16],
                supervisor_notes=fake.text(max_nb_chars=200),
                customer_willing_for_tender=random.choice([True, False])
            )
            self.physical_visits.append(physical_visit)
        
        print(f"✅ Created {len(self.physical_visits)} physical visits")

    def create_tender_creation_assistance(self):
        """Create tender creation assistance records"""
        print("📋 Creating tender creation assistance...")
        
        assistance_records = []
        
        # Create assistance from virtual appointments
        willing_customers = [pv for pv in self.physical_visits if pv.customer_willing_for_tender]
        
        for physical_visit in willing_customers[:15]:
            assistance = TenderCreationAssistance.objects.create(
                virtual_appointment=physical_visit.virtual_appointment,
                physical_visit=physical_visit,
                customer=physical_visit.customer,
                supervisor=physical_visit.supervisor,
                service=physical_visit.service,
                status='completed',
                source='physical_visit',
                requirements_discussed=[f"Requirement {i}" for i in range(1, random.randint(3, 8))],
                estimated_budget=Decimal(str(random.randint(50000, 500000))),
                project_timeline_days=random.randint(15, 90),
                special_instructions=fake.text(max_nb_chars=200),
                tender_posted=True
            )
            assistance_records.append(assistance)
        
        print(f"✅ Created {len(assistance_records)} tender creation assistance records")
        return assistance_records

    def create_tenders(self):
        """Create tenders with realistic progression"""
        print("📄 Creating tenders...")
        
        assistance_records = self.create_tender_creation_assistance()
        
        tender_statuses = ['published', 'in_progress', 'completed', 'cancelled']
        priorities = ['low', 'medium', 'high', 'urgent']
        
        # Create tenders from assistance records
        for assistance in assistance_records:
            start_date = assistance.created_at.date() + timedelta(days=random.randint(1, 5))
            end_date = start_date + timedelta(days=assistance.project_timeline_days or 30)
            
            # Make published_at timezone-aware
            published_at = assistance.created_at + timedelta(days=1)
            
            tender = Tenders.objects.create(
                title=f"{assistance.service.name} Project for {assistance.customer.user.first_name}",
                description=fake.text(max_nb_chars=500),
                customer=assistance.customer,
                supervisor=assistance.supervisor,
                service=assistance.service,
                location=assistance.physical_visit.visit_address if assistance.physical_visit else fake.address(),
                start_date=start_date,
                end_date=end_date,
                budget=assistance.estimated_budget,
                consultation=assistance,
                status=random.choice(tender_statuses),
                priority=random.choice(priorities),
                published_at=published_at
            )
            self.tenders.append(tender)
            
            # Update assistance record
            assistance.tender = tender
            assistance.save()
            
            # Create tender requirements
            service_requirements = Requirements.objects.filter(category__service=assistance.service)[:random.randint(3, 7)]
            
            for req in service_requirements:
                TenderRequirement.objects.create(
                    tender=tender,
                    requirement=req,
                    category=req.category,
                    quantity=Decimal(str(random.randint(1, 10))),
                    units=req.default_unit,
                    description=fake.text(max_nb_chars=200),
                    is_critical=random.choice([True, False])
                )
            
            # Add contractors to tender
            service_contractors = ContractorServices.objects.filter(service=assistance.service)
            selected_contractors = random.sample(list(service_contractors), min(random.randint(3, 6), len(service_contractors)))
            
            for contractor_service in selected_contractors:
                TenderContractor.objects.create(
                    tender=tender,
                    contractor=contractor_service.contractor,
                    status=random.choice(['invited', 'accepted', 'declined'])
                )
            
            # For in_progress and completed tenders, assign contractor
            if tender.status in ['in_progress', 'completed']:
                accepted_contractors = TenderContractor.objects.filter(tender=tender, status='accepted')
                if accepted_contractors:
                    selected_contractor = random.choice(accepted_contractors).contractor
                    tender.selected_contractor = selected_contractor
                    tender.save()
                    
                    # Create assignment
                    TenderAssignment.objects.create(
                        tender=tender,
                        contractor=selected_contractor,
                        start_date=tender.start_date,
                        due_date=tender.end_date,
                        total_amount=tender.budget,
                        payment_status='paid' if tender.status == 'completed' else random.choice(['pending', 'partially_paid']),
                        actual_completion_date=tender.end_date if tender.status == 'completed' else None
                    )
                    
                    # Create progress tracking
                    progress = TenderProgress.objects.create(
                        tender=tender,
                        percent_complete=100 if tender.status == 'completed' else random.randint(20, 80),
                        current_phase=random.choice(['planning', 'execution', 'completion', 'review']),
                        notes=fake.text(max_nb_chars=200)
                    )
                    
                    # Create milestones
                    milestone_count = random.randint(3, 6)
                    for i in range(milestone_count):
                        milestone_date = tender.start_date + timedelta(days=i * (tender.end_date - tender.start_date).days // milestone_count)
                        completed = tender.status == 'completed' or (milestone_date < self.today and random.choice([True, False]))
                        
                        TenderMilestone.objects.create(
                            tender=tender,
                            title=f"Milestone {i+1}: {random.choice(['Planning', 'Material Procurement', 'Execution', 'Quality Check', 'Completion'])}",
                            description=fake.text(max_nb_chars=150),
                            due_date=milestone_date,
                            completed_date=milestone_date if completed else None,
                            status='completed' if completed else random.choice(['pending', 'in_progress']),
                            completion_notes=fake.text(max_nb_chars=100) if completed else ''
                        )
        
        # Create some standalone tenders (not from assistance)
        for i in range(10):
            customer = random.choice(self.customers)
            supervisor = random.choice(self.supervisors)
            service = random.choice(self.services)
            
            start_date = fake.date_between(start_date=self.three_months_ago, end_date=self.next_month)
            end_date = start_date + timedelta(days=random.randint(15, 60))
            
            # Create timezone-aware published_at
            published_naive = start_date - timedelta(days=random.randint(1, 7))
            published_datetime = datetime.combine(published_naive, time(random.randint(9, 17), 0))
            published_at = timezone.make_aware(published_datetime)
            
            tender = Tenders.objects.create(
                title=f"{service.name} - {fake.catch_phrase()}",
                description=fake.text(max_nb_chars=400),
                customer=customer,
                supervisor=supervisor,
                service=service,
                location=fake.address(),
                start_date=start_date,
                end_date=end_date,
                budget=Decimal(str(random.randint(25000, 300000))),
                status=random.choice(tender_statuses),
                priority=random.choice(priorities),
                published_at=published_at
            )
            self.tenders.append(tender)
        
        print(f"✅ Created {len(self.tenders)} tenders")

    def create_trust_network_data(self):
        """Create trust network connections and quick jobs"""
        print("🤝 Creating trust network data...")
        
        # Create trust connections
        trust_connections = []
        customers_with_completed_work = set()
        
        # Get customers who had completed tenders
        completed_tenders = Tenders.objects.filter(status='completed', selected_contractor__isnull=False)
        for tender in completed_tenders:
            customers_with_completed_work.add(tender.customer)
            
            # Customer recommends the contractor they worked with
            if random.choice([True, True, False]):  # 66% chance
                connection = TrustConnection.objects.create(
                    recommender=tender.customer.user,
                    contractor=tender.selected_contractor,
                    comment=fake.text(max_nb_chars=200),
                    trust_level=random.randint(7, 10),  # Higher trust for completed work
                    service_context=tender.service
                )
                trust_connections.append(connection)
        
        # Create additional random recommendations
        for i in range(20):
            recommender = random.choice(self.users)
            contractor = random.choice(self.contractors)
            
            # Avoid duplicate recommendations
            if not TrustConnection.objects.filter(recommender=recommender, contractor=contractor).exists():
                TrustConnection.objects.create(
                    recommender=recommender,
                    contractor=contractor,
                    comment=fake.text(max_nb_chars=150),
                    trust_level=random.randint(5, 9),
                    service_context=random.choice(self.services)
                )
        
        # Create quick jobs
        job_statuses = ['OPEN', 'ASSIGNED', 'COMPLETED', 'CANCELLED']
        urgency_levels = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
        
        for i in range(30):
            customer = random.choice([u for u in self.users if u.role == User.Roles.CUSTOMER])
            service = random.choice(self.services)
            
            created_date = fake.date_time_between(start_date=self.three_months_ago, end_date=self.today)
            created_date = timezone.make_aware(created_date)
            status = random.choice(job_statuses)
            
            quick_job = QuickJob.objects.create(
                customer=customer,
                service=service,
                title=f"Quick {service.name} Job - {fake.catch_phrase()[:30]}",
                description=fake.text(max_nb_chars=300),
                location=fake.address(),
                status=status,
                urgency=random.choice(urgency_levels),
                budget_suggestion=Decimal(str(random.randint(500, 5000))),
                created_at=created_date,
                raw_query=fake.sentence(),
                parsed_intent={'service': service.name, 'urgency': random.choice(urgency_levels)}
            )
            
            if status in ['ASSIGNED', 'COMPLETED']:
                # Assign contractor
                service_contractors = ContractorServices.objects.filter(service=service)
                if service_contractors:
                    contractor = random.choice(service_contractors).contractor
                    quick_job.assigned_contractor = contractor
                    quick_job.assigned_at = created_date + timedelta(hours=random.randint(1, 24))
                    
                    if status == 'COMPLETED':
                        quick_job.completed_at = quick_job.assigned_at + timedelta(hours=random.randint(2, 48))
                    
                    quick_job.save()
            
            self.quick_jobs.append(quick_job)
            
            # Create contractor interests for open jobs
            if status == 'OPEN':
                service_contractors = ContractorServices.objects.filter(service=service)
                interested_contractors = random.sample(list(service_contractors), min(random.randint(1, 4), len(service_contractors)))
                
                for contractor_service in interested_contractors:
                    budget = float(quick_job.budget_suggestion)
                    min_price = int(budget * 0.8)
                    max_price = int(budget * 1.2)
                    QuickJobInterest.objects.create(
                        quick_job=quick_job,
                        contractor=contractor_service.contractor,
                        message=fake.text(max_nb_chars=100),
                        proposed_price=Decimal(str(random.randint(min_price, max_price)))
                    )
        
        # Update contractor trust scores based on recommendations
        for contractor in self.contractors:
            recommendations = TrustConnection.objects.filter(contractor=contractor)
            if recommendations:
                avg_trust = sum(rec.trust_level for rec in recommendations) / len(recommendations)
                old_score = contractor.trust_score
                new_score = round((avg_trust + random.uniform(-0.5, 0.5)), 1)
                contractor.trust_score = max(1.0, min(10.0, new_score))
                contractor.save()
                
                # Log the score change
                TrustScoreLog.objects.create(
                    contractor=contractor,
                    old_score=old_score,
                    new_score=contractor.trust_score,
                    reason='Updated based on recommendations',
                    calculation_details={
                        'recommendation_count': len(recommendations),
                        'average_trust_level': avg_trust,
                        'method': 'average_with_variance'
                    }
                )
        
        print(f"✅ Created {len(trust_connections)} trust connections and {len(self.quick_jobs)} quick jobs")

    def create_appointments(self):
        """Create appointment records"""
        print("📅 Creating appointment records...")
        
        # Create appointments based on virtual appointments
        for virtual_app in self.virtual_appointments:
            completed_at = None
            if virtual_app.status == 'completed':
                completed_at = virtual_app.scheduled_time + timedelta(minutes=virtual_app.duration_minutes)
            
            Appointment.objects.create(
                customer=virtual_app.customer.user,
                supervisor=virtual_app.supervisor.user,
                service=virtual_app.service,
                type='virtual',
                status='completed' if virtual_app.status == 'completed' else 'confirmed',
                scheduled_time=virtual_app.scheduled_time,
                completed_at=completed_at,
                notes=virtual_app.notes
            )
        
        # Create appointments based on physical visits
        for physical_visit in self.physical_visits:
            scheduled_datetime = datetime.combine(physical_visit.scheduled_date, physical_visit.scheduled_time)
            scheduled_datetime = timezone.make_aware(scheduled_datetime)
            
            completed_at = None
            if physical_visit.status == 'completed':
                completed_at = scheduled_datetime + timedelta(hours=physical_visit.estimated_duration_hours)
            
            Appointment.objects.create(
                customer=physical_visit.customer.user,
                supervisor=physical_visit.supervisor.user,
                service=physical_visit.service,
                type='physical',
                status='completed' if physical_visit.status == 'completed' else 'confirmed',
                scheduled_time=scheduled_datetime,
                completed_at=completed_at,
                notes=physical_visit.supervisor_notes
            )
        
        print(f"✅ Created {Appointment.objects.count()} appointment records")

    def print_summary(self):
        """Print summary of created data"""
        print("\\n" + "="*60)
        print("🎉 SEED DATA GENERATION COMPLETE")
        print("="*60)
        print(f"👥 Users: {User.objects.count()}")
        print(f"   - Customers: {Customer.objects.count()}")
        print(f"   - Contractors: {Contractor.objects.count()}")
        print(f"   - Supervisors: {Supervisor.objects.count()}")
        print(f"\\n🔧 Services & Requirements:")
        print(f"   - Services: {Services.objects.count()}")
        print(f"   - Requirement Categories: {RequirementCategory.objects.count()}")
        print(f"   - Requirements: {Requirements.objects.count()}")
        print(f"   - Contractor Services: {ContractorServices.objects.count()}")
        print(f"   - Supervisor Services: {SupervisorServices.objects.count()}")
        print(f"\\n📋 Tenders & Work:")
        print(f"   - Tenders: {Tenders.objects.count()}")
        print(f"   - Tender Requirements: {TenderRequirement.objects.count()}")
        print(f"   - Tender Contractors: {TenderContractor.objects.count()}")
        print(f"   - Tender Assignments: {TenderAssignment.objects.count()}")
        print(f"   - Tender Milestones: {TenderMilestone.objects.count()}")
        print(f"\\n📅 Appointments:")
        print(f"   - Virtual Appointments: {VirtualAppointment.objects.count()}")
        print(f"   - Physical Visits: {PhysicalVisit.objects.count()}")
        print(f"   - Appointment Records: {Appointment.objects.count()}")
        print(f"   - Tender Creation Assistance: {TenderCreationAssistance.objects.count()}")
        print(f"\\n🤝 Trust Network:")
        print(f"   - Trust Connections: {TrustConnection.objects.count()}")
        print(f"   - Quick Jobs: {QuickJob.objects.count()}")
        print(f"   - Quick Job Interests: {QuickJobInterest.objects.count()}")
        print(f"   - Trust Score Logs: {TrustScoreLog.objects.count()}")
        
        print(f"\\n📊 Status Distribution:")
        print(f"   - Tender Statuses: {dict(Tenders.objects.values_list('status').annotate(count=models.Count('status')))}")
        print(f"   - Quick Job Statuses: {dict(QuickJob.objects.values_list('status').annotate(count=models.Count('status')))}")
        print("="*60)

    def run(self):
        """Run the complete seeding process"""
        print("🚀 Starting Local Konnect data seeding...")
        print("This will create realistic data across all modules\\n")
        
        self.clear_existing_data()
        self.create_services_and_requirements()
        self.create_users()
        self.create_virtual_appointments()
        self.create_physical_visits()
        self.create_tenders()
        self.create_trust_network_data()
        self.create_appointments()
        self.print_summary()
        
        print("\\n✅ All done! Your Local Konnect platform now has realistic data.")


if __name__ == "__main__":
    # Import Count for summary
    from django.db.models import Count
    import django.db.models as models
    
    seeder = LocalKonnectSeeder()
    seeder.run()
