"""
Trust network and quick jobs creation for seed data
"""

from django.db import transaction
from decimal import Decimal
from datetime import timedelta
import random
from .base_config import config, fake, print_progress

class TrustNetworkSeeder:
    def __init__(self):
        self.trust_connections = []
        self.quick_jobs = []
        self.quick_job_interests = []
        self.trust_score_logs = []

    def create_trust_connections(self, users, contractors, services, tenders, count=40):
        """Create trust connections based on completed work"""
        print_progress(f"🤝 Creating {count} trust connections...")
        
        from trust_network.models import TrustConnection
        from works.models import Tenders
        
        if not all([users, contractors, services]):
            print_progress("❌ Missing required data for trust connections")
            return
        
        created_count = 0
        
        # Create connections based on completed tenders
        completed_tenders = [t for t in tenders if t.status == 'completed' and t.selected_contractor]
        
        for tender in completed_tenders:
            try:
                # Customer recommends the contractor they worked with
                if random.choice([True, True, False]):  # 66% chance
                    with transaction.atomic():
                        # Check if connection already exists
                        if not TrustConnection.objects.filter(
                            recommender=tender.customer.user,
                            contractor=tender.selected_contractor
                        ).exists():
                            connection = TrustConnection.objects.create(
                                recommender=tender.customer.user,
                                contractor=tender.selected_contractor,
                                comment=fake.text(max_nb_chars=200),
                                trust_level=random.randint(7, 10),  # Higher trust for completed work
                                service_context=tender.service
                            )
                            self.trust_connections.append(connection)
                            created_count += 1
                            
            except Exception as e:
                print_progress(f"   Warning: Failed to create trust connection for tender {tender.id}: {e}")
                continue
        
        # Create additional random recommendations to reach target count
        remaining_count = count - created_count
        if remaining_count > 0:
            for i in range(remaining_count):
                try:
                    with transaction.atomic():
                        recommender = random.choice(users)
                        contractor = random.choice(contractors)
                        service = random.choice(services)
                        
                        # Avoid duplicate recommendations
                        if not TrustConnection.objects.filter(
                            recommender=recommender,
                            contractor=contractor
                        ).exists():
                            connection = TrustConnection.objects.create(
                                recommender=recommender,
                                contractor=contractor,
                                comment=fake.text(max_nb_chars=150),
                                trust_level=random.randint(5, 9),
                                service_context=service
                            )
                            self.trust_connections.append(connection)
                            created_count += 1
                            
                            if created_count % 10 == 0:
                                print_progress(f"   Created {created_count}/{count} trust connections")
                            
                except Exception as e:
                    print_progress(f"   Warning: Failed to create random trust connection {i+1}: {e}")
                    continue
        
        print_progress(f"✅ Successfully created {created_count} trust connections")
        return self.trust_connections

    def create_quick_jobs(self, users, services, contractors, count=35):
        """Create quick jobs with various statuses"""
        print_progress(f"⚡ Creating {count} quick jobs...")
        
        from trust_network.models import QuickJob, QuickJobInterest
        from needs.models import ContractorServices
        
        if not all([users, services]):
            print_progress("❌ Missing required data for quick jobs")
            return
        
        job_statuses = ['OPEN', 'ASSIGNED', 'COMPLETED', 'CANCELLED']
        urgency_levels = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
        
        # Filter customers only
        customers = [u for u in users if u.role == 'CUSTOMER']
        
        if not customers:
            print_progress("❌ No customers available for quick jobs")
            return
        
        created_count = 0
        
        for i in range(count):
            try:
                with transaction.atomic():
                    customer = random.choice(customers)
                    service = random.choice(services)
                    
                    # Random creation date in the past 3 months
                    created_date = fake.date_time_between(
                        start_date=config.three_months_ago,
                        end_date=config.today
                    )
                    
                    status = random.choice(job_statuses)
                    urgency = random.choice(urgency_levels)
                    
                    quick_job = QuickJob.objects.create(
                        customer=customer,
                        service=service,
                        title=f"Quick {service.name} Job - {fake.catch_phrase()[:30]}",
                        description=fake.text(max_nb_chars=300),
                        location=fake.address(),
                        status=status,
                        urgency=urgency,
                        budget_suggestion=Decimal(str(random.randint(500, 5000))),
                        created_at=created_date,
                        raw_query=f"Need {service.name.lower()} service {urgency.lower()} - {fake.sentence()}",
                        parsed_intent={
                            'service': service.name,
                            'urgency': urgency,
                            'location_mentioned': customer.customer.city if hasattr(customer, 'customer') else ''
                        }
                    )
                    self.quick_jobs.append(quick_job)
                    
                    # Handle job assignment and completion
                    self._handle_quick_job_progression(quick_job, contractors, created_date)
                    
                    # Create contractor interests for open jobs
                    if status == 'OPEN':
                        self._create_quick_job_interests(quick_job, service, contractors)
                    
                    created_count += 1
                    
                    if (i + 1) % 10 == 0:
                        print_progress(f"   Created {i + 1}/{count} quick jobs")
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to create quick job {i+1}: {e}")
                continue
        
        print_progress(f"✅ Successfully created {created_count} quick jobs")
        return self.quick_jobs

    def _handle_quick_job_progression(self, quick_job, contractors, created_date):
        """Handle job assignment and completion"""
        from needs.models import ContractorServices
        
        if quick_job.status in ['ASSIGNED', 'COMPLETED']:
            # Find contractors who provide this service
            service_contractors = ContractorServices.objects.filter(service=quick_job.service)
            available_contractors = [cs.contractor for cs in service_contractors]
            
            if available_contractors:
                contractor = random.choice(available_contractors)
                quick_job.assigned_contractor = contractor
                quick_job.assigned_at = created_date + timedelta(hours=random.randint(1, 24))
                
                if quick_job.status == 'COMPLETED':
                    quick_job.completed_at = quick_job.assigned_at + timedelta(hours=random.randint(2, 48))
                
                quick_job.save()

    def _create_quick_job_interests(self, quick_job, service, contractors):
        """Create contractor interests for open jobs"""
        from trust_network.models import QuickJobInterest
        from needs.models import ContractorServices
        
        # Get contractors who provide this service
        service_contractors = ContractorServices.objects.filter(service=service)
        available_contractors = [cs.contractor for cs in service_contractors]
        
        if not available_contractors:
            return
        
        # Select 1-4 interested contractors
        num_interested = min(random.randint(1, 4), len(available_contractors))
        interested_contractors = random.sample(available_contractors, num_interested)
        
        for contractor in interested_contractors:
            try:
                budget = float(quick_job.budget_suggestion)
                min_price = int(budget * 0.8)
                max_price = int(budget * 1.2)
                
                interest = QuickJobInterest.objects.create(
                    quick_job=quick_job,
                    contractor=contractor,
                    message=fake.text(max_nb_chars=100),
                    proposed_price=Decimal(str(random.randint(min_price, max_price)))
                )
                self.quick_job_interests.append(interest)
                
            except Exception as e:
                print_progress(f"     Warning: Failed to create interest for job {quick_job.id}: {e}")

    def update_contractor_trust_scores(self, contractors):
        """Update contractor trust scores based on recommendations"""
        print_progress("📈 Updating contractor trust scores...")
        
        from trust_network.models import TrustConnection, TrustScoreLog
        
        updated_count = 0
        
        for contractor in contractors:
            try:
                with transaction.atomic():
                    recommendations = TrustConnection.objects.filter(contractor=contractor)
                    
                    if recommendations:
                        # Calculate weighted average trust score
                        total_trust = sum(rec.trust_level for rec in recommendations)
                        recommendation_count = len(recommendations)
                        avg_trust = total_trust / recommendation_count
                        
                        # Add some variance for realism
                        variance = random.uniform(-0.5, 0.5)
                        old_score = contractor.trust_score
                        new_score = max(1.0, min(10.0, round(avg_trust + variance, 1)))
                        
                        if old_score != new_score:
                            contractor.trust_score = new_score
                            contractor.save()
                            
                            # Log the score change
                            log = TrustScoreLog.objects.create(
                                contractor=contractor,
                                old_score=old_score,
                                new_score=new_score,
                                reason='Updated based on recommendations',
                                calculation_details={
                                    'recommendation_count': recommendation_count,
                                    'average_trust_level': avg_trust,
                                    'variance_applied': variance,
                                    'method': 'weighted_average_with_variance'
                                }
                            )
                            self.trust_score_logs.append(log)
                            updated_count += 1
                            
            except Exception as e:
                print_progress(f"   Warning: Failed to update trust score for contractor {contractor.id}: {e}")
                continue
        
        print_progress(f"✅ Updated trust scores for {updated_count} contractors")

    def create_all_trust_network_data(self, users, contractors, services, tenders, trust_count=40, jobs_count=35):
        """Create all trust network related data"""
        print_progress("🚀 Starting trust network creation process...")
        
        # Create trust connections
        self.create_trust_connections(users, contractors, services, tenders, trust_count)
        
        # Create quick jobs
        self.create_quick_jobs(users, services, contractors, jobs_count)
        
        # Update contractor trust scores
        self.update_contractor_trust_scores(contractors)
        
        # Summary
        print_progress(f"✅ Trust network creation completed!")
        print_progress(f"   - Trust Connections: {len(self.trust_connections)}")
        print_progress(f"   - Quick Jobs: {len(self.quick_jobs)}")
        print_progress(f"   - Quick Job Interests: {len(self.quick_job_interests)}")
        print_progress(f"   - Trust Score Logs: {len(self.trust_score_logs)}")
        
        return {
            'trust_connections': self.trust_connections,
            'quick_jobs': self.quick_jobs,
            'quick_job_interests': self.quick_job_interests,
            'trust_score_logs': self.trust_score_logs
        }
