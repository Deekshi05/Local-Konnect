# Local Konnect Seed Data Generator

A comprehensive, modular seed data generation system for the Local Konnect platform. This system creates realistic data across all modules with proper relationships, constraints, and timelines.

## 🚀 Quick Start

### Basic Usage

```bash
# Run complete seed data generation (includes cleanup)
python run_seed_data.py

# Skip database cleanup (keep existing data)
python run_seed_data.py --skip-cleanup

# Only clean database (no data generation)
python run_seed_data.py --cleanup-only
```

### Alternative Usage

```bash
# Direct execution of master seeder
python manage.py shell -c "
from seed_data.master_seeder import LocalKonnectMasterSeeder
seeder = LocalKonnectMasterSeeder()
seeder.run_complete_seed()
"
```

## 📁 Project Structure

```
seed_data/
├── __init__.py                 # Package initialization
├── base_config.py             # Configuration, utilities, fake data setup
├── cleanup.py                 # Database cleanup utilities
├── users.py                   # User accounts creation (customers, contractors, supervisors)
├── services.py                # Services and requirements setup
├── appointments.py            # Virtual appointments and physical visits
├── tenders.py                 # Tenders, bids, assignments, progress tracking
├── trust_network.py           # Trust connections and quick jobs
└── master_seeder.py           # Main orchestrator
run_seed_data.py               # Simple runner script
```

## 🎯 What Gets Created

### Users & Accounts
- **1 Admin User**: `admin@localkonnect.com` (password: `admin123`)
- **50 Customers**: Realistic profiles with Indian cities/states
- **30 Contractors**: Various skill combinations and ratings
- **20 Supervisors**: Qualified professionals with certifications

### Services & Requirements
- **10 Service Categories**: Plumbing, Electrical, Construction, HVAC, etc.
- **30+ Requirement Categories**: Installation, Repair, Maintenance, etc.
- **200+ Individual Requirements**: Detailed service specifications
- **Service Assignments**: Contractors and supervisors linked to their expertise

### Appointments & Consultations
- **60 Virtual Appointments**: Mix of completed and upcoming
- **25 Physical Visits**: Following virtual consultations
- **20 Tender Creation Assistance**: Based on successful visits

### Tenders & Project Management
- **35 Tenders**: Mix of statuses (published, in-progress, completed)
- **Tender Requirements**: Detailed specifications per tender
- **Contractor Assignments**: Bidding and selection process
- **Progress Tracking**: Milestones and completion status
- **Payment Records**: Assignment and payment tracking

### Trust Network & Quick Jobs
- **40 Trust Connections**: User recommendations and ratings
- **35 Quick Jobs**: Urgent/small tasks with various statuses
- **Job Interests**: Contractor responses to quick jobs
- **Trust Score Updates**: Dynamic trust score calculations

## 🔧 Configuration

### Data Counts (Customizable)

```python
config = {
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
```

### Realistic Data Features

- **Indian Locale**: Names, cities, phone numbers
- **Proper Timelines**: Past/present/future dates
- **Realistic Relationships**: Service-contractor matching
- **Status Progression**: Logical workflow states
- **Constraint Compliance**: Foreign keys, unique constraints
- **Error Handling**: Graceful failure with detailed logging

## 🛠️ Technical Features

### Database Safety
- **Transaction Management**: Atomic operations per module
- **Constraint Validation**: Respects all model constraints
- **Duplicate Prevention**: Unique email/phone generation
- **Rollback Support**: Failed operations don't corrupt data

### Error Handling
- **Graceful Failures**: Individual record failures don't stop process
- **Detailed Logging**: Progress tracking and error reporting
- **Retry Logic**: Automatic retry for constraint violations
- **Verification**: Post-cleanup database verification

### Performance
- **Batch Operations**: Efficient bulk creation where possible
- **Memory Management**: Streaming operations for large datasets
- **Progress Tracking**: Real-time progress updates
- **Selective Execution**: Run only specific modules if needed

## 📊 Data Relationships

```
Users (Admin/Customer/Contractor/Supervisor)
├── Services & Requirements
│   ├── ContractorServices (many-to-many)
│   └── SupervisorServices (many-to-many)
├── Virtual Appointments
│   └── Physical Visits
│       └── Tender Creation Assistance
│           └── Tenders
│               ├── Tender Requirements
│               ├── Tender Contractors  
│               ├── Tender Bids
│               ├── Tender Assignments
│               ├── Tender Milestones
│               └── Tender Progress
├── Trust Network
│   ├── Trust Connections
│   └── Quick Jobs
│       └── Quick Job Interests
└── Appointment Records (compatibility)
```

## 🚨 Important Notes

### Before Running
1. **Backup**: Always backup your database before running
2. **Environment**: Ensure all dependencies are installed
3. **Database**: Make sure database is accessible and has proper permissions
4. **Settings**: Verify Django settings are configured correctly

### Data Considerations
- **Volume**: Generates significant amount of data (~1000+ records)
- **Time**: Complete generation takes 30-60 seconds
- **Storage**: Requires adequate database storage space
- **Memory**: Monitor memory usage during generation

### Development vs Production
- **Development**: Safe to run repeatedly
- **Production**: ⚠️ **NEVER run on production database**
- **Testing**: Ideal for testing environments
- **Demo**: Perfect for demo/staging environments

## 🔍 Troubleshooting

### Common Issues

**Permission Errors**
```bash
# Ensure proper database permissions
python manage.py migrate
python manage.py collectstatic
```

**Import Errors**
```bash
# Verify Django setup
python manage.py check
python manage.py shell -c "import django; print(django.get_version())"
```

**Memory Issues**
```bash
# Reduce data counts in config
# Run modules separately
python run_seed_data.py --cleanup-only
# Then run specific modules
```

### Verification

```python
# Check data integrity
from django.db import connection
cursor = connection.cursor()
cursor.execute("SELECT COUNT(*) FROM accounts_user")
print(f"Total users: {cursor.fetchone()[0]}")
```

## 📝 Customization

### Adding New Data Types

1. Create new seeder class in appropriate module
2. Add to master seeder orchestration
3. Update configuration and documentation

### Modifying Data Volumes

Edit the config dictionary in `master_seeder.py`:

```python
self.config = {
    'customers': 100,  # Increase customers
    'contractors': 50,  # Increase contractors
    # ... other counts
}
```

### Custom Business Logic

Modify individual seeder modules to implement specific business rules or data patterns.

## 🤝 Contributing

1. Follow existing code patterns
2. Add error handling for all operations
3. Update documentation for new features
4. Test with various data volumes
5. Ensure backward compatibility

## 📄 License

This seed data system is part of the Local Konnect platform and follows the same licensing terms.
