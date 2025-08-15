"""
Base configuration and common utilities for seed data generation
"""

import os
import sys
import django
from datetime import datetime, timedelta, date, time
from decimal import Decimal
import random
from faker import Faker
from django.utils import timezone
from django.db import transaction
import pytz

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'lk_backend.settings')
django.setup()

# Initialize Faker with Indian locale
fake = Faker('en_IN')

class SeedDataConfig:
    """Configuration class for seed data generation"""
    
    def __init__(self):
        # Date ranges for realistic timelines
        self.today = date.today()
        self.six_months_ago = self.today - timedelta(days=180)
        self.three_months_ago = self.today - timedelta(days=90)
        self.one_month_ago = self.today - timedelta(days=30)
        self.one_week_ago = self.today - timedelta(days=7)
        self.tomorrow = self.today + timedelta(days=1)
        self.next_week = self.today + timedelta(days=7)
        self.next_month = self.today + timedelta(days=30)
        
        # Indian cities for realistic data
        self.indian_cities = [
            ('Mumbai', 'Maharashtra'), ('Delhi', 'Delhi'), ('Bangalore', 'Karnataka'),
            ('Hyderabad', 'Telangana'), ('Chennai', 'Tamil Nadu'), ('Kolkata', 'West Bengal'),
            ('Pune', 'Maharashtra'), ('Ahmedabad', 'Gujarat'), ('Jaipur', 'Rajasthan'),
            ('Lucknow', 'Uttar Pradesh'), ('Kanpur', 'Uttar Pradesh'), ('Nagpur', 'Maharashtra'),
            ('Surat', 'Gujarat'), ('Indore', 'Madhya Pradesh'), ('Vadodara', 'Gujarat'),
            ('Bhopal', 'Madhya Pradesh'), ('Coimbatore', 'Tamil Nadu'), ('Ludhiana', 'Punjab'),
            ('Agra', 'Uttar Pradesh'), ('Kochi', 'Kerala'), ('Visakhapatnam', 'Andhra Pradesh'),
            ('Nashik', 'Maharashtra'), ('Faridabad', 'Haryana'), ('Meerut', 'Uttar Pradesh')
        ]
        
        # Services data structure
        self.services_data = [
            {
                'name': 'Plumbing',
                'description': 'Professional plumbing services for residential and commercial properties including installation, repair, and maintenance of water systems, pipes, fixtures, and drainage.',
                'categories': {
                    'Installation': [
                        'Water Pipe Installation', 'Drainage Pipe Installation', 'Faucet Installation', 
                        'Toilet Installation', 'Sink Installation', 'Water Heater Installation',
                        'Shower Installation', 'Bathtub Installation', 'Water Filter Installation'
                    ],
                    'Repair': [
                        'Pipe Leak Repair', 'Drain Cleaning', 'Faucet Repair', 'Toilet Repair',
                        'Water Heater Repair', 'Valve Repair', 'Pump Repair', 'Sewage Line Repair'
                    ],
                    'Maintenance': [
                        'Preventive Maintenance', 'System Inspection', 'Water Quality Testing',
                        'Pipe Cleaning', 'Tank Cleaning', 'Pressure Testing'
                    ]
                }
            },
            {
                'name': 'Electrical',
                'description': 'Certified electrical services for homes and businesses including wiring, installations, repairs, and safety inspections.',
                'categories': {
                    'Installation': [
                        'House Wiring', 'Commercial Wiring', 'Light Fixture Installation', 
                        'Fan Installation', 'Socket Installation', 'Switch Installation',
                        'MCB Panel Installation', 'Inverter Installation', 'Generator Installation'
                    ],
                    'Repair': [
                        'Short Circuit Repair', 'Appliance Repair', 'Wiring Fault Repair',
                        'Switch Repair', 'Socket Repair', 'Emergency Electrical Repair',
                        'Power Restoration', 'Voltage Stabilizer Repair'
                    ],
                    'Upgrade': [
                        'Panel Upgrade', 'Smart Home Installation', 'Energy Efficiency Upgrades',
                        'LED Conversion', 'Automation Installation', 'Security System Wiring'
                    ]
                }
            },
            {
                'name': 'Construction',
                'description': 'Complete construction and renovation services for residential and commercial properties.',
                'categories': {
                    'Residential': [
                        'New Home Construction', 'Room Addition', 'Kitchen Renovation', 
                        'Bathroom Renovation', 'Balcony Construction', 'Staircase Construction',
                        'Boundary Wall Construction', 'Garage Construction'
                    ],
                    'Commercial': [
                        'Office Construction', 'Shop Construction', 'Warehouse Construction',
                        'Factory Construction', 'Showroom Construction', 'Restaurant Setup'
                    ],
                    'Specialty': [
                        'Foundation Work', 'Structural Work', 'Concrete Work', 'Masonry Work',
                        'Steel Structure', 'Waterproofing', 'Demolition Work'
                    ]
                }
            },
            {
                'name': 'HVAC',
                'description': 'Heating, ventilation, and air conditioning services for optimal indoor climate control.',
                'categories': {
                    'Installation': [
                        'Split AC Installation', 'Window AC Installation', 'Central AC Installation',
                        'Ducted AC Installation', 'Exhaust Fan Installation', 'Ventilation System Installation'
                    ],
                    'Maintenance': [
                        'AC Servicing', 'Filter Replacement', 'Gas Refilling', 'Coil Cleaning',
                        'Duct Cleaning', 'System Inspection', 'Preventive Maintenance'
                    ],
                    'Repair': [
                        'AC Repair', 'Compressor Repair', 'Thermostat Repair', 'Gas Leak Repair',
                        'Duct Repair', 'Fan Motor Repair', 'Control Panel Repair'
                    ]
                }
            },
            {
                'name': 'Carpentry',
                'description': 'Professional carpentry services for custom furniture, repairs, and wooden installations.',
                'categories': {
                    'Furniture': [
                        'Custom Furniture Making', 'Wardrobe Installation', 'Kitchen Cabinets',
                        'Bookshelf Installation', 'Bed Frame Making', 'Dining Table Making',
                        'Office Furniture', 'Storage Solutions'
                    ],
                    'Installation': [
                        'Door Installation', 'Window Installation', 'Flooring Installation',
                        'Ceiling Work', 'Partition Installation', 'Railing Installation'
                    ],
                    'Repair': [
                        'Furniture Repair', 'Door Repair', 'Window Repair', 'Drawer Repair',
                        'Handle Replacement', 'Hinge Repair', 'Wood Polishing'
                    ]
                }
            },
            {
                'name': 'Painting',
                'description': 'Professional painting services for interior and exterior surfaces with quality materials.',
                'categories': {
                    'Interior': [
                        'Wall Painting', 'Ceiling Painting', 'Room Painting', 'Texture Painting',
                        'Decorative Painting', 'Wood Polish', 'Metal Painting'
                    ],
                    'Exterior': [
                        'House Exterior Painting', 'Boundary Wall Painting', 'Roof Painting',
                        'Gate Painting', 'Weather Coating', 'Waterproof Painting'
                    ],
                    'Specialty': [
                        'Asian Paints Service', 'Berger Paints Service', 'Nerolac Service',
                        'Wall Paper Installation', 'Stencil Work', 'Art Work'
                    ]
                }
            },
            {
                'name': 'Landscaping',
                'description': 'Professional landscaping and garden maintenance services for beautiful outdoor spaces.',
                'categories': {
                    'Design': [
                        'Garden Design', 'Landscape Planning', 'Plant Selection', 'Layout Design',
                        'Theme Gardens', 'Rock Garden Design', 'Water Feature Design'
                    ],
                    'Installation': [
                        'Plant Installation', 'Grass Installation', 'Tree Plantation', 'Flower Bed Setup',
                        'Irrigation System', 'Garden Lighting', 'Pathway Creation'
                    ],
                    'Maintenance': [
                        'Lawn Care', 'Tree Trimming', 'Pruning', 'Fertilization', 'Pest Control',
                        'Seasonal Maintenance', 'Garden Cleaning'
                    ]
                }
            },
            {
                'name': 'Cleaning',
                'description': 'Professional cleaning services for homes and offices with eco-friendly solutions.',
                'categories': {
                    'Residential': [
                        'Regular House Cleaning', 'Deep Cleaning', 'Move-in Cleaning', 'Move-out Cleaning',
                        'Kitchen Deep Clean', 'Bathroom Deep Clean', 'Balcony Cleaning'
                    ],
                    'Commercial': [
                        'Office Cleaning', 'Shop Cleaning', 'Post-Construction Cleaning', 
                        'Event Cleanup', 'Medical Facility Cleaning', 'Restaurant Cleaning'
                    ],
                    'Specialty': [
                        'Carpet Cleaning', 'Sofa Cleaning', 'Window Cleaning', 'AC Duct Cleaning',
                        'Water Tank Cleaning', 'Pressure Washing', 'Disinfection Service'
                    ]
                }
            },
            {
                'name': 'Tiling',
                'description': 'Expert tiling services for floors, walls, and decorative surfaces with precision installation.',
                'categories': {
                    'Floor Tiling': [
                        'Ceramic Tile Installation', 'Vitrified Tile Installation', 'Marble Installation',
                        'Granite Installation', 'Wooden Flooring', 'Designer Tiles'
                    ],
                    'Wall Tiling': [
                        'Bathroom Tiling', 'Kitchen Tiling', 'Decorative Wall Tiles',
                        'Mosaic Work', 'Stone Cladding', 'Texture Tiles'
                    ],
                    'Repair': [
                        'Tile Replacement', 'Grout Repair', 'Tile Cleaning', 'Re-grouting',
                        'Crack Repair', 'Waterproofing', 'Tile Polish'
                    ]
                }
            },
            {
                'name': 'Roofing',
                'description': 'Complete roofing solutions including installation, repair, and waterproofing services.',
                'categories': {
                    'Installation': [
                        'New Roof Construction', 'Roof Extension', 'Shed Construction',
                        'Canopy Installation', 'Skylight Installation', 'Solar Panel Mounting'
                    ],
                    'Repair': [
                        'Roof Leak Repair', 'Tile Replacement', 'Gutter Repair', 'Flashing Repair',
                        'Structural Repair', 'Drainage Repair', 'Insulation Repair'
                    ],
                    'Waterproofing': [
                        'Terrace Waterproofing', 'Roof Coating', 'Membrane Installation',
                        'Crack Sealing', 'Dampness Treatment', 'Heat Proofing'
                    ]
                }
            }
        ]
        
        # Contractor specialization patterns
        self.contractor_skills = [
            ['Plumbing'], ['Electrical'], ['Construction'], ['HVAC'], ['Carpentry'],
            ['Painting'], ['Landscaping'], ['Cleaning'], ['Tiling'], ['Roofing'],
            ['Plumbing', 'HVAC'], ['Electrical', 'HVAC'], ['Construction', 'Tiling'],
            ['Carpentry', 'Painting'], ['Landscaping', 'Cleaning'], ['Plumbing', 'Electrical'],
            ['Construction', 'Roofing'], ['Painting', 'Tiling'], ['HVAC', 'Electrical'],
            ['Carpentry', 'Construction']
        ]
        
        # Supervisor specializations
        self.supervisor_specialties = [
            'Plumbing', 'Electrical', 'Construction', 'HVAC', 'Carpentry',
            'Painting', 'Landscaping', 'Cleaning', 'Tiling', 'Roofing'
        ]

# Utility functions
def safe_create_with_retry(model_class, max_retries=3, **kwargs):
    """Create model instance with retry logic for unique constraint violations"""
    for attempt in range(max_retries):
        try:
            with transaction.atomic():
                return model_class.objects.create(**kwargs)
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"Failed to create {model_class.__name__} after {max_retries} attempts: {e}")
                return None
            # For unique constraint violations, modify the data slightly
            if 'email' in kwargs:
                kwargs['email'] = f"{kwargs['email'].split('@')[0]}_{attempt}@{kwargs['email'].split('@')[1]}"
            if 'phone_number' in kwargs:
                kwargs['phone_number'] = f"+91-{fake.numerify('##########')}"
    return None

def print_progress(message, current=None, total=None):
    """Print progress message with optional counter"""
    if current is not None and total is not None:
        print(f"{message} ({current}/{total})")
    else:
        print(message)

# Global configuration instance
config = SeedDataConfig()
