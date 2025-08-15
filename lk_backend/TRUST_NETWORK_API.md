# Trust Network API Documentation

## Overview
The Trust Network API provides endpoints for implementing a hyperlocal trust-based recommendation system. This enables a dual-track economy where customers can access both formal tenders and informal quick jobs through social recommendations.

## Base URL
All trust network endpoints are prefixed with `/api/trust-network/`

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. Trust Connections

#### Create/List Trust Connections
**Endpoint:** `POST/GET /api/trust-network/trust-connections/`

**Description:** Create recommendations for contractors or list user's given recommendations.

**POST Request Body:**
```json
{
    "contractor": 1,
    "comment": "Great electrician, fixed my AC quickly",
    "trust_level": 8,
    "service_context": 1
}
```

**GET Response:**
```json
[
    {
        "id": 1,
        "recommender": 1,
        "contractor": 2,
        "comment": "Great electrician, fixed my AC quickly",
        "trust_level": 8,
        "service_context": 1,
        "created_at": "2025-01-01T10:00:00Z",
        "updated_at": "2025-01-01T10:00:00Z",
        "recommender_details": {
            "id": 1,
            "email": "user@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "phone_number": "+1234567890",
            "role": "CUSTOMER"
        },
        "contractor_details": {
            "user": {...},
            "city": "Mumbai",
            "state": "Maharashtra",
            "rating": 4.5,
            "experience": 5,
            "address": "123 Main St"
        },
        "service_details": {
            "id": 1,
            "name": "Electrical Services",
            "description": "All electrical work"
        }
    }
]
```

### 2. Quick Jobs

#### Create/List Quick Jobs
**Endpoint:** `POST/GET /api/trust-network/quick-jobs/`

**Description:** Create informal quick jobs or list available jobs.

**POST Request Body:**
```json
{
    "service": 1,
    "title": "AC Repair Needed Urgently",
    "description": "My AC stopped working, need immediate repair",
    "location": "Andheri West, Mumbai",
    "urgency": "HIGH",
    "budget_suggestion": 2000.00,
    "raw_query": "AC theek karne wala chahiye urgent"
}
```

**GET Response:**
```json
[
    {
        "id": 1,
        "customer": 1,
        "service": 1,
        "title": "AC Repair Needed Urgently",
        "description": "My AC stopped working, need immediate repair",
        "location": "Andheri West, Mumbai",
        "status": "OPEN",
        "urgency": "HIGH",
        "budget_suggestion": "2000.00",
        "assigned_contractor": null,
        "assigned_at": null,
        "completed_at": null,
        "raw_query": "AC theek karne wala chahiye urgent",
        "parsed_intent": {},
        "created_at": "2025-01-01T10:00:00Z",
        "updated_at": "2025-01-01T10:00:00Z",
        "customer_details": {...},
        "service_details": {...},
        "assigned_contractor_details": null,
        "interests": []
    }
]
```

**Query Parameters:**
- `status`: Filter by job status (OPEN, ASSIGNED, COMPLETED, CANCELLED)
- `urgency`: Filter by urgency level (LOW, MEDIUM, HIGH, URGENT)
- `service`: Filter by service ID

#### Get Quick Job Details
**Endpoint:** `GET/PUT /api/trust-network/quick-jobs/{id}/`

**Description:** Get or update a specific quick job.

#### Assign Quick Job
**Endpoint:** `POST /api/trust-network/quick-jobs/{job_id}/assign/`

**Description:** Assign a quick job to a contractor (customer only).

**Request Body:**
```json
{
    "contractor_id": 2
}
```

#### Get My Quick Jobs
**Endpoint:** `GET /api/trust-network/my-quick-jobs/`

**Description:** Get current user's posted quick jobs.

### 3. Quick Job Interests

#### Express Interest in Quick Job
**Endpoint:** `POST /api/trust-network/quick-job-interests/`

**Description:** Allow contractors to express interest in quick jobs.

**Request Body:**
```json
{
    "quick_job": 1,
    "message": "I can fix your AC within 2 hours",
    "proposed_price": 1800.00
}
```

### 4. Trust Network Features

#### Get Trusted Contractors
**Endpoint:** `GET /api/trust-network/trusted-contractors/`

**Description:** Get contractors recommended by user's trust network.

**Query Parameters:**
- `service`: Filter by service ID

**Response:**
```json
[
    {
        "contractor": {
            "user": {...},
            "city": "Mumbai",
            "state": "Maharashtra",
            "rating": 4.5,
            "trust_score": 7.8
        },
        "trust_score": 87.8,
        "recommendation_count": 3,
        "direct_recommendations": 1,
        "indirect_recommendations": 2,
        "connection_path": ["John", "Raj", "Electrician"]
    }
]
```

### 5. NLP Integration

#### Parse Voice Query
**Endpoint:** `POST /api/trust-network/parse-voice-query/`

**Description:** Parse natural language queries into structured quick job data.

**Request Body:**
```json
{
    "query": "AC theek karne wala chahiye urgent"
}
```

**Response:**
```json
{
    "raw_query": "AC theek karne wala chahiye urgent",
    "parsed_intent": {
        "service_category": "electrical",
        "urgency": "HIGH",
        "keywords": ["AC", "repair", "urgent"],
        "suggested_title": "AC Repair Needed",
        "confidence": 0.85
    },
    "suggested_quick_job": {
        "title": "AC Repair Needed",
        "urgency": "HIGH",
        "description": "Parsed from: AC theek karne wala chahiye urgent"
    }
}
```

## Data Models

### Contractor Type Enum
- `VERIFIED`: Verified contractors (existing formal system)
- `COMMUNITY`: Community-recommended contractors (trust network)

### Quick Job Status
- `OPEN`: Job is open for expressions of interest
- `ASSIGNED`: Job has been assigned to a contractor
- `COMPLETED`: Job is completed
- `CANCELLED`: Job was cancelled

### Urgency Levels
- `LOW`: Can wait a few days
- `MEDIUM`: Needed within 24 hours (default)
- `HIGH`: Needed within a few hours
- `URGENT`: Immediate attention required

## Trust Score Calculation

### Network Trust Score Algorithm
1. **1st Degree (Direct Recommendations)**: Weight = 10
   - User directly recommended this contractor
   - Score = trust_level * 10 + base_trust_score

2. **2nd Degree (Indirect Recommendations)**: Weight = 3
   - Recommended by someone user has recommended
   - Score = avg_trust_level * 3 + base_trust_score

3. **Base Trust Score**: Overall trust score from all recommendations

### Trust Score Update
When a new recommendation is added:
1. Recalculate contractor's overall trust score
2. Create audit log entry
3. Update contractor's trust_score field

## Example Workflows

### 1. Customer Seeking AC Repair
```
1. POST /api/trust-network/parse-voice-query/
   Body: {"query": "AC repair urgently needed"}

2. POST /api/trust-network/quick-jobs/
   Body: Use parsed intent to create quick job

3. GET /api/trust-network/trusted-contractors/?service=1
   Get recommended contractors for electrical work

4. POST /api/trust-network/quick-jobs/1/assign/
   Assign job to chosen contractor
```

### 2. Contractor Expressing Interest
```
1. GET /api/trust-network/quick-jobs/?status=OPEN
   Browse available quick jobs

2. POST /api/trust-network/quick-job-interests/
   Express interest in specific job
```

### 3. Building Trust Network
```
1. POST /api/trust-network/trust-connections/
   Recommend a contractor after successful work

2. GET /api/trust-network/trusted-contractors/
   See updated recommendations in network
```

## Error Responses

### 400 Bad Request
```json
{
    "error": "Validation error message"
}
```

### 403 Forbidden
```json
{
    "error": "Only contractors can express interest in jobs"
}
```

### 404 Not Found
```json
{
    "error": "Quick job not found or not owned by user"
}
```

## Rate Limiting
- Trust connections: 10 per hour per user
- Quick jobs: 5 per hour per user
- Quick job interests: 20 per hour per contractor

## Notes
- All timestamps are in UTC
- Decimal fields use 2 decimal places
- Trust scores range from 0.0 to 100.0
- The NLP parsing endpoint currently returns mock data; integrate with Gemini API for production
