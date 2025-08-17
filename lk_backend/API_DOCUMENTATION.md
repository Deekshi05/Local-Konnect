# Local Konnect API Documentation

## 🔄 **Tender Creation Workflows Overview**

**Two Ways to Create Tenders:**

1. **Manual Creation** (`POST /tenders/create/`): Customer creates tender directly without assistance
2. **Assisted Creation**: Two-step process:
   - Step 1: Customer requests assistance (`POST /tender-assistance/create/`)
   - Step 2: Customer creates final tender with guidance (`POST /tenders/assisted/create/`)

**⚠️ Important**: Supervisors provide **guidance only** - Customers always create the final tender themselves.

---

# Local Konnect API Documentation

## Base URL
`http://localhost:8000/api/`

## Authentication
All authenticated endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Account Management

### Authentication Endpoints (Public)

#### Customer Registration
- **URL**: `POST /register/customer/`
- **Auth**: Not required
- **Description**: Register a new customer account
- **Request Body**:
```json
{
    "email": "customer@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+919876543210",
    "city": "Mumbai",
    "state": "Maharashtra",
    "customer_image": "file (optional)"
}
```
- **Response** (Success):
```json
{
    "message": "Customer registered successfully"
}
```

#### Contractor Registration
- **URL**: `POST /register/contractor/`
- **Auth**: Not required
- **Description**: Register a new contractor account
- **Request Body**:
```json
{
    "email": "contractor@example.com",
    "password": "password123",
    "first_name": "Jane",
    "last_name": "Smith",
    "phone_number": "+919876543210",
    "city": "Delhi",
    "state": "Delhi",
    "contractor_image": "file (optional)",
    "rating": 4.5,
    "experience": 5,
    "address": "123 Main Street, Delhi"
}
```
- **Response** (Success):
```json
{
    "message": "Contractor registered successfully"
}
```

#### Supervisor Registration
- **URL**: `POST /register/supervisor/`
- **Auth**: Not required
- **Description**: Register a new supervisor account
- **Request Body**:
```json
{
    "email": "supervisor@example.com",
    "password": "password123",
    "first_name": "Mike",
    "last_name": "Johnson",
    "phone_number": "+919876543210",
    "city": "Bangalore",
    "state": "Karnataka",
    "supervisor_image": "file (optional)",
    "rating": 4.8,
    "address": "456 Park Avenue, Bangalore"
}
```
- **Response** (Success):
```json
{
    "message": "Supervisor registered successfully"
}
```

#### Login
- **URL**: `POST /login/`
- **Auth**: Not required
- **Description**: Login and get JWT tokens
- **Request Body**:
```json
{
    "email": "string",
    "password": "string"
}
```
- **Response**:
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "email": "steven.paul1@example.com",
    "user": {
        "id": 6,
        "email": "steven.paul1@example.com",
        "first_name": "Steven",
        "last_name": "Paul",
        "phone_number": "+919297279936",
        "role": "SUPERVISOR"
    }
}
```

#### Token Refresh
- **URL**: `POST /token/refresh/`
- **Auth**: Not required
- **Description**: Refresh JWT access token
- **Request Body**:
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
- **Response**:
```json
{
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Management Endpoints (Authenticated)

#### Get User Profile
- **URL**: `GET /profile/`
- **Auth**: Required (Any authenticated user)
- **Description**: Get current user's profile information
- **Response** (Supervisor Example):
```json
{
    "id": 6,
    "email": "steven.paul1@example.com",
    "first_name": "Steven",
    "last_name": "Paul",
    "phone": "+919297279936",
    "role": "SUPERVISOR",
    "profile_data": {
        "user": {
            "id": 6,
            "email": "steven.paul1@example.com",
            "first_name": "Steven",
            "last_name": "Paul",
            "phone_number": "+919297279936",
            "role": "SUPERVISOR"
        },
        "city": "Jaipur",
        "state": "Rajasthan",
        "supervisor_image": null,
        "rating": "4.4",
        "address": "450, Park Road, Jaipur"
    },
    "address": "450, Park Road, Jaipur"
}
```

#### List Customers
- **URL**: `GET /customers/`
- **Auth**: Required (Supervisors/Contractors)
- **Description**: List all customers
- **Response**: 
```json
[
    {
        "user": {
            "id": 4,
            "email": "shreya.varma1@example.com",
            "first_name": "Shreya",
            "last_name": "Varma",
            "phone_number": "+919332048321",
            "role": "CUSTOMER"
        },
        "city": "Pune",
        "state": "Maharashtra",
        "customer_image": null
    }
]
```

#### List Contractors
- **URL**: `GET /contractors/`
- **Auth**: Required (Supervisors/Customers)
- **Description**: List all contractors
- **Response**: 
```json
[
    {
        "user": {
            "id": 2,
            "email": "joseph.thomas0@example.com",
            "first_name": "Joseph",
            "last_name": "Thomas",
            "phone_number": "+917214231890",
            "role": "CONTRACTOR"
        },
        "city": "Mumbai",
        "state": "Maharashtra",
        "contractor_image": null,
        "rating": "4.2",
        "experience": 8,
        "address": "123, Marine Drive, Mumbai"
    }
]
```

---

# CUSTOMER ENDPOINTS

## Services & Requirements

### Get Services
- **URL**: `GET /services/`
- **Auth**: Required
- **Description**: List all available services
- **Use Case**: Customer browsing available services
- **Response**:
```json
[
    {
        "id": 1,
        "name": "House Construction",
        "description": "Complete house construction services from foundation to finishing",
        "image": null
    },
    {
        "id": 2,
        "name": "Interior Design",
        "description": "Professional interior design and decoration services",
        "image": null
    }
]
```

### Get Service Details
- **URL**: `GET /services/{id}/`
- **Auth**: Required
- **Description**: Get detailed information about a specific service
- **Use Case**: Customer viewing service specifications
- **Response**:
```json
{
    "id": 1,
    "name": "House Construction",
    "description": "Complete house construction services from foundation to finishing",
    "image": null
}
```

### Get Contractors for Service
- **URL**: `GET /services/{service_id}/contractors/`
- **Auth**: Required
- **Description**: List contractors who provide a specific service
- **Use Case**: Customer finding contractors for their needed service
- **Response**:
```json
{
    "id": 1,
    "name": "House Construction",
    "description": "Complete house construction services from foundation to finishing",
    "image": null,
    "contractors": [
        {
            "id": 1,
            "user": {
                "id": 2,
                "first_name": "Joseph",
                "last_name": "Thomas",
                "email": "joseph.thomas0@example.com",
                "phone_number": "+917214231890"
            },
            "city": "Mumbai",
            "state": "Maharashtra",
            "contractor_image": null,
            "rating": "4.2",
            "experience": 8,
            "address": "123, Marine Drive, Mumbai"
        }
    ]
}
```

### Get Service Requirements
- **URL**: `GET /requirements/`
- **Auth**: Required
- **Description**: List requirements for services
- **Use Case**: Customer understanding what's needed for their project
- **Response**:
```json
[
    {
        "id": 1,
        "category": {
            "id": 1,
            "name": "Foundation Work",
            "description": "Requirements for Foundation Work",
            "created_at": "2025-07-31T17:36:53.647134Z",
            "updated_at": "2025-07-31T17:36:53.647134Z",
            "service": 1,
            "parent": null
        },
        "name": "Cement",
        "description": "Standard Cement requirement",
        "image": null,
        "is_template": false,
        "default_unit": "Bags",
        "created_at": "2025-07-31T17:36:53.652710Z",
        "updated_at": "2025-07-31T17:36:53.652710Z"
    }
]
```

### Get Requirement Categories
- **URL**: `GET /requirement-categories/`
- **Auth**: Required
- **Description**: List all requirement categories for services
- **Use Case**: Customer understanding service requirement categories
- **Response**:
```json
[
    {
        "id": 3,
        "name": "Finishing Work",
        "description": "Requirements for Finishing Work",
        "created_at": "2025-07-31T17:36:53.675694Z",
        "updated_at": "2025-07-31T17:36:53.675694Z",
        "service": 1,
        "parent": null
    }
]
```

## Appointments

### Virtual Appointments
- **URL**: `GET /appointments/virtual/`
- **Auth**: Required
- **Description**: List virtual appointments (filtered by user role)
- **Use Case**: Customer viewing their scheduled virtual consultations
- **Response**:
```json
[
    {
        "id": 10,
        "customer": 2,
        "supervisor": 2,
        "service": 3,
        "scheduled_time": "2025-08-07T17:36:55.839088Z",
        "duration_minutes": 30,
        "status": "scheduled",
        "meeting_link": "https://meet.example.com/123",
        "notes": "",
        "customer_name": "Shreya Varma",
        "supervisor_name": "Steven Paul",
        "service_name": "Renovation",
        "project_complexity": "complex",
        "physical_visit_required": null,
        "skip_physical_visit_reason": "",
        "estimated_budget_range": "",
        "created_at": "2025-07-31T17:36:55.914899Z",
        "updated_at": "2025-07-31T17:36:55.914899Z"
    }
]
```

- **URL**: `GET /appointments/virtual/customer/`
- **Auth**: Required (Customer)
- **Description**: List customer's virtual appointments
- **Use Case**: Customer-specific virtual appointment history

### Physical Appointments
- **URL**: `GET /appointments/physical/`
- **Auth**: Required
- **Description**: List physical site visits
- **Use Case**: Customer viewing scheduled on-site visits
- **Response**:
```json
[
    {
        "id": 5,
        "customer": 2,
        "supervisor": 2,
        "service": 1,
        "scheduled_time": "2025-08-10T10:00:00.000000Z",
        "duration_minutes": 120,
        "status": "scheduled",
        "location": "123 Main Street, Mumbai",
        "notes": "Site inspection for foundation work",
        "customer_name": "Shreya Varma",
        "supervisor_name": "Steven Paul",
        "service_name": "House Construction",
        "visit_purpose": "site_inspection",
        "travel_cost": "500.00",
        "created_at": "2025-08-01T09:00:00.000000Z",
        "updated_at": "2025-08-01T09:00:00.000000Z"
    }
]
```

### Get Appointment Details
- **URL**: `GET /appointments/virtual/{id}/`
- **Auth**: Required
- **Description**: Get detailed information about a virtual appointment
- **Response**:
```json
{
    "id": 10,
    "customer": 2,
    "supervisor": 2,
    "service": 3,
    "scheduled_time": "2025-08-07T17:36:55.839088Z",
    "duration_minutes": 30,
    "status": "scheduled",
    "meeting_link": "https://meet.example.com/123",
    "notes": "Initial consultation for renovation project",
    "customer_name": "Shreya Varma",
    "supervisor_name": "Steven Paul",
    "service_name": "Renovation",
    "project_complexity": "complex",
    "physical_visit_required": null,
    "skip_physical_visit_reason": "",
    "estimated_budget_range": "50000-100000",
    "created_at": "2025-07-31T17:36:55.914899Z",
    "updated_at": "2025-07-31T17:36:55.914899Z"
}
```

- **URL**: `GET /appointments/physical/{id}/`
- **Auth**: Required
- **Description**: Get detailed information about a physical appointment
- **Response**:
```json
{
    "id": 5,
    "customer": 2,
    "supervisor": 2,
    "service": 1,
    "scheduled_time": "2025-08-10T10:00:00.000000Z",
    "duration_minutes": 120,
    "status": "scheduled",
    "location": "123 Main Street, Mumbai",
    "notes": "Site inspection for foundation work",
    "customer_name": "Shreya Varma",
    "supervisor_name": "Steven Paul",
    "service_name": "House Construction",
    "visit_purpose": "site_inspection",
    "travel_cost": "500.00",
    "created_at": "2025-08-01T09:00:00.000000Z",
    "updated_at": "2025-08-01T09:00:00.000000Z"
}
```

## Tender Management

### Create New Tender
- **URL**: `POST /tenders/`
- **Auth**: Required (Customer)
- **Description**: Create a new tender/project request
- **Request Body**:
```json
{
    "title": "Residential House Construction",
    "description": "Complete construction of 2-story residential house with modern amenities",
    "budget": 500000.00,
    "location": "Mumbai, Maharashtra",
    "service": 1,
    "supervisor": 2,
    "start_date": "2025-09-01",
    "end_date": "2026-03-01",
    "priority": "medium",
    "tender_requirements": [
        {
            "requirement": 1,
            "category": 1,
            "quantity": 100,
            "units": "bags",
            "description": "High-quality cement for foundation"
        }
    ]
}
```
- **Response**:
```json
{
    "id": 27,
    "title": "Residential House Construction",
    "description": "Complete construction of 2-story residential house with modern amenities",
    "customer": {
        "id": 3,
        "user": {
            "id": 4,
            "first_name": "Shreya",
            "last_name": "Varma",
            "email": "shreya.varma1@example.com",
            "phone_number": "+919332048321",
            "role": "CUSTOMER"
        },
        "city": "Pune",
        "state": "Maharashtra",
        "customer_image": null
    },
    "status": "draft",
    "created_at": "2025-08-03T10:30:00.000000Z"
}
```

### View My Tenders
- **URL**: `GET /tenders/`
- **Auth**: Required
- **Description**: List user's tenders (filtered by role)
- **Use Case**: Customer viewing their submitted tenders
- **Response**:
```json
[
    {
        "id": 26,
        "title": "Residential House Construction",
        "description": "Complete construction of 2-story residential house with modern amenities",
        "customer": {
            "id": 3,
            "user": {
                "id": 7,
                "first_name": "Vihaan",
                "last_name": "Mehta",
                "email": "vihaan.mehta2@example.com",
                "phone_number": "+917293250599",
                "role": "CUSTOMER"
            },
            "city": "Pune",
            "state": "Maharashtra",
            "customer_image": null
        },
        "supervisor": {
            "id": 5,
            "user": {
                "id": 15,
                "first_name": "Ibrahim",
                "last_name": "Qureshi",
                "email": "ibrahim.qureshi4@example.com",
                "phone_number": "+919857018736",
                "role": "SUPERVISOR"
            },
            "city": "Jaipur",
            "state": "Rajasthan",
            "rating": 5.0,
            "supervisor_image": null
        },
        "service": {
            "id": 3,
            "name": "Renovation",
            "description": "Complete renovation and remodeling services",
            "image": null
        },
        "location": "Hyderabad",
        "start_date": "2025-08-04",
        "end_date": "2025-08-06",
        "budget": "78568.00",
        "selected_contractor": null,
        "consultation": null,
        "status": "published",
        "priority": "medium",
        "is_template": false,
        "template_name": "",
        "version": 1,
        "created_at": "2025-08-03T07:10:58.781335Z",
        "updated_at": "2025-08-03T07:10:58.781335Z",
        "published_at": null,
        "tender_requirements": [
            {
                "id": 153,
                "requirement": {
                    "id": 2,
                    "name": "Steel",
                    "description": "Standard Steel requirement"
                },
                "category": {
                    "id": 1,
                    "name": "Foundation Work"
                },
                "quantity": 1.0,
                "units": "tons",
                "description": "High-grade steel for foundation",
                "is_critical": false,
                "version": 1,
                "created_at": "2025-08-03T07:10:58.897505Z",
                "updated_at": "2025-08-03T07:10:58.897505Z"
            }
        ],
        "attachments": [],
        "bid_count": 0,
        "progress": {
            "percent_complete": 0.0,
            "current_phase": "planning",
            "notes": "",
            "last_activity": null
        }
    }
]
```

### Get Tender Details
- **URL**: `GET /tenders/{id}/`
- **Auth**: Required
- **Description**: View detailed tender information including milestones and progress

### Create Virtual Appointment for Tender
- **URL**: `POST /tenders/{tender_id}/virtual-appointments/`
- **Auth**: Required (Customer)
- **Description**: Schedule virtual consultation for a tender
- **Request Body**:
```json
{
    "supervisor": 2,
    "service": 1,
    "scheduled_time": "2025-08-15T14:00:00.000000Z",
    "duration_minutes": 60,
    "notes": "Initial consultation for house construction project",
    "project_complexity": "medium",
    "estimated_budget_range": "500000-1000000"
}
```
- **Response**:
```json
{
    "id": 11,
    "customer": 4,
    "supervisor": 2,
    "service": 1,
    "scheduled_time": "2025-08-15T14:00:00.000000Z",
    "duration_minutes": 60,
    "status": "scheduled",
    "meeting_link": "https://meet.example.com/abc123",
    "notes": "Initial consultation for house construction project",
    "customer_name": "Shreya Varma",
    "supervisor_name": "Steven Paul",
    "service_name": "House Construction",
    "project_complexity": "medium",
    "physical_visit_required": null,
    "skip_physical_visit_reason": "",
    "estimated_budget_range": "500000-1000000",
    "created_at": "2025-08-03T10:30:00.000000Z",
    "updated_at": "2025-08-03T10:30:00.000000Z"
}
```

### Create Physical Visit for Tender
- **URL**: `POST /tenders/{tender_id}/physical-visits/`
- **Auth**: Required (Customer)
- **Description**: Schedule on-site visit for a tender
- **Request Body**:
```json
{
    "supervisor": 2,
    "service": 1,
    "scheduled_time": "2025-08-20T10:00:00.000000Z",
    "duration_minutes": 120,
    "location": "123 Main Street, Mumbai, Maharashtra",
    "notes": "Site inspection for construction project",
    "visit_purpose": "site_inspection",
    "travel_cost": 1000.00
}
```
- **Response**:
```json
{
    "id": 6,
    "customer": 4,
    "supervisor": 2,
    "service": 1,
    "scheduled_time": "2025-08-20T10:00:00.000000Z",
    "duration_minutes": 120,
    "status": "scheduled",
    "location": "123 Main Street, Mumbai, Maharashtra",
    "notes": "Site inspection for construction project",
    "customer_name": "Shreya Varma",
    "supervisor_name": "Steven Paul",
    "service_name": "House Construction",
    "visit_purpose": "site_inspection",
    "travel_cost": "1000.00",
    "created_at": "2025-08-03T10:30:00.000000Z",
    "updated_at": "2025-08-03T10:30:00.000000Z"
}
```

### Request Tender Assistance
- **URL**: `POST /tenders/{tender_id}/assistance/`
- **Auth**: Required (Customer)
- **Description**: Request help with tender creation or modification
- **Request Body**:
```json
{
    "assistance_type": "creation",
    "notes": "Need help structuring requirements for house construction project",
    "urgency": "medium"
}
```
- **Response**:
```json
{
    "id": 5,
    "tender": 26,
    "virtual_appointment": 10,
    "assistance_type": "creation",
    "status": "pending",
    "notes": "Need help structuring requirements for house construction project",
    "recommendations": "",
    "supervisor_notes": "",
    "created_at": "2025-08-03T10:30:00.000000Z",
    "updated_at": "2025-08-03T10:30:00.000000Z"
}
```

---

# CONTRACTOR ENDPOINTS

## Service Management

### View My Services
- **URL**: `GET /contractor/services/`
- **Auth**: Required (Contractor)
- **Description**: List services the contractor provides
- **Use Case**: Contractor managing their service offerings
- **Response**:
```json
[
    {
        "service": {
            "id": 3,
            "name": "Renovation",
            "description": "Complete renovation and remodeling services",
            "image": null
        },
        "added_on": "2025-07-31T17:36:53.730952Z"
    }
]
```

### Add Service
- **URL**: `POST /contractor/services/add/`
- **Auth**: Required (Contractor)
- **Description**: Add a new service to contractor's offerings
- **Request Body**:
```json
{
    "service_id": 1
}
```
- **Response**:
```json
{
    "service": {
        "id": 1,
        "name": "House Construction",
        "description": "Complete house construction services from foundation to finishing",
        "image": null
    },
    "added_on": "2025-08-03T10:30:00.000000Z"
}
```

### Remove Service
- **URL**: `DELETE /contractor/services/{service_id}/remove/`
- **Auth**: Required (Contractor)
- **Description**: Remove service from contractor's offerings
- **Response**:
```json
{
    "message": "Service removed successfully"
}
```

## Tender Participation

### View Available Tenders
- **URL**: `GET /tenders/`
- **Auth**: Required (Contractor)
- **Description**: List tenders the contractor can bid on
- **Use Case**: Contractor browsing opportunities
- **Response**: Same format as customer tenders view

### Browse Available Tenders (Contractor-Specific)
- **URL**: `GET /tenders/contractor/listed/`
- **Auth**: Required (Contractor)
- **Description**: List all published tenders available for contractor bidding
- **Use Case**: Contractor discovering new tender opportunities
- **Response**:
```json
[
    {
        "id": 19,
        "title": "Luxury House Construction",
        "description": "Project for commercial property in Delhi",
        "customer": {
            "id": 6,
            "user": {
                "id": 16,
                "first_name": "Priya",
                "last_name": "Subramaniam",
                "email": "priya.subramaniam5@example.com",
                "phone_number": "+919891447550",
                "role": "CUSTOMER"
            },
            "city": "Ahmedabad",
            "state": "Gujarat",
            "customer_image": null
        },
        "supervisor": {
            "id": 6,
            "user": {
                "id": 18,
                "first_name": "Sarah",
                "last_name": "Philip",
                "email": "sarah.philip5@example.com",
                "phone_number": "+917583723971",
                "role": "SUPERVISOR"
            },
            "city": "Jaipur",
            "state": "Rajasthan",
            "rating": 4.5,
            "supervisor_image": null
        },
        "service": {
            "id": 2,
            "name": "Interior Design",
            "description": "Professional interior design and decoration services",
            "image": null
        },
        "location": "Hyderabad, Rajasthan",
        "start_date": "2024-01-16",
        "end_date": "2024-06-18",
        "budget": "9597647.00",
        "selected_contractor": {
            "id": 4,
            "user": {
                "id": 11,
                "first_name": "Ravi",
                "last_name": "Kumar",
                "email": "ravi.kumar3@example.com",
                "phone_number": "+917789184117",
                "role": "CONTRACTOR"
            },
            "city": "Chennai",
            "state": "Tamil Nadu",
            "rating": 3.8,
            "experience": 3,
            "contractor_image": null
        },
        "consultation": null,
        "status": "completed",
        "priority": "urgent",
        "is_template": false,
        "template_name": "",
        "version": 1,
        "created_at": "2025-07-31T17:36:54.281793Z",
        "updated_at": "2025-07-31T17:36:54.540445Z",
        "published_at": null,
        "tender_requirements": [
            {
                "id": 139,
                "requirement": {
                    "id": 15,
                    "name": "Cabinets",
                    "description": "Standard Cabinets requirement"
                },
                "category": {
                    "id": 5,
                    "name": "Kitchen"
                },
                "quantity": 331.0,
                "units": "Units",
                "description": "Standard Cabinets requirement",
                "is_critical": false,
                "version": 1,
                "created_at": "2025-07-31T17:36:54.287167Z",
                "updated_at": "2025-07-31T17:36:54.287167Z"
            }
        ],
        "attachments": [
            {
                "id": 5,
                "name": "Section View.dwg",
                "file_type": "drawing",
                "file": "/media/dummy_path/Section%20View.dwg",
                "file_url": "/media/dummy_path/Section%20View.dwg",
                "description": "Standard drawing for project documentation",
                "uploaded_by": 8,
                "uploaded_by_name": "Karthik Krishnan",
                "version": 1,
                "access_level": "private",
                "is_required": true,
                "file_size": 165067,
                "mime_type": "image/jpeg",
                "created_at": "2025-07-31T17:36:55.976229Z",
                "updated_at": "2025-07-31T17:36:55.976229Z"
            }
        ],
        "bid_count": 3,
        "progress": {
            "percent_complete": 100.0,
            "current_phase": "Completed",
            "notes": "Project completed successfully",
            "last_activity": "2025-07-31T17:36:56.316707Z"
        }
    }
]
```

### Submit Tender Bid
- **URL**: `POST /tenders/{tender_id}/bids/`
- **Auth**: Required (Contractor)
- **Description**: Submit a bid for a tender
- **Request Body**:
```json
{
    "tender_requirement": 1,
    "bid_amount": 45000.00,
    "proposal_description": "High-quality work with modern equipment and experienced team",
    "is_final": true
}
```
- **Response**:
```json
{
    "id": 15,
    "tender_requirement": {
        "id": 1,
        "requirement": {
            "id": 1,
            "name": "Cement",
            "description": "Standard Cement requirement"
        },
        "category": {
            "id": 1,
            "name": "Foundation Work"
        },
        "quantity": 100.0,
        "units": "bags",
        "description": "High-quality cement for foundation",
        "is_critical": true
    },
    "contractor": {
        "id": 1,
        "user": {
            "id": 2,
            "first_name": "Joseph",
            "last_name": "Thomas",
            "email": "joseph.thomas0@example.com",
            "phone_number": "+917214231890",
            "role": "CONTRACTOR"
        },
        "city": "Mumbai",
        "state": "Maharashtra",
        "rating": 4.2,
        "experience": 8,
        "contractor_image": null
    },
    "bid_amount": "45000.00",
    "proposal_description": "High-quality work with modern equipment and experienced team",
    "attachments": [],
    "is_final": true,
    "timestamp": "2025-08-03T10:30:00.000000Z",
    "updated_at": "2025-08-03T10:30:00.000000Z"
}
```

### View My Bids
- **URL**: `GET /bids/`
- **Auth**: Required (Contractor)
- **Description**: List contractor's submitted bids
- **Response**: Array of bid objects (similar to submit bid response format)

### Get Bids for Specific Tender
- **URL**: `GET /tender-bids/tender/{tender_id}/`
- **Auth**: Required (Contractor)  
- **Description**: List contractor's bids for a specific tender
- **Use Case**: Contractor reviewing their submitted bids for a tender
- **Response**:
```json
[
    {
        "id": 15,
        "tender_requirement": {
            "id": 1,
            "requirement": {
                "id": 1,
                "name": "Cement",
                "description": "Standard Cement requirement"
            },
            "category": {
                "id": 1,
                "name": "Foundation Work"
            },
            "quantity": 100.0,
            "units": "bags",
            "description": "High-quality cement for foundation",
            "is_critical": true
        },
        "contractor": {
            "id": 1,
            "user": {
                "id": 2,
                "first_name": "Joseph",
                "last_name": "Thomas",
                "email": "joseph.thomas0@example.com",
                "phone_number": "+917214231890",
                "role": "CONTRACTOR"
            },
            "city": "Mumbai",
            "state": "Maharashtra",
            "rating": 4.2,
            "experience": 8,
            "contractor_image": null
        },
        "bid_amount": "45000.00",
        "proposal_description": "High-quality work with modern equipment and experienced team",
        "attachments": [],
        "is_final": true,
        "timestamp": "2025-08-03T10:30:00.000000Z",
        "updated_at": "2025-08-03T10:30:00.000000Z"
    }
]
```

### Accept Tender Assignment
- **URL**: `PUT /tenders/{tender_id}/assignment/`
- **Auth**: Required (Contractor)
- **Description**: Accept or update tender assignment details

## Work Management

### View Assigned Tenders
- **URL**: `GET /tenders/assigned/`
- **Auth**: Required (Contractor)
- **Description**: List tenders assigned to the contractor
- **Response**: Array of tender objects (same format as tender list)

### View Selected Tenders  
- **URL**: `GET /tenders/contractor/selected/`
- **Auth**: Required (Contractor)
- **Description**: List tenders where the contractor has been selected
- **Use Case**: Contractor viewing won projects
- **Response**: Array of tender objects (same format as contractor tender list)

### Update Tender Progress
- **URL**: `PUT /tenders/{tender_id}/progress/`
- **Auth**: Required (Contractor)
- **Description**: Update work progress on assigned tender
- **Request Body**:
```json
{
    "percent_complete": 25.5,
    "current_phase": "foundation",
    "notes": "Foundation work completed, starting with structural work"
}
```
- **Response**:
```json
{
    "id": 1,
    "tender": 26,
    "percent_complete": "25.50",
    "last_activity": "2025-08-03T10:30:00.000000Z",
    "current_phase": "foundation",
    "next_milestone": null,
    "notes": "Foundation work completed, starting with structural work"
}
```

### Manage Milestones
- **URL**: `GET /tenders/{tender_id}/milestones/`
- **Auth**: Required (Contractor)
- **Description**: List tender milestones

- **URL**: `POST /tenders/{tender_id}/milestones/`
- **Auth**: Required (Contractor)
- **Description**: Create new milestone
- **Request Body**:
```json
{
    "title": "Foundation Completion",
    "description": "Complete foundation work including excavation and concrete pouring",
    "due_date": "2025-09-15",
    "status": "pending"
}
```
- **Response**:
```json
{
    "id": 5,
    "tender": 26,
    "title": "Foundation Completion",
    "description": "Complete foundation work including excavation and concrete pouring",
    "due_date": "2025-09-15",
    "completed_date": null,
    "completion_notes": "",
    "attachments": [],
    "status": "pending",
    "created_at": "2025-08-03T10:30:00.000000Z",
    "updated_at": "2025-08-03T10:30:00.000000Z"
}
```

- **URL**: `PUT /tenders/{tender_id}/milestones/{milestone_id}/`
- **Auth**: Required (Contractor)
- **Description**: Update milestone progress

### Add Progress Notes
- **URL**: `POST /tenders/{tender_id}/progress-notes/`
- **Auth**: Required (Contractor)
- **Description**: Add progress notes and updates
- **Request Body**:
```json
{
    "note": "Foundation work is 75% complete. Concrete pouring scheduled for tomorrow.",
    "images": ["file1.jpg", "file2.jpg"]
}
```
- **Response**:
```json
{
    "id": 3,
    "tender": 26,
    "note": "Foundation work is 75% complete. Concrete pouring scheduled for tomorrow.",
    "created_by": {
        "id": 2,
        "first_name": "Joseph",
        "last_name": "Thomas",
        "role": "CONTRACTOR"
    },
    "images": [
        {
            "id": 1,
            "file": "/media/progress_images/foundation_work.jpg",
            "uploaded_at": "2025-08-03T10:30:00.000000Z"
        }
    ],
    "created_at": "2025-08-03T10:30:00.000000Z",
    "updated_at": "2025-08-03T10:30:00.000000Z"
}
```

### Upload Attachments
- **URL**: `POST /tenders/{tender_id}/attachments/`
- **Auth**: Required (Contractor)
- **Description**: Upload work-related files and images
- **Request Body**: Form data with file uploads
- **Response**:
```json
{
    "id": 6,
    "name": "Construction Progress Photo.jpg",
    "file_type": "image",
    "file": "/media/tender_attachments/2025/08/construction_progress.jpg",
    "file_url": "/media/tender_attachments/2025/08/construction_progress.jpg",
    "description": "Foundation work progress documentation",
    "uploaded_by": 2,
    "uploaded_by_name": "Joseph Thomas",
    "version": 1,
    "access_level": "private",
    "is_required": false,
    "file_size": 1048576,
    "mime_type": "image/jpeg",
    "created_at": "2025-08-03T10:30:00.000000Z",
    "updated_at": "2025-08-03T10:30:00.000000Z"
}
```

### Get Tender Attachments
- **URL**: `GET /tenders/{tender_id}/attachments/`
- **Auth**: Required (Authenticated users)
- **Description**: List all attachments for a tender
- **Response**: Array of attachment objects (same format as upload response)

### Create Bid
- **URL**: `POST /tenders/{tender_id}/bids/`
- **Auth**: Required (Contractor)
- **Description**: Submit a bid for a tender
- **Request Body**:
```json
{
    "amount": 250000.00,
    "timeline": "8 weeks",
    "description": "I have 5+ years experience in residential construction and can complete this project with high quality materials and finish.",
    "materials_cost": 180000.00,
    "labor_cost": 70000.00
}
```
- **Response**:
```json
{
    "id": 15,
    "contractor": {
        "id": 2,
        "first_name": "Joseph",
        "last_name": "Thomas",
        "email": "joseph@example.com",
        "profile": {
            "specialization": "Residential Construction",
            "experience_years": 5,
            "certification": "Licensed Contractor",
            "rating": 4.8,
            "completed_projects": 23
        }
    },
    "tender": 26,
    "amount": "250000.00",
    "timeline": "8 weeks",
    "description": "I have 5+ years experience in residential construction and can complete this project with high quality materials and finish.",
    "materials_cost": "180000.00",
    "labor_cost": "70000.00",
    "status": "submitted",
    "is_selected": false,
    "submitted_at": "2025-08-03T10:30:00.000000Z",
    "updated_at": "2025-08-03T10:30:00.000000Z"
}
```

### Update Bid
- **URL**: `PUT /tenders/{tender_id}/bids/{bid_id}/`
- **Auth**: Required (Contractor - own bid only)
- **Description**: Update an existing bid (only if not selected)
- **Request Body**: Same as create bid
- **Response**: Updated bid object

### Delete Bid
- **URL**: `DELETE /tenders/{tender_id}/bids/{bid_id}/`
- **Auth**: Required (Contractor - own bid only)
- **Description**: Delete a bid (only if not selected)
- **Response**: `204 No Content`

### Get Bid Details
- **URL**: `GET /tenders/{tender_id}/bids/{bid_id}/`
- **Auth**: Required (Authorized users)
- **Description**: Get specific bid details
- **Response**: Same format as create bid response

### List Tender Bids
- **URL**: `GET /tenders/{tender_id}/bids/`
- **Auth**: Required (Customer can see all, Contractor sees only their own)
- **Description**: List all bids for a tender
- **Response**: Array of bid objects

## Milestone Management

### Create Milestone
- **URL**: `POST /tenders/{tender_id}/milestones/`
- **Auth**: Required (Customer or selected Contractor)
- **Description**: Create project milestones
- **Request Body**:
```json
{
    "title": "Foundation Complete",
    "description": "Complete foundation work including excavation and concrete pouring",
    "due_date": "2025-08-15",
    "amount": 75000.00,
    "order": 1
}
```
- **Response**:
```json
{
    "id": 8,
    "tender": 26,
    "title": "Foundation Complete",
    "description": "Complete foundation work including excavation and concrete pouring",
    "due_date": "2025-08-15",
    "amount": "75000.00",
    "status": "pending",
    "order": 1,
    "completed_at": null,
    "payment_released": false,
    "created_by": 1,
    "created_at": "2025-08-03T10:30:00.000000Z",
    "updated_at": "2025-08-03T10:30:00.000000Z"
}
```

### Update Milestone Status
- **URL**: `PATCH /tenders/{tender_id}/milestones/{milestone_id}/status/`
- **Auth**: Required (Contractor can mark complete, Customer can approve/reject)
- **Description**: Update milestone completion status
- **Request Body**:
```json
{
    "status": "completed",
    "completion_notes": "Foundation work completed ahead of schedule with high quality finish."
}
```
- **Response**: Updated milestone object

### List Milestones
- **URL**: `GET /tenders/{tender_id}/milestones/`
- **Auth**: Required (Authorized users)
- **Description**: List all milestones for a tender
- **Response**: Array of milestone objects

## Assistance Management

### Request Assistance
- **URL**: `POST /assistance/request/`
- **Auth**: Required (Contractor)
- **Description**: Request assistance from supervisor
- **Request Body**:
```json
{
    "tender": 26,
    "assistance_type": "technical_guidance",
    "subject": "Foundation drainage issues",
    "description": "Need guidance on proper drainage system installation for the foundation area due to unexpected soil conditions.",
    "priority": "high",
    "requested_date": "2025-08-05"
}
```
- **Response**:
```json
{
    "id": 12,
    "tender": {
        "id": 26,
        "title": "3BHK House Construction",
        "customer_name": "John Smith"
    },
    "contractor": {
        "id": 2,
        "name": "Joseph Thomas",
        "contact": "+91-9876543210"
    },
    "assistance_type": "technical_guidance",
    "subject": "Foundation drainage issues",
    "description": "Need guidance on proper drainage system installation for the foundation area due to unexpected soil conditions.",
    "priority": "high",
    "status": "pending",
    "requested_date": "2025-08-05",
    "assigned_supervisor": null,
    "created_at": "2025-08-03T10:30:00.000000Z",
    "updated_at": "2025-08-03T10:30:00.000000Z"
}
```

### List Assistance Requests
- **URL**: `GET /assistance/requests/`
- **Auth**: Required (Role-based access)
- **Description**: List assistance requests (contractors see their own, supervisors see assigned)
- **Query Parameters**:
  - `status`: Filter by status (pending, assigned, in_progress, completed)
  - `priority`: Filter by priority (low, medium, high, urgent)
  - `assistance_type`: Filter by type
- **Response**: Array of assistance request objects

### Assign Supervisor
- **URL**: `POST /assistance/{request_id}/assign/`
- **Auth**: Required (Admin or Supervisor)
- **Description**: Assign supervisor to assistance request
- **Request Body**:
```json
{
    "supervisor_id": 5,
    "estimated_resolution_time": "2 hours",
    "notes": "Assigning John Davis who has expertise in foundation work"
}
```
- **Response**: Updated assistance request with assigned supervisor

### Update Assistance Status
- **URL**: `PATCH /assistance/{request_id}/status/`
- **Auth**: Required (Assigned supervisor or Admin)
- **Description**: Update assistance request status and add resolution notes
- **Request Body**:
```json
{
    "status": "completed",
    "resolution_notes": "Provided guidance on drainage system. Recommended French drain installation with proper gravel base.",
    "time_spent": "1.5 hours"
}
```
- **Response**: Updated assistance request object

### Add Assistance Note
- **URL**: `POST /assistance/{request_id}/notes/`
- **Auth**: Required (Involved parties)
- **Description**: Add communication notes to assistance request
- **Request Body**:
```json
{
    "note": "Met on-site to review drainage requirements. Will provide detailed plan by tomorrow.",
    "note_type": "update"
}
```
- **Response**:
```json
{
    "id": 23,
    "assistance_request": 12,
    "note": "Met on-site to review drainage requirements. Will provide detailed plan by tomorrow.",
    "note_type": "update",
    "created_by": {
        "id": 5,
        "name": "John Davis",
        "role": "SUPERVISOR"
    },
    "created_at": "2025-08-03T15:30:00.000000Z"
}
```

## Quality Control & Inspections

### Schedule Inspection
- **URL**: `POST /tenders/{tender_id}/inspections/`
- **Auth**: Required (Customer or Supervisor)
- **Description**: Schedule quality inspection
- **Request Body**:
```json
{
    "inspection_type": "milestone_review",
    "scheduled_date": "2025-08-10T10:00:00Z",
    "milestone_id": 8,
    "inspector_notes": "Foundation milestone inspection - checking concrete quality and measurements"
}
```
- **Response**:
```json
{
    "id": 15,
    "tender": 26,
    "inspection_type": "milestone_review",
    "status": "scheduled",
    "scheduled_date": "2025-08-10T10:00:00Z",
    "milestone": {
        "id": 8,
        "title": "Foundation Complete"
    },
    "inspector": null,
    "inspector_notes": "Foundation milestone inspection - checking concrete quality and measurements",
    "inspection_report": null,
    "created_by": 1,
    "created_at": "2025-08-03T10:30:00.000000Z"
}
```

### Update Inspection Results
- **URL**: `PUT /inspections/{inspection_id}/results/`
- **Auth**: Required (Assigned inspector)
- **Description**: Submit inspection results and report
- **Request Body**:
```json
{
    "status": "passed",
    "quality_score": 4.5,
    "inspection_report": "Foundation work meets all quality standards. Concrete strength test passed. Minor adjustment needed in drainage slope.",
    "recommendations": "Adjust drainage slope by 2 degrees for optimal water flow",
    "photos": ["inspection1.jpg", "inspection2.jpg"]
}
```
- **Response**: Updated inspection object with results

## Service Management (Advanced)

### Get Service Categories with Statistics
- **URL**: `GET /services/categories/stats/`
- **Auth**: Required (Authenticated users)
- **Description**: Get service categories with usage statistics
- **Response**:
```json
[
    {
        "id": 1,
        "name": "Construction",
        "description": "Building and construction services",
        "total_services": 25,
        "active_tenders": 12,
        "completed_projects": 156,
        "average_rating": 4.3,
        "subcategories": [
            {
                "id": 2,
                "name": "Residential Construction",
                "service_count": 15
            }
        ]
    }
]
```

### Create Service Template
- **URL**: `POST /services/templates/`
- **Auth**: Required (Supervisor or Admin)
- **Description**: Create reusable service templates
- **Request Body**:
```json
{
    "name": "Standard House Construction Template",
    "category": 1,
    "description": "Complete residential construction service template with all standard requirements",
    "base_price_range": {
        "min": 500000,
        "max": 2000000
    },
    "estimated_duration": "12-16 weeks",
    "default_requirements": [
        {
            "name": "Foundation Work",
            "description": "Excavation and foundation laying",
            "is_mandatory": true
        },
        {
            "name": "Electrical Work",
            "description": "Complete electrical installation",
            "is_mandatory": true
        }
    ]
}
```
- **Response**: Created service template object

### Get Service Performance Analytics
- **URL**: `GET /services/{service_id}/analytics/`
- **Auth**: Required (Service owner or Admin)
- **Description**: Get detailed performance analytics for a service
- **Response**:
```json
{
    "service_id": 15,
    "total_tenders": 45,
    "successful_completions": 38,
    "success_rate": 84.4,
    "average_rating": 4.2,
    "total_revenue": 1250000.00,
    "average_project_duration": "10.5 weeks",
    "customer_satisfaction": {
        "very_satisfied": 24,
        "satisfied": 14,
        "neutral": 5,
        "dissatisfied": 2
    },
    "monthly_trends": [
        {
            "month": "2025-07",
            "tenders": 8,
            "completions": 6,
            "revenue": 180000.00
        }
    ]
}
```

## Version Control & Audit

### Get Tender Version History
- **URL**: `GET /tenders/{tender_id}/versions/`
- **Auth**: Required (Authorized users)
- **Description**: Get all versions of a tender with change history
- **Response**:
```json
[
    {
        "version": 3,
        "created_at": "2025-08-03T10:30:00.000000Z",
        "created_by": {
            "id": 1,
            "name": "John Smith"
        },
        "changes": {
            "budget": {
                "old": 400000.00,
                "new": 450000.00
            },
            "requirements_added": [
                "Additional bathroom fixtures"
            ]
        },
        "change_reason": "Customer requested additional features"
    },
    {
        "version": 2,
        "created_at": "2025-08-01T14:20:00.000000Z",
        "created_by": {
            "id": 5,
            "name": "John Davis"
        },
        "changes": {
            "timeline": {
                "old": "8 weeks",
                "new": "10 weeks"
            }
        },
        "change_reason": "Timeline adjustment based on technical review"
    }
]
```

### Create Tender Version
- **URL**: `POST /tenders/{tender_id}/versions/`
- **Auth**: Required (Customer or assigned supervisor)
- **Description**: Create new version with changes
- **Request Body**:
```json
{
    "changes": {
        "budget": 475000.00,
        "new_requirements": ["Solar panel installation"]
    },
    "change_reason": "Adding renewable energy features"
}
```
- **Response**: New version object

### Get Audit Log
- **URL**: `GET /tenders/{tender_id}/audit/`
- **Auth**: Required (Authorized users)
- **Description**: Get complete audit trail for a tender
- **Response**:
```json
[
    {
        "id": 245,
        "action": "tender_created",
        "actor": {
            "id": 1,
            "name": "John Smith",
            "role": "CUSTOMER"
        },
        "timestamp": "2025-07-15T09:00:00.000000Z",
        "details": {
            "tender_id": 26,
            "initial_budget": 400000.00
        }
    },
    {
        "id": 246,
        "action": "bid_submitted",
        "actor": {
            "id": 2,
            "name": "Joseph Thomas",
            "role": "CONTRACTOR"
        },
        "timestamp": "2025-07-16T14:30:00.000000Z",
        "details": {
            "bid_id": 15,
            "bid_amount": 250000.00
        }
    }
]
```

## Advanced Tender Features

### Duplicate Tender
- **URL**: `POST /tenders/{tender_id}/duplicate/`
- **Auth**: Required (Customer)
- **Description**: Create a copy of existing tender
- **Request Body**:
```json
{
    "new_title": "Similar 3BHK House Construction - Plot 2",
    "copy_requirements": true,
    "copy_attachments": false,
    "modifications": {
        "budget": 500000.00,
        "location": "New address for second property"
    }
}
```
- **Response**: New tender object

### Archive Tender
- **URL**: `POST /tenders/{tender_id}/archive/`
- **Auth**: Required (Customer or Admin)
- **Description**: Archive completed or cancelled tender
- **Request Body**:
```json
{
    "archive_reason": "Project completed successfully",
    "keep_data": true
}
```
- **Response**: Archived tender confirmation

### Bulk Update Tenders
- **URL**: `PATCH /tenders/bulk-update/`
- **Auth**: Required (Admin)
- **Description**: Update multiple tenders at once
- **Request Body**:
```json
{
    "tender_ids": [26, 27, 28],
    "updates": {
        "status": "review_required",
        "assigned_supervisor": 5
    },
    "reason": "Quarterly review process"
}
```
- **Response**: Update results summary

## Customer Dashboard & Analytics

### Get Customer Dashboard
- **URL**: `GET /customers/dashboard/`
- **Auth**: Required (Customer)
- **Description**: Get comprehensive customer dashboard data
- **Response**:
```json
{
    "active_tenders": 3,
    "completed_projects": 1,
    "total_spent": 450000.00,
    "ongoing_projects": [
        {
            "id": 26,
            "title": "3BHK House Construction",
            "progress": 45,
            "next_milestone": "Foundation Complete",
            "contractor": "Joseph Thomas",
            "estimated_completion": "2025-09-15"
        }
    ],
    "recent_activities": [
        {
            "type": "milestone_completed",
            "description": "Excavation work completed",
            "timestamp": "2025-08-02T16:00:00.000000Z"
        }
    ],
    "upcoming_appointments": [
        {
            "id": 45,
            "type": "site_visit",
            "scheduled_date": "2025-08-05T10:00:00.000000Z",
            "with": "Joseph Thomas"
        }
    ],
    "budget_summary": {
        "allocated": 450000.00,
        "spent": 135000.00,
        "remaining": 315000.00,
        "pending_payments": 75000.00
    }
}
```

### Get Customer Project Statistics
- **URL**: `GET /customers/projects/stats/`
- **Auth**: Required (Customer)
- **Description**: Get detailed project statistics and history
- **Response**:
```json
{
    "total_projects": 4,
    "success_rate": 75.0,
    "average_project_duration": "12.5 weeks",
    "total_investment": 1750000.00,
    "favorite_categories": [
        {
            "category": "Construction",
            "projects": 3,
            "success_rate": 100.0
        }
    ],
    "contractor_ratings": {
        "average_given": 4.2,
        "total_reviews": 3
    },
    "monthly_spending": [
        {
            "month": "2025-07",
            "amount": 185000.00,
            "projects": 1
        }
    ]
}
```

## Reporting & Analytics (Admin)

### Get System Analytics
- **URL**: `GET /admin/analytics/system/`
- **Auth**: Required (Admin)
- **Description**: Get comprehensive system analytics
- **Response**:
```json
{
    "user_metrics": {
        "total_users": 1247,
        "active_customers": 456,
        "active_contractors": 189,
        "active_supervisors": 23,
        "new_registrations_this_month": 67
    },
    "tender_metrics": {
        "total_tenders": 3456,
        "active_tenders": 234,
        "completed_tenders": 2890,
        "success_rate": 86.3,
        "average_tender_value": 325000.00
    },
    "financial_metrics": {
        "total_platform_volume": 112500000.00,
        "monthly_volume": 8750000.00,
        "commission_earned": 2250000.00,
        "payment_processing": {
            "successful": 98.7,
            "pending": 1.1,
            "failed": 0.2
        }
    },
    "service_performance": [
        {
            "category": "Construction",
            "total_tenders": 1890,
            "success_rate": 89.2,
            "average_rating": 4.3
        }
    ]
}
```

### Get Revenue Report
- **URL**: `GET /admin/reports/revenue/`
- **Auth**: Required (Admin)
- **Description**: Get detailed revenue reports
- **Query Parameters**:
  - `start_date`: Start date (YYYY-MM-DD)
  - `end_date`: End date (YYYY-MM-DD)
  - `group_by`: Group by period (day, week, month, quarter)
- **Response**:
```json
{
    "period": "2025-07-01 to 2025-07-31",
    "total_revenue": 875000.00,
    "commission_revenue": 43750.00,
    "subscription_revenue": 12500.00,
    "breakdown": [
        {
            "date": "2025-07-01",
            "tender_volume": 125000.00,
            "commission": 6250.00,
            "transactions": 8
        }
    ],
    "growth_metrics": {
        "month_over_month": 12.5,
        "year_over_year": 145.3
    }
}
```

### Export Data
- **URL**: `POST /admin/export/`
- **Auth**: Required (Admin)
- **Description**: Export system data in various formats
- **Request Body**:
```json
{
    "data_type": "tenders",
    "format": "csv",
    "filters": {
        "date_range": {
            "start": "2025-01-01",
            "end": "2025-07-31"
        },
        "status": ["completed", "in_progress"],
        "categories": [1, 2, 3]
    },
    "fields": ["id", "title", "budget", "status", "created_at", "completed_at"]
}
```
- **Response**:
```json
{
    "export_id": "exp_789123",
    "status": "processing",
    "estimated_completion": "2025-08-03T11:00:00.000000Z",
    "download_url": null,
    "file_size": null
}
```

### Get Export Status
- **URL**: `GET /admin/exports/{export_id}/`
- **Auth**: Required (Admin)
- **Description**: Check export processing status
- **Response**:
```json
{
    "export_id": "exp_789123",
    "status": "completed",
    "file_url": "/media/exports/tenders_2025_07.csv",
    "file_size": 1048576,
    "expires_at": "2025-08-10T11:00:00.000000Z",
    "created_at": "2025-08-03T10:30:00.000000Z",
    "completed_at": "2025-08-03T10:35:00.000000Z"
}
```

## Communication & Notifications

### Get Notification Preferences
- **URL**: `GET /users/notifications/preferences/`
- **Auth**: Required (Authenticated user)
- **Description**: Get user notification preferences
- **Response**:
```json
{
    "email_notifications": {
        "tender_updates": true,
        "bid_notifications": true,
        "appointment_reminders": true,
        "payment_alerts": true,
        "marketing": false
    },
    "push_notifications": {
        "instant_messages": true,
        "milestone_updates": true,
        "inspection_schedules": true
    },
    "sms_notifications": {
        "urgent_only": true,
        "appointment_reminders": false
    },
    "notification_schedule": {
        "quiet_hours_start": "22:00",
        "quiet_hours_end": "08:00",
        "timezone": "Asia/Kolkata"
    }
}
```

### Update Notification Preferences
- **URL**: `PUT /users/notifications/preferences/`
- **Auth**: Required (Authenticated user)
- **Description**: Update notification preferences
- **Request Body**: Same format as get response
- **Response**: Updated preferences object

### Send Message
- **URL**: `POST /messages/send/`
- **Auth**: Required (Authenticated user)
- **Description**: Send message to other users
- **Request Body**:
```json
{
    "recipient_id": 2,
    "subject": "Regarding foundation work timeline",
    "message": "Hi Joseph, I wanted to discuss the foundation work schedule. Can we meet tomorrow at 10 AM on site?",
    "related_tender": 26,
    "message_type": "project_discussion"
}
```
- **Response**:
```json
{
    "id": 156,
    "sender": {
        "id": 1,
        "name": "John Smith"
    },
    "recipient": {
        "id": 2,
        "name": "Joseph Thomas"
    },
    "subject": "Regarding foundation work timeline",
    "message": "Hi Joseph, I wanted to discuss the foundation work schedule. Can we meet tomorrow at 10 AM on site?",
    "related_tender": 26,
    "message_type": "project_discussion",
    "is_read": false,
    "sent_at": "2025-08-03T10:30:00.000000Z"
}
```

### Get Message Thread
- **URL**: `GET /messages/thread/{user_id}/`
- **Auth**: Required (Authenticated user)
- **Description**: Get message conversation with specific user
- **Response**: Array of message objects in chronological order

## Tender Creation Workflows

### Manual Tender Creation (Customer Direct)
- **URL**: `POST /tenders/create/`
- **Auth**: Required (Customer)
- **Description**: Customer creates tender manually without assistance
- **Request Body**:
```json
{
    "title": "3BHK House Construction",
    "description": "Complete construction of 3BHK residential house with modern amenities",
    "service": 1,
    "supervisor": 3,
    "budget": 800000.00,
    "timeline": "8-10 months",
    "location": "Mumbai, Maharashtra",
    "priority": "high",
    "special_requirements": "Solar panel installation required"
}
```
- **Response**:
```json
{
    "id": 27,
    "title": "3BHK House Construction",
    "description": "Complete construction of 3BHK residential house with modern amenities",
    "customer": {
        "id": 2,
        "user": {
            "first_name": "Shreya",
            "last_name": "Varma",
            "email": "shreya.varma1@example.com"
        },
        "city": "Pune",
        "state": "Maharashtra"
    },
    "supervisor": {
        "id": 3,
        "user": {
            "first_name": "Kavya",
            "last_name": "Gupta"
        },
        "city": "Kolkata",
        "state": "West Bengal",
        "rating": 4.8
    },
    "service": {
        "id": 1,
        "name": "House Construction",
        "description": "Complete house construction services from foundation to finishing"
    },
    "location": "Mumbai, Maharashtra",
    "budget": "800000.00",
    "status": "draft",
    "priority": "high",
    "version": 1,
    "bid_count": 0,
    "progress": {
        "percent_complete": 0.0,
        "current_phase": "planning",
        "notes": "",
        "last_activity": null
    },
    "created_at": "2025-08-03T15:07:58.252849Z",
    "updated_at": "2025-08-03T15:07:58.252849Z"
}
```

## Tender Creation Assistance (Professional Help)

### Request Tender Creation Assistance
- **URL**: `POST /tender-assistance/create/`
- **Auth**: Required (Customer)
- **Description**: Request professional assistance for creating complex tenders (supervisor provides guidance only)
- **Request Body**:
```json
{
    "service": 1,
    "customer": 4,
    "supervisor": 3,
    "assistance_type": "tender_creation",
    "description": "Need professional guidance for creating a comprehensive tender for residential construction project",
    "project_details": "3BHK house construction with modern amenities, solar panel installation, and smart home features",
    "requirements_text": "Complete house construction including foundation, structure, electrical, plumbing, interior design",
    "budget_range": "800000-1200000",
    "timeline_preference": "8-12 months",
    "location": "Bangalore, Karnataka",
    "virtual_appointment": 12
}
```
- **Response**:
```json
{
    "id": 8,
    "customer": {
        "id": 4,
        "user": {
            "first_name": "Shreya",
            "last_name": "Varma",
            "email": "shreya.varma1@example.com"
        }
    },
    "supervisor": {
        "id": 3,
        "user": {
            "first_name": "Kavya",
            "last_name": "Gupta"
        },
        "specialization": "Residential Construction"
    },
    "service": {
        "id": 1,
        "name": "House Construction",
        "category": "Construction"
    },
    "assistance_type": "tender_creation",
    "description": "Need professional guidance for creating a comprehensive tender",
    "status": "in_progress",
    "requirements_discussed": [],
    "estimated_budget": null,
    "project_timeline_days": null,
    "tender_posted": false,
    "tender": null,
    "created_at": "2025-08-03T10:30:00.000000Z"
}
```

### Customer Creates Final Tender (After Assistance)
- **URL**: `POST /tenders/assisted/create/`
- **Auth**: Required (Customer)
- **Description**: Customer creates the final tender using supervisor's assistance and recommendations
- **Request Body**:
```json
{
    "assistance_id": 8,
    "title": "3BHK House Construction with Modern Amenities",
    "description": "Complete residential construction project based on professional consultation and recommendations",
    "budget": 950000.00,
    "timeline": "10 months",
    "location": "Bangalore, Karnataka",
    "priority": "high",
    "special_requirements": "Solar panels, smart home automation, premium finishes",
    "auto_invite_contractors": true,
    "invitation_criteria": {
        "specialization": "Residential Construction",
        "min_rating": 4.0,
        "max_invitations": 8
    }
}
```
- **Response**:
```json
{
    "id": 28,
    "title": "3BHK House Construction with Modern Amenities",
    "description": "Complete residential construction project based on professional consultation",
    "customer": {
        "id": 4,
        "name": "Shreya Varma"
    },
    "supervisor": {
        "id": 3,
        "name": "Kavya Gupta"
    },
    "service": {
        "id": 1,
        "name": "House Construction"
    },
    "budget": "950000.00",
    "timeline": "10 months",
    "status": "draft",
    "assistance_request": 8,
    "requirements_count": 0,
    "invited_contractors": 0,
    "auto_invite_enabled": true,
    "created_at": "2025-08-03T10:30:00.000000Z",
    "bidding_deadline": null
}
```

### Get Customer Tender Assistance Requests
- **URL**: `GET /tender-assistance/customer/`
- **Auth**: Required (Customer)
- **Description**: List all tender creation assistance requests for the authenticated customer
- **Response**:
```json
[
    {
        "id": 8,
        "customer": {
            "id": 4,
            "user": {
                "first_name": "Shreya",
                "last_name": "Varma"
            }
        },
        "supervisor": {
            "id": 3,
            "user": {
                "first_name": "Kavya",
                "last_name": "Gupta"
            },
            "specialization": "Residential Construction",
            "rating": 4.7
        },
        "service": {
            "id": 1,
            "name": "House Construction"
        },
        "assistance_type": "tender_creation",
        "status": "completed",
        "description": "Professional guidance for comprehensive tender creation",
        "tender_posted": true,
        "tender": {
            "id": 28,
            "title": "3BHK House Construction with Modern Amenities",
            "status": "draft"
        },
        "created_at": "2025-08-03T10:30:00.000000Z"
    }
]
```

### Get Supervisor Tender Assistance Requests
- **URL**: `GET /tender-assistance/supervisor/`
- **Auth**: Required (Supervisor)
- **Description**: List all tender assistance requests assigned to the authenticated supervisor
- **Response**: Array of assistance request objects (same format as customer view)

### Get Tender Assistance Details
- **URL**: `GET /tender-assistance/{id}/`
- **Auth**: Required (Customer or assigned Supervisor)
- **Description**: Get detailed information about a specific assistance request
- **Response**: Complete assistance request object with all related data

### Update Tender Assistance Status
- **URL**: `PATCH /tender-assistance/{id}/`
- **Auth**: Required (Assigned supervisor or Customer)
- **Description**: Update assistance request status and add notes
- **Request Body**:
```json
{
    "status": "completed",
    "supervisor_notes": "Provided comprehensive guidance on project requirements, budget optimization, and contractor selection criteria. Customer is ready to post the final tender.",
    "requirements_discussed": [
        "Foundation requirements and soil testing",
        "Electrical and plumbing specifications", 
        "Interior design and finishing options",
        "Solar panel integration",
        "Smart home automation features"
    ],
    "estimated_budget": 950000.00,
    "project_timeline_days": 300
}
```
- **Response**: Updated assistance request object

## Contractor Invitation System

### Assign Contractors to Tender
- **URL**: `POST /tenders/assign-contractors/`
- **Auth**: Required (Customer or Supervisor)
- **Description**: Invite specific contractors to bid on a tender
- **Request Body**:
```json
{
    "tender": 26,
    "contractors": [2, 5, 8, 12],
    "invitation_message": "We would like to invite you to submit a bid for our 3BHK house construction project. Please review the requirements and submit your proposal by August 15th.",
    "deadline": "2025-08-15T18:00:00Z",
    "preferred_contact_method": "email",
    "send_notifications": true
}
```
- **Response**:
```json
{
    "message": "Contractors assigned successfully.",
    "invited_contractors": [
        {
            "id": 2,
            "name": "Joseph Thomas",
            "email": "joseph.thomas0@example.com",
            "specialization": "Residential Construction",
            "notification_sent": true,
            "invitation_status": "sent"
        },
        {
            "id": 5,
            "name": "Ravi Kumar",
            "email": "ravi.kumar3@example.com",
            "specialization": "Commercial Construction",
            "notification_sent": true,
            "invitation_status": "sent"
        }
    ],
    "total_invited": 4,
    "invitation_deadline": "2025-08-15T18:00:00Z",
    "created_at": "2025-08-03T10:30:00.000000Z"
}
```

### Get Contractor Invitation Status
- **URL**: `GET /tenders/{tender_id}/contractor-invitations/`
- **Auth**: Required (Customer or authorized users)
- **Description**: Get status of all contractor invitations for a tender
- **Response**:
```json
[
    {
        "contractor": {
            "id": 2,
            "name": "Joseph Thomas",
            "profile": {
                "specialization": "Residential Construction",
                "rating": 4.5,
                "completed_projects": 23
            }
        },
        "invitation_sent_at": "2025-08-03T10:30:00.000000Z",
        "status": "bid_submitted",
        "response_time": "2025-08-04T14:20:00.000000Z",
        "bid_amount": 380000.00,
        "contractor_message": "Thank you for the invitation. I have submitted my detailed proposal."
    },
    {
        "contractor": {
            "id": 5,
            "name": "Ravi Kumar",
            "profile": {
                "specialization": "Commercial Construction",
                "rating": 4.2,
                "completed_projects": 18
            }
        },
        "invitation_sent_at": "2025-08-03T10:30:00.000000Z",
        "status": "pending",
        "response_time": null,
        "bid_amount": null,
        "contractor_message": null
    }
]
```

### Bulk Invite Contractors
- **URL**: `POST /tenders/{tender_id}/bulk-invite/`
- **Auth**: Required (Customer)
- **Description**: Invite contractors based on criteria (location, specialization, rating)
- **Request Body**:
```json
{
    "criteria": {
        "specialization": ["Residential Construction", "General Construction"],
        "min_rating": 4.0,
        "location_radius": 50,
        "experience_years": 3,
        "max_invitations": 10
    },
    "invitation_message": "Your profile matches our project requirements. We invite you to bid on our construction project.",
    "deadline": "2025-08-20T18:00:00Z"
}
```
- **Response**:
```json
{
    "matching_contractors": 15,
    "invited_contractors": 10,
    "invitation_details": [
        {
            "contractor_id": 2,
            "name": "Joseph Thomas",
            "match_score": 95,
            "invitation_sent": true
        }
    ],
    "criteria_used": {
        "specialization": ["Residential Construction", "General Construction"],
        "min_rating": 4.0,
        "location_radius": 50
    }
}
```

## Advanced Tender Management

### Create Assisted Tender
- **URL**: `POST /tenders/assisted/create/`
- **Auth**: Required (Supervisor)
- **Description**: Create a tender on behalf of a customer after assistance consultation
- **Request Body**:
```json
{
    "assistance_request": 8,
    "title": "3BHK House Construction with Modern Amenities",
    "description": "Complete residential construction project based on consultation requirements",
    "budget": 950000.00,
    "timeline": "10 months",
    "location": "Bangalore, Karnataka",
    "requirements": [
        {
            "name": "Foundation Work",
            "description": "RCC foundation with proper drainage",
            "quantity": 1500,
            "unit": "sq ft"
        },
        {
            "name": "Structure Construction",
            "description": "3BHK structure with modern design",
            "quantity": 1,
            "unit": "complete"
        }
    ],
    "auto_invite_contractors": true,
    "invitation_criteria": {
        "specialization": "Residential Construction",
        "min_rating": 4.0,
        "max_invitations": 8
    }
}
```
- **Response**:
```json
{
    "id": 28,
    "title": "3BHK House Construction with Modern Amenities",
    "description": "Complete residential construction project based on consultation requirements",
    "customer": {
        "id": 4,
        "name": "Shreya Varma"
    },
    "supervisor": {
        "id": 3,
        "name": "Kavya Gupta"
    },
    "budget": "950000.00",
    "timeline": "10 months",
    "status": "open_for_bids",
    "assistance_request": 8,
    "requirements_count": 2,
    "invited_contractors": 8,
    "created_at": "2025-08-03T10:30:00.000000Z",
    "bidding_deadline": "2025-08-18T18:00:00.000000Z"
}
```

---

# Error Handling

All API endpoints return appropriate HTTP status codes and error messages:

## Common HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `204 No Content`: Request successful, no content to return
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

## Error Response Format
```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "The provided data is invalid",
        "details": {
            "email": ["This field is required"],
            "budget": ["Budget must be greater than 0"]
        }
    }
}
```

# Rate Limiting

- **General API**: 100 requests per minute per user
- **Authentication endpoints**: 5 requests per minute per IP
- **File uploads**: 10 requests per minute per user
- **Search endpoints**: 30 requests per minute per user

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

---

# SUPERVISOR ENDPOINTS

## Oversight & Management

### Supervisor Dashboard
- **URL**: `GET /tenders/`
- **Auth**: Required (Supervisor)
- **Description**: List all tenders for oversight
- **Use Case**: Supervisor monitoring all projects

### Get Service Supervisors
- **URL**: `GET /services/{service_id}/supervisors/`
- **Auth**: Required
- **Description**: List supervisors available for a service
- **Response**:
```json
[
    {
        "id": 9,
        "supervisor": {
            "id": 6,
            "user": {
                "id": 18,
                "first_name": "Sarah",
                "last_name": "Philip",
                "email": "sarah.philip5@example.com",
                "phone_number": "+917583723971",
                "role": "SUPERVISOR"
            },
            "city": "Jaipur",
            "state": "Rajasthan",
            "rating": 4.5,
            "supervisor_image": null
        },
        "service": 1,
        "hourly_rate": "1440.00",
        "physical_visit_fee": "4717.00",
        "available_from": "09:00:00",
        "available_to": "18:00:00",
        "service_name": "House Construction",
        "expertise_level": "expert",
        "years_experience": 12,
        "is_active": true,
        "added_on": "2025-07-31T17:36:53.803229Z"
    }
]
```

### Manage Supervisor Services
- **URL**: `GET /supervisor/services/`
- **Auth**: Required (Supervisor)
- **Description**: List services under supervisor's oversight
- **Response**:
```json
[
    {
        "id": 2,
        "supervisor": {
            "id": 2,
            "user": {
                "id": 6,
                "first_name": "Steven",
                "last_name": "Paul",
                "email": "steven.paul1@example.com",
                "phone_number": "+919297279936",
                "role": "SUPERVISOR"
            },
            "city": "Jaipur",
            "state": "Rajasthan",
            "rating": 4.4,
            "supervisor_image": null
        },
        "service": 3,
        "hourly_rate": "1193.00",
        "physical_visit_fee": "2739.00",
        "available_from": "09:00:00",
        "available_to": "18:00:00",
        "service_name": "Renovation",
        "expertise_level": "intermediate",
        "years_experience": 9,
        "is_active": true,
        "added_on": "2025-07-31T17:36:53.784243Z"
    }
]
```

- **URL**: `POST /supervisor/services/`
- **Auth**: Required (Supervisor)
- **Description**: Add service to supervisor's responsibilities
- **Request Body**:
```json
{
    "service": 1,
    "hourly_rate": 1500.00,
    "physical_visit_fee": 3000.00,
    "available_from": "09:00:00",
    "available_to": "17:00:00",
    "expertise_level": "expert",
    "years_experience": 10
}
```
- **Response**:
```json
{
    "id": 3,
    "supervisor": {
        "id": 2,
        "user": {
            "id": 6,
            "first_name": "Steven",
            "last_name": "Paul",
            "email": "steven.paul1@example.com",
            "phone_number": "+919297279936",
            "role": "SUPERVISOR"
        },
        "city": "Jaipur",
        "state": "Rajasthan",
        "rating": 4.4,
        "supervisor_image": null
    },
    "service": 1,
    "hourly_rate": "1500.00",
    "physical_visit_fee": "3000.00",
    "available_from": "09:00:00",
    "available_to": "17:00:00",
    "service_name": "House Construction",
    "expertise_level": "expert",
    "years_experience": 10,
    "is_active": true,
    "added_on": "2025-08-03T10:30:00.000000Z"
}
```

- **URL**: `PUT /supervisor/services/{id}/`
- **Auth**: Required (Supervisor)
- **Description**: Update supervisor service settings

### Tender Quality Control

#### Review Tender Progress
- **URL**: `GET /tenders/{tender_id}/progress/`
- **Auth**: Required (Supervisor)
- **Description**: Review contractor's work progress
- **Response**:
```json
{
    "id": 1,
    "tender": 26,
    "percent_complete": "25.50",
    "last_activity": "2025-08-03T10:30:00.000000Z",
    "current_phase": "foundation",
    "next_milestone": {
        "id": 5,
        "title": "Foundation Completion",
        "due_date": "2025-09-15",
        "status": "pending"
    },
    "notes": "Foundation work completed, starting with structural work"
}
```

#### Audit Tender Activities
- **URL**: `GET /tenders/{tender_id}/audit-logs/`
- **Auth**: Required (Supervisor)
- **Description**: View complete audit trail of tender activities
- **Response**:
```json
[
    {
        "id": 1,
        "tender": 26,
        "user": 2,
        "user_name": "Joseph Thomas",
        "action": "bid_submitted",
        "description": "Submitted bid for foundation work",
        "old_value": null,
        "new_value": "45000.00",
        "ip_address": "192.168.1.100",
        "created_at": "2025-08-03T09:30:00.000000Z"
    },
    {
        "id": 2,
        "tender": 26,
        "user": 6,
        "user_name": "Steven Paul",
        "action": "tender_reviewed",
        "description": "Tender requirements reviewed and approved",
        "old_value": "draft",
        "new_value": "published",
        "ip_address": "192.168.1.101",
        "created_at": "2025-08-03T10:00:00.000000Z"
    }
]
```

#### Review Tender Versions
- **URL**: `GET /tenders/{tender_id}/versions/`
- **Auth**: Required (Supervisor)
- **Description**: Track tender modifications and versions

### Assistance Management

#### Process Tender Assistance Requests
- **URL**: `GET /tender-assistance/`
- **Auth**: Required (Supervisor)
- **Description**: List pending assistance requests
- **Response**:
```json
[
    {
        "id": 5,
        "tender": {
            "id": 26,
            "title": "Residential House Construction",
            "status": "draft",
            "customer": {
                "id": 3,
                "user": {
                    "first_name": "Vihaan",
                    "last_name": "Mehta",
                    "email": "vihaan.mehta2@example.com"
                }
            }
        },
        "virtual_appointment": 10,
        "assistance_type": "creation",
        "status": "pending",
        "notes": "Need help structuring requirements for house construction project",
        "recommendations": "",
        "supervisor_notes": "",
        "created_at": "2025-08-03T10:30:00.000000Z",
        "updated_at": "2025-08-03T10:30:00.000000Z"
    }
]
```

#### Provide Assistance
- **URL**: `POST /virtual-appointments/{appointment_id}/assistance/`
- **Auth**: Required (Supervisor)
- **Description**: Create assistance record for virtual appointment
- **Request Body**:
```json
{
    "assistance_type": "creation|modification|review",
    "notes": "string",
    "recommendations": "string"
}
```

#### Update Assistance Status
- **URL**: `PUT /tender-assistance/{assistance_id}/`
- **Auth**: Required (Supervisor)
- **Description**: Update assistance request status and notes
- **Request Body**:
```json
{
    "status": "completed",
    "recommendations": "Added detailed requirement breakdown and suggested timeline adjustments",
    "supervisor_notes": "Customer requirements clarified, ready for contractor bidding"
}
```
- **Response**:
```json
{
    "id": 5,
    "tender": {
        "id": 26,
        "title": "Residential House Construction",
        "status": "draft"
    },
    "virtual_appointment": 10,
    "assistance_type": "creation",
    "status": "completed",
    "notes": "Need help structuring requirements for house construction project",
    "recommendations": "Added detailed requirement breakdown and suggested timeline adjustments",
    "supervisor_notes": "Customer requirements clarified, ready for contractor bidding",
    "created_at": "2025-08-03T10:30:00.000000Z",
    "updated_at": "2025-08-03T11:00:00.000000Z"
}
```

### Quality Assurance

#### Approve/Reject Tender Milestones
- **URL**: `PUT /tenders/{tender_id}/milestones/{milestone_id}/approve/`
- **Auth**: Required (Supervisor)
- **Description**: Approve or request changes to milestone completion

#### Validate Tender Completion
- **URL**: `PUT /tenders/{tender_id}/validate/`
- **Auth**: Required (Supervisor)
- **Description**: Final validation and approval of completed tender

---

## Common Response Formats

### Success Response
```json
{
    "status": "success",
    "data": {...},
    "message": "Operation completed successfully"
}
```

### Error Response
```json
{
    "status": "error",
    "message": "Error description",
    "errors": {
        "field_name": ["Error message"]
    }
}
```

### Pagination Response
```json
{
    "count": 100,
    "next": "http://localhost:8000/api/endpoint/?page=2",
    "previous": null,
    "results": [...]
}
```

---

## HTTP Status Codes

- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Other endpoints: 60 requests per minute per user
- File upload endpoints: 10 requests per minute

---

## File Upload Guidelines

- Maximum file size: 10MB
- Supported formats: JPG, PNG, PDF, DOC, DOCX
- Files are stored in `/media/` directory
- Use multipart/form-data content type

---

## Business Rules

1. **Tender Creation**: Only customers can create tenders
2. **Bidding**: Only contractors can submit bids
3. **Assignment**: Tenders can only be assigned to contractors who bid
4. **Progress Updates**: Only assigned contractors can update progress
5. **Supervision**: Supervisors can oversee all tenders in their service areas
6. **Assistance**: Only supervisors can provide tender assistance
7. **Quality Control**: Supervisors must validate milestone completions
8. **Virtual Appointments**: Can only have one assistance record per appointment

---

This documentation provides comprehensive coverage of all API endpoints organized by user roles, with complete request/response examples and business context for each endpoint's usage.
