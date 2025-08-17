# Local-Konnect Backend API Documentation

This document provides a comprehensive overview of all backend API endpoints, their HTTP methods, expected request bodies, and example JSON responses. All endpoints are prefixed with `/api/` unless otherwise noted.

---

## Table of Contents
- [Accounts Endpoints](#accounts-endpoints)
- [Needs Endpoints](#needs-endpoints)
- [Appointments Endpoints](#appointments-endpoints)
- [Works Endpoints](#works-endpoints)

---

## Accounts Endpoints

### POST `/api/register/customer/`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "1234567890",
  "city": "CityName",
  "state": "StateName",
  "customer_image": null
}
```
**Success Response:**
```json
{ "message": "Customer registered successfully" }
```
**Error Response:**
```json
{ "email": ["This field must be unique."] }
```

---

### POST `/api/register/contractor/`
**Request:**
```json
{
  "email": "contractor@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "9876543210",
  "city": "CityName",
  "state": "StateName",
  "contractor_image": null,
  "rating": 4.5,
  "experience": 5,
  "address": "123 Main St"
}
```
**Success Response:**
```json
{ "message": "Contractor registered successfully" }
```

---

### POST `/api/register/supervisor/`
**Request:**
```json
{
  "email": "supervisor@example.com",
  "password": "password123",
  "first_name": "Sam",
  "last_name": "Lee",
  "phone_number": "5555555555",
  "city": "CityName",
  "state": "StateName",
  "supervisor_image": null,
  "rating": 4.8,
  "address": "456 Main St"
}
```
**Success Response:**
```json
{ "message": "Supervisor registered successfully" }
```

---

### POST `/api/login/`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Success Response:**
```json
{
  "refresh": "jwt-refresh-token",
  "access": "jwt-access-token",
  "email": "user@example.com",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "1234567890",
    "role": "CUSTOMER"
  }
}
```
**Error Response:**
```json
{ "non_field_errors": ["Invalid email or password"] }
```

---

### GET `/api/profile/`
**Headers:** `Authorization: Bearer <access_token>`
**Success Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "1234567890",
  "role": "CUSTOMER",
  "profile_data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "1234567890",
      "role": "CUSTOMER"
    },
    "city": "CityName",
    "state": "StateName",
    "customer_image": null
  },
  "address": null
}
```
**Error Response:**
```json
{ "error": "Failed to retrieve profile" }
```

---

### PUT `/api/profile/`
**Request:**
```json
{
  "user": {
    "first_name": "Jane",
    "last_name": "Smith"
  },
  "phone": "9876543210",
  "address": "New Address"
}
```
**Success Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone": "9876543210",
  "role": "CUSTOMER",
  "profile_data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "phone_number": "9876543210",
      "role": "CUSTOMER"
    },
    "city": "CityName",
    "state": "StateName",
    "customer_image": null
  },
  "address": "New Address"
}
```
**Error Response:**
```json
{ "error": "Failed to update profile" }
```

---

### GET `/api/customers/`
**Success Response:**
```json
[
  {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "1234567890",
      "role": "CUSTOMER"
    },
    "city": "CityName",
    "state": "StateName",
    "customer_image": null
  }
]
```

### GET `/api/contractors/`
**Success Response:**
```json
[
  {
    "user": {
      "id": 2,
      "email": "contractor@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "phone_number": "9876543210",
      "role": "CONTRACTOR"
    },
    "city": "CityName",
    "state": "StateName",
    "contractor_image": null,
    "rating": 4.5,
    "experience": 5,
    "address": "123 Main St"
  }
]
```

---

## Needs Endpoints

### GET `/api/services/`
**Success Response:**
```json
[
  { "id": 1, "name": "Plumbing" },
  { "id": 2, "name": "Electrical" }
]
```

### POST `/api/services/`
**Request:**
```json
{ "name": "Painting" }
```
**Success Response:**
```json
{ "id": 3, "name": "Painting" }
```

### GET `/api/services/<int:pk>/`
**Success Response:**
```json
{ "id": 1, "name": "Plumbing" }
```

### GET `/api/services/<int:service_id>/contractors/`
**Success Response:**
```json
[
  { "user": { "id": 2, "email": "contractor@example.com", "first_name": "Jane", "last_name": "Smith", "phone_number": "9876543210", "role": "CONTRACTOR" }, "city": "CityName", "state": "StateName", "contractor_image": null, "rating": 4.5, "experience": 5, "address": "123 Main St" }
]
```

### GET `/api/requirement-categories/`
**Success Response:**
```json
[
  { "id": 1, "name": "Plumbing" },
  { "id": 2, "name": "Electrical" }
]
```

### GET `/api/requirements/`
**Success Response:**
```json
[
  { "id": 1, "name": "Pipe Fitting" }
]
```

---

## Appointments Endpoints

### GET `/api/appointments/virtual/customer/`
**Success Response:**
```json
[
  { "id": 1, "supervisor": 2, "date": "2025-08-01T10:00:00Z", "status": "SCHEDULED" }
]
```

### GET `/api/appointments/physical/customer/`
**Success Response:**
```json
[
  { "id": 1, "supervisor": 2, "date": "2025-08-01T10:00:00Z", "status": "SCHEDULED" }
]
```

---

## Works Endpoints

### POST `/api/tenders/create/`
**Request:**
```json
{ "title": "New Plumbing Tender", "description": "Fix kitchen sink" }
```
**Success Response:**
```json
{ "id": 1, "title": "New Plumbing Tender", "description": "Fix kitchen sink" }
```

### GET `/api/tenders/customer/`
**Success Response:**
```json
[
  { "id": 1, "title": "New Plumbing Tender", "description": "Fix kitchen sink" }
]
```

### POST `/api/tenders/assign-contractors/`
**Request:**
```json
{ "tender_id": 1, "contractor_ids": [2, 3] }
```
**Success Response:**
```json
{ "message": "Contractors assigned" }
```

### POST `/api/tenders/<int:pk>/select-contractor/`
**Request:**
```json
{ "contractor_id": 2 }
```
**Success Response:**
```json
{ "message": "Contractor selected" }
```

### GET `/api/tender-bids/tender/<int:tender_id>/`
**Description:** For contractors to view bids for a tender they're involved in.
**Success Response:**
```json
[
  { "id": 1, "tender": 1, "contractor": 2, "amount": 5000, "status": "PENDING" }
]
```

### GET `/api/customer/tender-bids/<int:tender_id>/`
**Description:** For customers to view all bids submitted for their tender.
**Success Response:**
```json
[
  { "id": 1, "tender_requirement": 1, "contractor": 2, "bid_amount": "5000.00", "proposal_description": "...", "is_final": true, "timestamp": "2025-08-01T10:00:00Z" }
]
```

### GET `/api/customer/tender/<int:tender_id>/bid-summary/`
**Description:** For customers to get a comprehensive bid summary grouped by contractor.
**Success Response:**
```json
[
  {
    "contractor_id": 2,
    "name": "John Doe",
    "city": "CityName",
    "state": "StateName", 
    "rating": 4.5,
    "experience": 5,
    "bids": [
      {
        "requirement": "Pipe Fitting",
        "quantity": 10,
        "bid_amount": "500.00",
        "subtotal": "5000.00"
      }
    ],
    "total_bid": "5000.00"
  }
]
```

### POST `/api/tender-requirements/create/`
**Request:**
```json
{ "tender": 1, "requirement": "Pipe Fitting" }
```
**Success Response:**
```json
{ "id": 1, "tender": 1, "requirement": "Pipe Fitting" }
```

---

*For all endpoints, error responses for validation will be in the form:*
```json
{ "field_name": ["Error message"] }
```

*All endpoints requiring authentication expect the header:*
```
Authorization: Bearer <access_token>
```

---

For any endpoint not listed here, refer to the corresponding serializer and model for the exact field structure.

---

## Additional Endpoints (from backend `works/urls.py`)

### Milestones, Progress, Attachments, Audit, Versioning, Assignment

#### GET `/api/tenders/<tender_id>/milestones/`
**Response:**
```json
[
  { "id": 1, "tender": 1, "title": "Site Survey", "description": "Initial site survey", "due_date": "2024-07-01", "completed_date": null, "completion_notes": "", "attachments": [], "status": "pending", "created_at": "2024-06-01T10:00:00Z", "updated_at": "2024-06-01T10:00:00Z" }
]
```
#### POST `/api/tenders/<tender_id>/milestones/`
**Request:**
```json
{ "title": "Site Survey", "description": "Initial site survey", "due_date": "2024-07-01" }
```
**Response:**
```json
{ "id": 2, "tender": 1, "title": "Site Survey", ... }
```
#### GET/PUT/DELETE `/api/tender-milestones/<pk>/`
**Response:**
```json
{ "id": 1, "tender": 1, "title": "Site Survey", ... }
```
#### GET/PUT `/api/tenders/<tender_id>/progress/`
**Response:**
```json
{ "id": 1, "tender": 1, "percent_complete": 50.0, "last_activity": "2024-06-01T10:00:00Z", "current_phase": "execution", "next_milestone": 2, "notes": "Work ongoing" }
```
#### GET/POST `/api/tenders/<tender_id>/attachments/`
**Response:**
```json
[
  { "id": 1, "tender": 1, "file": "/media/contract.pdf", "name": "Contract", "file_type": "contract", ... }
]
```
#### GET/DELETE `/api/tender-attachments/<pk>/`
**Response:**
```json
{ "id": 1, "tender": 1, "file": "/media/contract.pdf", ... }
```
#### GET `/api/tenders/<tender_id>/audit-log/`
**Response:**
```json
[
  { "id": 1, "tender": 1, "user": 2, "action": "create", "description": "Tender created", "created_at": "2024-06-01T10:00:00Z" }
]
```
#### GET `/api/tenders/<tender_id>/versions/`
**Response:**
```json
[
  { "id": 1, "tender": 1, "version_number": 1, "data": { ... }, "created_by": 2, "created_at": "2024-06-01T10:00:00Z", "comment": "Initial version" }
]
```
#### GET/PUT `/api/tender-assignments/<pk>/`
**Response:**
```json
{ "id": 1, "tender": 1, "contractor": 2, "payment_status": "pending", "start_date": "2024-07-01", "due_date": "2024-08-01", "total_amount": 10000.0, ... }
```
#### GET/POST `/api/tenders/<tender_id>/progress-notes/`
**Response:**
```json
[
  { "id": 1, "tender": 1, "author": 2, "note": "Work started", "created_at": "2024-06-01T10:00:00Z" }
]
```

### Supervisor Services
#### GET/POST `/api/supervisor/services/`
**Response:**
```json
[
  { "id": 1, "supervisor": 2, "service": 1, "hourly_rate": 100.0, "physical_visit_fee": 200.0, ... }
]
```
#### DELETE `/api/supervisor/services/<service_id>/`
**Response:**
```json
{ "detail": "Service deleted" }
```

### Tender Assistance & Assisted Tender
#### POST `/api/tender-assistance/create/`
**Request:**
```json
{ "virtual_appointment": 1, "physical_visit": 2, "customer": 1, "supervisor": 2, "service": 1, "requirements_discussed": {}, "estimated_budget": 10000, "project_timeline_days": 30, "special_instructions": "", "status": "in_progress" }
```
**Response:**
```json
{ "id": 1, ... }
```
#### GET `/api/tender-assistance/customer/`
**Response:**
```json
[
  { "id": 1, ... }
]
```
#### GET `/api/tender-assistance/supervisor/`
**Response:**
```json
[
  { "id": 1, ... }
]
```
#### POST `/api/tenders/assisted/create/`
**Request:**
```json
{ "assistance": 1, "title": "New Project", "description": "..." }
```
**Response:**
```json
{ "id": 1, ... }
```

### Contractor/Customer/Supervisor Tender Views
#### GET `/api/tenders/contractor/listed/`
**Response:**
```json
[
  { "id": 1, ... }
]
```
#### GET `/api/tenders/contractor/selected/`
**Response:**
```json
[
  { "id": 1, ... }
]
```
#### GET `/api/tenders/customer/assignments/`
**Response:**
```json
[
  { "id": 1, ... }
]
```
#### GET `/api/tenders/supervisor/`
**Response:**
```json
[
  { "id": 1, ... }
]
```

### Bidding & Bid Management
#### GET `/api/tender-bids/tender/<tender_id>/`
**Response:**
```json
[
  { "id": 1, "tender": 1, "contractor": 2, "amount": 5000, "status": "PENDING" }
]
```
#### POST `/api/tenders/<tender_id>/submit-bids/`
**Request:**
```json
[
  { "tender_requirement": 1, "bid_amount": 5000, "proposal_description": "...", "attachments": [] }
]
```
**Response:**
```json
{ "message": "Bids submitted" }
```
#### GET `/api/tenders/<tender_id>/requirements-with-bids/`
**Response:**
```json
[
  { "requirement": { ... }, "bids": [ ... ] }
]
```
#### GET `/api/tenders/contractor/assigned-with-bid-status/`
**Response:**
```json
[
  { "tender": 1, "bid_status": "PENDING" }
]
```
#### GET `/api/customer/tender/<tender_id>/bid-summary/`
**Response:**
```json
{ "tender": 1, "summary": { ... } }
```

### Virtual & Physical Appointments (Supervisor/Customer)
#### POST `/api/appointments/virtual/create/`
**Request:**
```json
{ "customer": 1, "supervisor": 2, "service": 1, "scheduled_time": "2025-08-01T10:00:00Z", ... }
```
**Response:**
```json
{ "id": 1, ... }
```
#### GET `/api/appointments/virtual/customer/`
**Response:**
```json
[
  { "id": 1, ... }
]
```
#### GET `/api/appointments/virtual/supervisor/`
**Response:**
```json
[
  { "id": 1, ... }
]
```
#### PATCH `/api/appointments/virtual/<pk>/update/`
**Request:**
```json
{ "scheduled_time": "2025-08-02T10:00:00Z", ... }
```
**Response:**
```json
{ "id": 1, ... }
```
#### POST `/api/appointments/virtual/<pk>/assess-complexity/`
**Request:**
```json
{ "complexity": "high", "notes": "..." }
```
**Response:**
```json
{ "assessment": "high", ... }
```
#### POST `/api/visits/physical/create/`
**Request:**
```json
{ "customer": 1, "supervisor": 2, "service": 1, "visit_address": "...", "scheduled_date": "2025-08-01", ... }
```
**Response:**
```json
{ "id": 1, ... }
```
#### GET `/api/visits/physical/customer/`
**Response:**
```json
[
  { "id": 1, ... }
]
```
#### GET `/api/visits/physical/supervisor/`
**Response:**
```json
[
  { "id": 1, ... }
]
```
#### PATCH `/api/visits/physical/<pk>/update/`
**Request:**
```json
{ "scheduled_date": "2025-08-02", ... }
```
**Response:**
```json
{ "id": 1, ... }
```
#### POST `/api/visits/physical/<visit_id>/payment/confirm/`
**Request:**
```json
{ "payment_status": "confirmed" }
```
**Response:**
```json
{ "message": "Payment confirmed" }
```

---

## Full Backend Flow & Data Model Overview

### 1. User Registration & Roles
User: The base user model supports four roles: CUSTOMER, CONTRACTOR, SUPERVISOR, ADMIN.
Customer, Contractor, Supervisor: Each role has an extended profile with city, state, image, and other details.

### 2. Service Discovery
Services: Master list of all services (e.g., painting, plumbing).
RequirementCategory: Each service has categories (e.g., “Wall Painting” under “Painting”).
Requirements: Each category has requirements (e.g., “Number of walls”, “Type of paint”).
ContractorServices: Links contractors to the services they offer.

### 3. Supervisor Consultation Flow
#### a. Virtual Appointment
VirtualAppointment: Customer books a virtual appointment with a supervisor for a service.
Fields: customer, supervisor, service, scheduled_time, duration, status, meeting_link, notes, estimated_budget_range, physical_visit_required, etc.
Status: scheduled → completed/cancelled/no_show
#### b. Physical Visit (Optional)
PhysicalVisit: If needed, customer books a physical visit (site inspection) with the supervisor.
Linked to the virtual appointment.
Fields: customer, supervisor, service, visit_address, scheduled_date/time, fee, status, payment_status, supervisor_notes, etc.
Status: scheduled → payment_pending → confirmed → completed/cancelled

### 4. Supervisor Assistance
TenderCreationAssistance: After the consultation (virtual or physical), the supervisor creates an assistance record summarizing requirements, budget, timeline, and instructions.
Fields: virtual_appointment, physical_visit, customer, supervisor, service, requirements_discussed (JSON), estimated_budget, project_timeline_days, special_instructions, status, tender_posted, tender (FK to Tenders).

### 5. Customer Posts Final Tender
The customer reviews the supervisor’s assistance record.
The customer uses the “assisted tender create” endpoint to post the final tender.
Tenders: The main work order/project entity.
Fields: title, description, customer, supervisor, service, location, start/end date, budget, selected_contractor, consultation (FK to TenderCreationAssistance), status, priority, etc.
Status: draft → published → in_progress → completed/cancelled

### 6. Tender Requirements
TenderRequirement: Each tender has requirements (linked to master Requirements and categories), with quantity, units, description, version, is_critical, etc.

### 7. Contractor Bidding
TenderContractor: Contractors are invited to or express interest in a tender.
Status: invited/accepted/declined/removed
TenderBids: Contractors submit bids for specific tender requirements.
Fields: tender_requirement, contractor, bid_amount, proposal_description, attachments, is_final, timestamp

### 8. Tender Assignment
Customer (or supervisor) selects a contractor.
TenderAssignment: Links the tender to the selected contractor, with payment status, contract file, payment schedule, etc.

### 9. Project Execution & Tracking
TenderMilestone: Key milestones for the project (title, description, due date, status, attachments).
TenderProgress: Tracks overall progress (percent_complete, current_phase, next_milestone, notes).
TenderAttachment: Files attached to tenders or requirements (documents, images, contracts, etc.).
TenderAuditLog: Logs all actions/changes on a tender (who did what, when, and from where).
TenderVersion: Version history of the tender (for tracking edits/changes).

### 10. Supervisor Services
SupervisorServices: Many-to-many between supervisors and services, with hourly rate, physical visit fee, expertise level, available days, languages, etc.

### Status Workflows
VirtualAppointment: scheduled → completed/cancelled/no_show
PhysicalVisit: scheduled → payment_pending → confirmed → completed/cancelled
TenderCreationAssistance: in_progress → completed/cancelled
Tenders: draft → published → in_progress → completed/cancelled
TenderAssignment: pending → paid/overdue/partially_paid/refunded

### End-to-End Example Flow
1. Customer registers and browses services.
2. Customer books a virtual appointment with a supervisor.
3. (Optional) Customer books a physical visit for site inspection.
4. Supervisor creates a TenderCreationAssistance record after consultation.
5. Customer reviews the assistance and posts the final tender.
6. Contractors are invited to bid; they submit TenderBids.
7. Customer (or supervisor) selects a contractor; TenderAssignment is created.
8. Project is tracked via milestones, progress, attachments, and audit logs.
9. All actions are versioned and auditable.

### Table Purposes (Summary)

| Table/Model                | Purpose/Role                                                      |
|----------------------------|-------------------------------------------------------------------|
| User                       | Main user, supports multiple roles                                |
| Customer/Contractor/Supervisor | Extended profiles for each user type                        |
| Services                   | List of available services                                        |
| RequirementCategory        | Categories for requirements                                      |
| Requirements               | Specific requirements under a category                           |
| ContractorServices         | Services offered by contractors                                  |
| Tenders                    | Main work order/project entity                                   |
| TenderRequirement          | Requirements for a tender                                        |
| TenderContractor           | Contractors invited to/participating in a tender                 |
| TenderBids                 | Bids by contractors for tender requirements                      |
| TenderAssignment           | Assignment of a tender to a contractor                           |
| TenderAttachment           | Files attached to tenders                                         |
| TenderAuditLog             | Logs of actions/changes on a tender                              |
| TenderVersion              | Version history of a tender                                      |
| TenderMilestone            | Key milestones for a tender                                      |
| TenderProgress             | Progress updates for a tender                                    |
| VirtualAppointment         | Online consultation between customer and supervisor              |
| PhysicalVisit              | On-site visit by supervisor                                      |
| TenderCreationAssistance   | Supervisor’s summary/assistance record after consultation, used by customer to post tender |
| SupervisorServices         | Services offered by a supervisor, with details                   |

---

## New Workflow & Audit Endpoints

### Milestones

#### GET `/api/tenders/<tender_id>/milestones/`
**Success Response:**
```json
[
  { "id": 1, "tender": 1, "title": "Site Survey", "description": "Initial site survey", "due_date": "2024-07-01", "completed_date": null, "completion_notes": "", "attachments": [], "status": "pending", "created_at": "2024-06-01T10:00:00Z", "updated_at": "2024-06-01T10:00:00Z" }
]
```

#### POST `/api/tenders/<tender_id>/milestones/`
**Request:**
```json
{ "title": "Site Survey", "description": "Initial site survey", "due_date": "2024-07-01" }
```
**Success Response:**
```json
{ "id": 2, "tender": 1, "title": "Site Survey", ... }
```

#### GET/PUT/DELETE `/api/tender-milestones/<pk>/`
**Success Response:**
```json
{ "id": 1, "tender": 1, "title": "Site Survey", ... }
```

### Progress

#### GET/PUT `/api/tenders/<tender_id>/progress/`
**Success Response:**
```json
{ "id": 1, "tender": 1, "percent_complete": 50.0, "last_activity": "2024-06-01T10:00:00Z", "current_phase": "execution", "next_milestone": 2, "notes": "Work ongoing" }
```

### Attachments

#### GET/POST `/api/tenders/<tender_id>/attachments/`
**Success Response:**
```json
[
  { "id": 1, "tender": 1, "file": "/media/contract.pdf", "name": "Contract", "file_type": "contract", ... }
]
```

#### GET/DELETE `/api/tender-attachments/<pk>/`
**Success Response:**
```json
{ "id": 1, "tender": 1, "file": "/media/contract.pdf", ... }
```

### Audit Log

#### GET `/api/tenders/<tender_id>/audit-log/`
**Success Response:**
```json
[
  { "id": 1, "tender": 1, "user": 2, "action": "create", "description": "Tender created", "created_at": "2024-06-01T10:00:00Z" }
]
```

### Version History

#### GET `/api/tenders/<tender_id>/versions/`
**Success Response:**
```json
[
  { "id": 1, "tender": 1, "version_number": 1, "data": { ... }, "created_by": 2, "created_at": "2024-06-01T10:00:00Z", "comment": "Initial version" }
]
```

### Assignment

#### GET/PUT `/api/tender-assignments/<pk>/`
**Success Response:**
```json
{ "id": 1, "tender": 1, "contractor": 2, "payment_status": "pending", "start_date": "2024-07-01", "due_date": "2024-08-01", "total_amount": 10000.0, ... }
```

### Supervisor Services Management

#### GET/POST `/api/supervisor/services/`
**Success Response:**
```json
[
  { "id": 1, "supervisor": 2, "service": 1, "hourly_rate": 100.0, "physical_visit_fee": 200.0, ... }
]
```

#### DELETE `/api/supervisor/services/<service_id>/`
**Success Response:**
```json
{ "detail": "Service deleted" }
```

### Progress Notes

#### GET/POST `/api/tenders/<tender_id>/progress-notes/`
**Success Response:**
```json
[
  { "id": 1, "tender": 1, "author": 2, "note": "Work started", "created_at": "2024-06-01T10:00:00Z" }
]
```
