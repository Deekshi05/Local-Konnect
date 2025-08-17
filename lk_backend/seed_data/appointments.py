"""
Appointments and consultations creation for seed data
"""

from django.db import transaction
from datetime import time, timedelta
import random
from .base_config import config, fake, print_progress

class AppointmentsSeeder:
    def __init__(self):
        self.virtual_appointments = []
        self.physical_visits = []
        self.appointment_records = []

    def create_virtual_appointments(self, customers, supervisors, services, count=60):
        """Create virtual appointments with realistic timelines"""
        print_progress(f"📅 Creating {count} virtual appointments...")
        
        from works.models import VirtualAppointment
        
        if not customers or not supervisors or not services:
            print_progress("❌ Missing required data for virtual appointments")
            return
        
        created_count = 0
        
        # Split between past (completed) and future appointments
        past_count = int(count * 0.7)  # 70% past appointments
        future_count = count - past_count
        
        # Create past appointments (completed)
        for i in range(past_count):
            try:
                with transaction.atomic():
                    customer = random.choice(customers)
                    supervisor = random.choice(supervisors)
                    service = random.choice(services)
                    
                    # Random date in the past 6 months
                    scheduled_time = fake.date_time_between(
                        start_date=config.six_months_ago,
                        end_date=config.one_week_ago
                    )
                    
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
                    created_count += 1
                    
                    if (i + 1) % 10 == 0:
                        print_progress(f"   Created {i + 1}/{past_count} past appointments")
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to create past appointment {i+1}: {e}")
                continue
        
        # Create future appointments
        for i in range(future_count):
            try:
                with transaction.atomic():
                    customer = random.choice(customers)
                    supervisor = random.choice(supervisors)
                    service = random.choice(services)
                    
                    # Random date in the future
                    scheduled_time = fake.date_time_between(
                        start_date=config.tomorrow,
                        end_date=config.next_month
                    )
                    
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
                    created_count += 1
                    
            except Exception as e:
                print_progress(f"   Warning: Failed to create future appointment {i+1}: {e}")
                continue
        
        print_progress(f"✅ Successfully created {created_count} virtual appointments")
        return self.virtual_appointments

    def create_physical_visits(self, count=25):
        """Create physical visits following virtual appointments"""
        print_progress(f"🏠 Creating {count} physical visits...")
        
        from works.models import PhysicalVisit
        
        if not self.virtual_appointments:
            print_progress("❌ No virtual appointments available for physical visits")
            return
        
        # Get completed virtual appointments that require physical visits
        eligible_appointments = [
            va for va in self.virtual_appointments 
            if va.status == 'completed' and va.physical_visit_required
        ]
        
        if not eligible_appointments:
            print_progress("❌ No eligible virtual appointments for physical visits")
            return
        
        # Limit to requested count or available appointments
        target_count = min(count, len(eligible_appointments))
        selected_appointments = random.sample(eligible_appointments, target_count)
        
        created_count = 0
        
        for i, virtual_app in enumerate(selected_appointments):
            try:
                with transaction.atomic():
                    # Schedule visit 1-7 days after virtual appointment
                    visit_date = virtual_app.scheduled_time.date() + timedelta(days=random.randint(1, 7))
                    
                    # Random time during business hours
                    visit_time = time(random.randint(9, 17), random.choice([0, 30]))
                    
                    physical_visit = PhysicalVisit.objects.create(
                        virtual_appointment=virtual_app,
                        customer=virtual_app.customer,
                        supervisor=virtual_app.supervisor,
                        service=virtual_app.service,
                        visit_address=fake.address(),
                        scheduled_date=visit_date,
                        scheduled_time=visit_time,
                        estimated_duration_hours=random.randint(2, 6),
                        visit_fee=random.randint(500, 2000),
                        status='completed',
                        payment_status='paid',
                        payment_transaction_id=fake.uuid4()[:16],
                        supervisor_notes=fake.text(max_nb_chars=200),
                        customer_willing_for_tender=random.choice([True, False])
                    )
                    self.physical_visits.append(physical_visit)
                    created_count += 1
                    
                    if (i + 1) % 5 == 0:
                        print_progress(f"   Created {i + 1}/{target_count} physical visits")
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to create physical visit {i+1}: {e}")
                continue
        
        print_progress(f"✅ Successfully created {created_count} physical visits")
        return self.physical_visits

    def create_appointment_records(self):
        """Create appointment records for compatibility"""
        print_progress("📋 Creating appointment records...")
        
        from appointments.models import Appointment
        
        created_count = 0
        
        try:
            with transaction.atomic():
                # Create records for virtual appointments
                for virtual_app in self.virtual_appointments:
                    try:
                        appointment = Appointment.objects.create(
                            customer=virtual_app.customer.user,
                            supervisor=virtual_app.supervisor.user,
                            service=virtual_app.service,
                            type='virtual',
                            status='completed' if virtual_app.status == 'completed' else 'confirmed',
                            scheduled_time=virtual_app.scheduled_time,
                            completed_at=(
                                virtual_app.scheduled_time + timedelta(minutes=virtual_app.duration_minutes)
                                if virtual_app.status == 'completed' else None
                            ),
                            notes=virtual_app.notes or ''
                        )
                        self.appointment_records.append(appointment)
                        created_count += 1
                        
                    except Exception as e:
                        print_progress(f"   Warning: Failed to create appointment record for virtual appointment {virtual_app.id}: {e}")
                        continue
                
                # Create records for physical visits
                for physical_visit in self.physical_visits:
                    try:
                        from datetime import datetime
                        scheduled_datetime = datetime.combine(
                            physical_visit.scheduled_date,
                            physical_visit.scheduled_time
                        )
                        
                        appointment = Appointment.objects.create(
                            customer=physical_visit.customer.user,
                            supervisor=physical_visit.supervisor.user,
                            service=physical_visit.service,
                            type='physical',
                            status='completed' if physical_visit.status == 'completed' else 'confirmed',
                            scheduled_time=scheduled_datetime,
                            completed_at=(
                                scheduled_datetime + timedelta(hours=physical_visit.estimated_duration_hours)
                                if physical_visit.status == 'completed' else None
                            ),
                            notes=physical_visit.supervisor_notes or ''
                        )
                        self.appointment_records.append(appointment)
                        created_count += 1
                        
                    except Exception as e:
                        print_progress(f"   Warning: Failed to create appointment record for physical visit {physical_visit.id}: {e}")
                        continue
        
        except Exception as e:
            print_progress(f"❌ Error creating appointment records: {e}")
            return
        
        print_progress(f"✅ Successfully created {created_count} appointment records")
        return self.appointment_records

    def create_all_appointments(self, customers, supervisors, services, virtual_count=60, physical_count=25):
        """Create all types of appointments"""
        print_progress("🚀 Starting appointments creation process...")
        
        # Create virtual appointments first
        self.create_virtual_appointments(customers, supervisors, services, virtual_count)
        
        # Create physical visits based on virtual appointments
        self.create_physical_visits(physical_count)
        
        # Create appointment records for compatibility
        self.create_appointment_records()
        
        # Summary
        print_progress(f"✅ Appointments creation completed!")
        print_progress(f"   - Virtual Appointments: {len(self.virtual_appointments)}")
        print_progress(f"   - Physical Visits: {len(self.physical_visits)}")
        print_progress(f"   - Appointment Records: {len(self.appointment_records)}")
        
        return {
            'virtual_appointments': self.virtual_appointments,
            'physical_visits': self.physical_visits,
            'appointment_records': self.appointment_records
        }
