"""
Services and requirements creation for seed data
"""

from django.db import transaction
import random
from .base_config import config, print_progress

class ServicesSeeder:
    def __init__(self):
        self.services = []
        self.categories = []
        self.requirements = []

    def create_services_and_requirements(self):
        """Create all services with their categories and requirements"""
        print_progress("🔧 Creating services and requirements...")
        
        from needs.models import Services, RequirementCategory, Requirements
        
        total_services = len(config.services_data)
        
        for i, service_data in enumerate(config.services_data):
            try:
                with transaction.atomic():
                    # Create service
                    service = Services.objects.create(
                        name=service_data['name'],
                        description=service_data['description']
                    )
                    self.services.append(service)
                    
                    print_progress(f"   Created service: {service.name}", i+1, total_services)
                    
                    # Create categories and requirements for this service
                    self._create_categories_for_service(service, service_data['categories'])
                    
            except Exception as e:
                print_progress(f"   ❌ Failed to create service {service_data['name']}: {e}")
                continue
        
        print_progress(f"✅ Successfully created {len(self.services)} services")
        print_progress(f"   - Categories: {len(self.categories)}")
        print_progress(f"   - Requirements: {len(self.requirements)}")
        
        return {
            'services': self.services,
            'categories': self.categories,
            'requirements': self.requirements
        }

    def _create_categories_for_service(self, service, categories_data):
        """Create categories and requirements for a specific service"""
        from needs.models import RequirementCategory, Requirements
        
        for category_name, requirements_list in categories_data.items():
            try:
                # Create category
                category = RequirementCategory.objects.create(
                    name=category_name,
                    description=f"{category_name} services for {service.name}",
                    service=service
                )
                self.categories.append(category)
                
                # Create requirements for this category
                for req_name in requirements_list:
                    try:
                        # Determine default unit based on requirement type
                        default_unit = self._determine_unit(req_name, category_name)
                        
                        requirement = Requirements.objects.create(
                            name=req_name,
                            description=f"Professional {req_name.lower()} service",
                            category=category,
                            default_unit=default_unit
                        )
                        self.requirements.append(requirement)
                        
                    except Exception as e:
                        print_progress(f"     Warning: Failed to create requirement {req_name}: {e}")
                        continue
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to create category {category_name}: {e}")
                continue

    def _determine_unit(self, requirement_name, category_name):
        """Determine appropriate unit for requirement"""
        req_lower = requirement_name.lower()
        
        # Area-based services
        if any(word in req_lower for word in ['painting', 'tiling', 'flooring', 'cleaning', 'waterproofing']):
            return 'sqft'
        
        # Length-based services  
        elif any(word in req_lower for word in ['pipe', 'wiring', 'cable', 'duct']):
            return 'ft'
        
        # Count-based services
        elif any(word in req_lower for word in ['installation', 'repair', 'replacement', 'fixture', 'outlet', 'switch']):
            return 'piece'
        
        # Volume-based services
        elif any(word in req_lower for word in ['concrete', 'cement', 'sand']):
            return 'cft'
        
        # Weight-based services
        elif any(word in req_lower for word in ['steel', 'iron', 'metal']):
            return 'kg'
        
        # Time-based services
        elif any(word in req_lower for word in ['maintenance', 'inspection', 'consultation', 'design']):
            return 'hour'
        
        # Default to service unit
        else:
            return 'service'

    def assign_contractor_services(self, contractors):
        """Assign services to contractors based on their skills"""
        print_progress("🔗 Assigning services to contractors...")
        
        from needs.models import ContractorServices
        
        if not self.services:
            print_progress("❌ No services available to assign")
            return
        
        total_assignments = 0
        
        for i, contractor in enumerate(contractors):
            try:
                with transaction.atomic():
                    # Get contractor skills from predefined patterns
                    skill_pattern = random.choice(config.contractor_skills)
                    
                    for skill in skill_pattern:
                        # Find matching service
                        service = next((s for s in self.services if s.name == skill), None)
                        if service:
                            # Check if assignment already exists
                            if not ContractorServices.objects.filter(
                                contractor=contractor, 
                                service=service
                            ).exists():
                                ContractorServices.objects.create(
                                    contractor=contractor,
                                    service=service
                                )
                                total_assignments += 1
                    
                    if (i + 1) % 10 == 0:
                        print_progress(f"   Processed {i + 1}/{len(contractors)} contractors")
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to assign services to contractor {contractor.id}: {e}")
                continue
        
        print_progress(f"✅ Created {total_assignments} contractor-service assignments")

    def assign_supervisor_services(self, supervisors):
        """Assign services to supervisors with rates and availability"""
        print_progress("👨‍💼 Assigning services to supervisors...")
        
        from works.models import SupervisorServices
        
        if not self.services:
            print_progress("❌ No services available to assign")
            return
        
        total_assignments = 0
        
        for i, supervisor in enumerate(supervisors):
            try:
                with transaction.atomic():
                    # Each supervisor specializes in 2-4 services
                    num_specialties = random.randint(2, 4)
                    supervisor_services = random.sample(self.services, min(num_specialties, len(self.services)))
                    
                    for service in supervisor_services:
                        # Check if assignment already exists
                        if not SupervisorServices.objects.filter(
                            supervisor=supervisor,
                            service=service
                        ).exists():
                            SupervisorServices.objects.create(
                                supervisor=supervisor,
                                service=service,
                                hourly_rate=random.randint(500, 2000),
                                physical_visit_fee=random.randint(200, 1000),
                                years_experience=random.randint(3, 15),
                                expertise_level=random.choice(['intermediate', 'senior', 'expert']),
                                specializations=[f"{service.name} {random.choice(['Installation', 'Repair', 'Maintenance'])}"],
                                languages=['English', 'Hindi'],
                                available_days=[1, 2, 3, 4, 5]  # Monday to Friday
                            )
                            total_assignments += 1
                    
                    if (i + 1) % 5 == 0:
                        print_progress(f"   Processed {i + 1}/{len(supervisors)} supervisors")
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to assign services to supervisor {supervisor.id}: {e}")
                continue
        
        print_progress(f"✅ Created {total_assignments} supervisor-service assignments")

    def create_all_services(self, contractors=None, supervisors=None):
        """Create all services and assign them to users"""
        print_progress("🚀 Starting services creation process...")
        
        # Create services, categories, and requirements
        result = self.create_services_and_requirements()
        
        # Assign services to contractors and supervisors if provided
        if contractors:
            self.assign_contractor_services(contractors)
        
        if supervisors:
            self.assign_supervisor_services(supervisors)
        
        return result
