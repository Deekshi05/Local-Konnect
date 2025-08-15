"""
Tender creation assistance and tenders for seed data
"""

from django.db import transaction
from decimal import Decimal
from datetime import timedelta
import random
from .base_config import config, fake, print_progress

class TendersSeeder:
    def __init__(self):
        self.tender_assistances = []
        self.tenders = []
        self.tender_requirements = []
        self.tender_contractors = []
        self.tender_assignments = []
        self.tender_milestones = []
        self.tender_progress = []

    def create_tender_creation_assistance(self, physical_visits, count=20):
        """Create tender creation assistance records"""
        print_progress(f"📋 Creating {count} tender creation assistance records...")
        
        from works.models import TenderCreationAssistance
        
        if not physical_visits:
            print_progress("❌ No physical visits available for tender assistance")
            return
        
        # Filter physical visits where customer is willing for tender
        willing_visits = [pv for pv in physical_visits if pv.customer_willing_for_tender]
        
        if not willing_visits:
            print_progress("❌ No physical visits with willing customers")
            return
        
        # Limit to requested count or available visits
        target_count = min(count, len(willing_visits))
        selected_visits = random.sample(willing_visits, target_count)
        
        created_count = 0
        
        for i, physical_visit in enumerate(selected_visits):
            try:
                with transaction.atomic():
                    # Generate realistic requirements
                    requirements_count = random.randint(3, 8)
                    requirements_discussed = [
                        f"{physical_visit.service.name} {random.choice(['Installation', 'Repair', 'Upgrade'])} - {fake.catch_phrase()[:30]}"
                        for _ in range(requirements_count)
                    ]
                    
                    assistance = TenderCreationAssistance.objects.create(
                        virtual_appointment=physical_visit.virtual_appointment,
                        physical_visit=physical_visit,
                        customer=physical_visit.customer,
                        supervisor=physical_visit.supervisor,
                        service=physical_visit.service,
                        status='completed',
                        source='physical_visit',
                        requirements_discussed=requirements_discussed,
                        estimated_budget=Decimal(str(random.randint(50000, 500000))),
                        project_timeline_days=random.randint(15, 90),
                        special_instructions=fake.text(max_nb_chars=200),
                        tender_posted=True
                    )
                    self.tender_assistances.append(assistance)
                    created_count += 1
                    
                    if (i + 1) % 5 == 0:
                        print_progress(f"   Created {i + 1}/{target_count} assistance records")
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to create assistance {i+1}: {e}")
                continue
        
        print_progress(f"✅ Successfully created {created_count} tender creation assistance records")
        return self.tender_assistances

    def create_tenders_from_assistance(self, contractors, requirements):
        """Create tenders from assistance records"""
        print_progress(f"📄 Creating tenders from assistance records...")
        
        from works.models import Tenders, TenderRequirement, TenderContractor
        
        if not self.tender_assistances:
            print_progress("❌ No assistance records available")
            return
        
        tender_statuses = ['published', 'in_progress', 'completed', 'cancelled']
        priorities = ['low', 'medium', 'high', 'urgent']
        
        created_count = 0
        
        for i, assistance in enumerate(self.tender_assistances):
            try:
                with transaction.atomic():
                    # Calculate dates
                    start_date = assistance.created_at.date() + timedelta(days=random.randint(1, 5))
                    end_date = start_date + timedelta(days=assistance.project_timeline_days or 30)
                    
                    # Create tender
                    tender = Tenders.objects.create(
                        title=f"{assistance.service.name} Project - {assistance.customer.user.first_name} {assistance.customer.user.last_name}",
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
                        published_at=assistance.created_at + timedelta(days=1)
                    )
                    self.tenders.append(tender)
                    
                    # Update assistance record
                    assistance.tender = tender
                    assistance.save()
                    
                    # Create tender requirements
                    self._create_tender_requirements(tender, assistance.service, requirements)
                    
                    # Add contractors to tender
                    self._assign_contractors_to_tender(tender, contractors)
                    
                    # Handle tender progression
                    self._handle_tender_progression(tender, contractors)
                    
                    created_count += 1
                    
                    if (i + 1) % 5 == 0:
                        print_progress(f"   Created {i + 1}/{len(self.tender_assistances)} tenders")
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to create tender {i+1}: {e}")
                continue
        
        print_progress(f"✅ Successfully created {created_count} tenders from assistance")

    def create_standalone_tenders(self, customers, supervisors, services, contractors, requirements, count=15):
        """Create standalone tenders not from assistance"""
        print_progress(f"📄 Creating {count} standalone tenders...")
        
        from works.models import Tenders
        
        if not all([customers, supervisors, services, contractors]):
            print_progress("❌ Missing required data for standalone tenders")
            return
        
        tender_statuses = ['published', 'in_progress', 'completed', 'cancelled']
        priorities = ['low', 'medium', 'high', 'urgent']
        
        created_count = 0
        
        for i in range(count):
            try:
                with transaction.atomic():
                    customer = random.choice(customers)
                    supervisor = random.choice(supervisors)
                    service = random.choice(services)
                    
                    # Random dates
                    start_date = fake.date_between(start_date=config.three_months_ago, end_date=config.next_month)
                    end_date = start_date + timedelta(days=random.randint(15, 60))
                    
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
                        published_at=start_date - timedelta(days=random.randint(1, 7))
                    )
                    self.tenders.append(tender)
                    
                    # Create requirements and assign contractors
                    self._create_tender_requirements(tender, service, requirements)
                    self._assign_contractors_to_tender(tender, contractors)
                    self._handle_tender_progression(tender, contractors)
                    
                    created_count += 1
                    
                    if (i + 1) % 5 == 0:
                        print_progress(f"   Created {i + 1}/{count} standalone tenders")
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to create standalone tender {i+1}: {e}")
                continue
        
        print_progress(f"✅ Successfully created {created_count} standalone tenders")

    def _create_tender_requirements(self, tender, service, all_requirements):
        """Create requirements for a tender"""
        from works.models import TenderRequirement
        from needs.models import Requirements
        
        # Get requirements for this service
        service_requirements = [req for req in all_requirements if req.category.service == service]
        
        if not service_requirements:
            return
        
        # Select 3-7 random requirements
        selected_requirements = random.sample(
            service_requirements, 
            min(random.randint(3, 7), len(service_requirements))
        )
        
        for req in selected_requirements:
            try:
                tender_req = TenderRequirement.objects.create(
                    tender=tender,
                    requirement=req,
                    category=req.category,
                    quantity=Decimal(str(random.randint(1, 10))),
                    units=req.default_unit,
                    description=fake.text(max_nb_chars=200),
                    is_critical=random.choice([True, False])
                )
                self.tender_requirements.append(tender_req)
                
            except Exception as e:
                print_progress(f"     Warning: Failed to create requirement for tender {tender.id}: {e}")

    def _assign_contractors_to_tender(self, tender, contractors):
        """Assign contractors to tender"""
        from works.models import TenderContractor
        from needs.models import ContractorServices
        
        # Get contractors who provide this service
        service_contractors = ContractorServices.objects.filter(service=tender.service)
        available_contractors = [cs.contractor for cs in service_contractors]
        
        if not available_contractors:
            return
        
        # Select 3-6 contractors
        num_contractors = min(random.randint(3, 6), len(available_contractors))
        selected_contractors = random.sample(available_contractors, num_contractors)
        
        for contractor in selected_contractors:
            try:
                tender_contractor = TenderContractor.objects.create(
                    tender=tender,
                    contractor=contractor,
                    status=random.choice(['invited', 'accepted', 'declined'])
                )
                self.tender_contractors.append(tender_contractor)
                
            except Exception as e:
                print_progress(f"     Warning: Failed to assign contractor {contractor.id} to tender {tender.id}: {e}")

    def _handle_tender_progression(self, tender, contractors):
        """Handle tender progression for in_progress and completed tenders"""
        if tender.status in ['in_progress', 'completed']:
            self._assign_selected_contractor(tender)
            self._create_tender_assignment(tender)
            self._create_tender_progress(tender)
            self._create_tender_milestones(tender)

    def _assign_selected_contractor(self, tender):
        """Assign selected contractor for progressed tenders"""
        from works.models import TenderContractor
        
        accepted_contractors = TenderContractor.objects.filter(tender=tender, status='accepted')
        if accepted_contractors:
            selected_contractor = random.choice(accepted_contractors).contractor
            tender.selected_contractor = selected_contractor
            tender.save()

    def _create_tender_assignment(self, tender):
        """Create tender assignment"""
        from works.models import TenderAssignment
        
        if not tender.selected_contractor:
            return
        
        try:
            assignment = TenderAssignment.objects.create(
                tender=tender,
                contractor=tender.selected_contractor,
                start_date=tender.start_date,
                due_date=tender.end_date,
                total_amount=tender.budget,
                payment_status='paid' if tender.status == 'completed' else random.choice(['pending', 'partially_paid']),
                actual_completion_date=tender.end_date if tender.status == 'completed' else None
            )
            self.tender_assignments.append(assignment)
            
        except Exception as e:
            print_progress(f"     Warning: Failed to create assignment for tender {tender.id}: {e}")

    def _create_tender_progress(self, tender):
        """Create tender progress tracking"""
        from works.models import TenderProgress
        
        try:
            progress = TenderProgress.objects.create(
                tender=tender,
                percent_complete=100 if tender.status == 'completed' else random.randint(20, 80),
                current_phase=random.choice(['planning', 'execution', 'completion', 'review']),
                notes=fake.text(max_nb_chars=200)
            )
            self.tender_progress.append(progress)
            
        except Exception as e:
            print_progress(f"     Warning: Failed to create progress for tender {tender.id}: {e}")

    def _create_tender_milestones(self, tender):
        """Create milestones for tender"""
        from works.models import TenderMilestone
        
        milestone_count = random.randint(3, 6)
        milestone_names = ['Planning & Design', 'Material Procurement', 'Execution Phase 1', 'Execution Phase 2', 'Quality Check', 'Completion & Handover']
        
        for i in range(min(milestone_count, len(milestone_names))):
            try:
                milestone_date = tender.start_date + timedelta(days=i * (tender.end_date - tender.start_date).days // milestone_count)
                completed = tender.status == 'completed' or (milestone_date < config.today and random.choice([True, False]))
                
                milestone = TenderMilestone.objects.create(
                    tender=tender,
                    title=f"Milestone {i+1}: {milestone_names[i]}",
                    description=fake.text(max_nb_chars=150),
                    due_date=milestone_date,
                    completed_date=milestone_date if completed else None,
                    status='completed' if completed else random.choice(['pending', 'in_progress']),
                    completion_notes=fake.text(max_nb_chars=100) if completed else ''
                )
                self.tender_milestones.append(milestone)
                
            except Exception as e:
                print_progress(f"     Warning: Failed to create milestone {i+1} for tender {tender.id}: {e}")

    def create_all_tenders(self, physical_visits, customers, supervisors, services, contractors, requirements, assistance_count=20, standalone_count=15):
        """Create all tenders"""
        print_progress("🚀 Starting tenders creation process...")
        
        # Create tender creation assistance
        self.create_tender_creation_assistance(physical_visits, assistance_count)
        
        # Create tenders from assistance
        self.create_tenders_from_assistance(contractors, requirements)
        
        # Create standalone tenders
        self.create_standalone_tenders(customers, supervisors, services, contractors, requirements, standalone_count)
        
        # Summary
        print_progress(f"✅ Tenders creation completed!")
        print_progress(f"   - Tender Assistances: {len(self.tender_assistances)}")
        print_progress(f"   - Tenders: {len(self.tenders)}")
        print_progress(f"   - Tender Requirements: {len(self.tender_requirements)}")
        print_progress(f"   - Tender Contractors: {len(self.tender_contractors)}")
        print_progress(f"   - Tender Assignments: {len(self.tender_assignments)}")
        print_progress(f"   - Tender Milestones: {len(self.tender_milestones)}")
        print_progress(f"   - Tender Progress: {len(self.tender_progress)}")
        
        return {
            'tender_assistances': self.tender_assistances,
            'tenders': self.tenders,
            'tender_requirements': self.tender_requirements,
            'tender_contractors': self.tender_contractors,
            'tender_assignments': self.tender_assignments,
            'tender_milestones': self.tender_milestones,
            'tender_progress': self.tender_progress
        }
