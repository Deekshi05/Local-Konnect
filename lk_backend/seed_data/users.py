"""
User and account creation for seed data
"""

from django.db import transaction
from decimal import Decimal
import random
from .base_config import config, fake, safe_create_with_retry, print_progress

class UserSeeder:
    def __init__(self):
        self.users = []
        self.customers = []
        self.contractors = []
        self.supervisors = []

    def create_admin_user(self):
        """Create admin user"""
        print_progress("👑 Creating admin user...")
        
        from accounts.models import User
        
        admin_user = safe_create_with_retry(
            User,
            email='admin@localkonnect.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role=User.Roles.ADMIN,
            phone_number='+91-9876543210'
        )
        
        if admin_user:
            admin_user.set_password('admin123')
            admin_user.is_superuser = True
            admin_user.save()
            self.users.append(admin_user)
            print_progress("✅ Admin user created successfully")
        else:
            print_progress("❌ Failed to create admin user")
        
        return admin_user

    def create_customers(self, count=50):
        """Create customer accounts"""
        print_progress(f"👥 Creating {count} customers...")
        
        from accounts.models import User, Customer
        
        created_count = 0
        for i in range(count):
            try:
                with transaction.atomic():
                    city, state = random.choice(config.indian_cities)
                    
                    # Generate unique email
                    first_name = fake.first_name()
                    last_name = fake.last_name()
                    domain = fake.domain_name()
                    email = f'{first_name.lower()}.{last_name.lower()}.customer{i+1}@{domain}'
                    
                    user = User.objects.create_user(
                        email=email,
                        password='password123',
                        first_name=first_name,
                        last_name=last_name,
                        role=User.Roles.CUSTOMER,
                        phone_number=f'+91-{fake.numerify("##########")}'
                    )
                    self.users.append(user)
                    
                    customer = Customer.objects.create(
                        user=user,
                        city=city,
                        state=state,
                        address=fake.address()
                    )
                    self.customers.append(customer)
                    created_count += 1
                    
                    if (i + 1) % 10 == 0:
                        print_progress(f"   Created {i + 1}/{count} customers")
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to create customer {i+1}: {e}")
                continue
        
        print_progress(f"✅ Successfully created {created_count} customers")
        return self.customers

    def create_contractors(self, count=30):
        """Create contractor accounts"""
        print_progress(f"🔨 Creating {count} contractors...")
        
        from accounts.models import User, Contractor
        
        created_count = 0
        for i in range(count):
            try:
                with transaction.atomic():
                    city, state = random.choice(config.indian_cities)
                    
                    # Generate unique email
                    first_name = fake.first_name()
                    last_name = fake.last_name()
                    domain = fake.domain_name()
                    email = f'{first_name.lower()}.{last_name.lower()}.contractor{i+1}@{domain}'
                    
                    user = User.objects.create_user(
                        email=email,
                        password='password123',
                        first_name=first_name,
                        last_name=last_name,
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
                    created_count += 1
                    
                    if (i + 1) % 10 == 0:
                        print_progress(f"   Created {i + 1}/{count} contractors")
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to create contractor {i+1}: {e}")
                continue
        
        print_progress(f"✅ Successfully created {created_count} contractors")
        return self.contractors

    def create_supervisors(self, count=20):
        """Create supervisor accounts"""
        print_progress(f"👨‍💼 Creating {count} supervisors...")
        
        from accounts.models import User, Supervisor
        
        qualifications = [
            'B.Tech in Civil Engineering', 'B.Tech in Mechanical Engineering', 
            'B.Tech in Electrical Engineering', 'M.Tech in Construction Management',
            'Diploma in Civil Engineering', 'B.Arch Architecture', 'M.Tech in Structural Engineering',
            'Diploma in Electrical Engineering', 'B.E. Civil Engineering', 'M.Tech in Environmental Engineering'
        ]
        
        created_count = 0
        for i in range(count):
            try:
                with transaction.atomic():
                    city, state = random.choice(config.indian_cities)
                    
                    # Generate unique email
                    first_name = fake.first_name()
                    last_name = fake.last_name()
                    domain = fake.domain_name()
                    email = f'{first_name.lower()}.{last_name.lower()}.supervisor{i+1}@{domain}'
                    
                    user = User.objects.create_user(
                        email=email,
                        password='password123',
                        first_name=first_name,
                        last_name=last_name,
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
                        qualification=random.choice(qualifications),
                        total_consultations=random.randint(20, 200),
                        verified=True,
                        bio=fake.text(max_nb_chars=200)
                    )
                    self.supervisors.append(supervisor)
                    created_count += 1
                    
                    if (i + 1) % 5 == 0:
                        print_progress(f"   Created {i + 1}/{count} supervisors")
                        
            except Exception as e:
                print_progress(f"   Warning: Failed to create supervisor {i+1}: {e}")
                continue
        
        print_progress(f"✅ Successfully created {created_count} supervisors")
        return self.supervisors

    def create_all_users(self, customers=50, contractors=30, supervisors=20):
        """Create all types of users"""
        print_progress("🚀 Starting user creation process...")
        
        # Create admin first
        self.create_admin_user()
        
        # Create user types
        self.create_customers(customers)
        self.create_contractors(contractors)
        self.create_supervisors(supervisors)
        
        # Summary
        total_users = len(self.users)
        print_progress(f"✅ User creation completed!")
        print_progress(f"   Total Users: {total_users}")
        print_progress(f"   - Admin: 1")
        print_progress(f"   - Customers: {len(self.customers)}")
        print_progress(f"   - Contractors: {len(self.contractors)}")
        print_progress(f"   - Supervisors: {len(self.supervisors)}")
        
        return {
            'users': self.users,
            'customers': self.customers,
            'contractors': self.contractors,
            'supervisors': self.supervisors
        }
