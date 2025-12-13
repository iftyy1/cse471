# API Endpoints Documentation

Base URL: `http://localhost:1092`

All endpoints that require authentication need a Bearer token in the Authorization header:
```
Authorization: Bearer <your-token>
```

---

## Authentication Endpoints

### 1. Register User
- **Endpoint:** `POST /api/auth/register`
- **Authentication:** Not required
- **Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student" // optional, defaults to "student"
}
```
- **Response (201):**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### 2. Login User
- **Endpoint:** `POST /api/auth/login`
- **Authentication:** Not required
- **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

## Jobs Endpoints

### 3. Get All Jobs
- **Endpoint:** `GET /api/jobs`
- **Authentication:** Not required
- **Query Parameters:**
  - `type` (optional): Filter by job type (full-time, part-time, internship, contract, freelance)
  - `location` (optional): Filter by location (partial match)
  - `search` (optional): Search in title, company, or description
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Example:** `GET /api/jobs?type=internship&location=New York&page=1&limit=10`
- **Response (200):**
```json
{
  "jobs": [
    {
      "id": 1,
      "title": "Software Engineer Intern",
      "company": "Tech Corp",
      "location": "New York, NY",
      "type": "internship",
      "description": "We are looking for...",
      "requirements": "Bachelor's degree...",
      "salary_min": 50000,
      "salary_max": 70000,
      "application_deadline": "2024-12-31",
      "created_at": "2024-01-15T10:00:00Z",
      "posted_by_name": "John Doe",
      "application_count": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 4. Get Job by ID
- **Endpoint:** `GET /api/jobs/:id`
- **Authentication:** Not required
- **Example:** `GET /api/jobs/1`
- **Response (200):**
```json
{
  "id": 1,
  "title": "Software Engineer Intern",
  "company": "Tech Corp",
  "location": "New York, NY",
  "type": "internship",
  "description": "We are looking for...",
  "requirements": "Bachelor's degree...",
  "salary_min": 50000,
  "salary_max": 70000,
  "application_deadline": "2024-12-31",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z",
  "posted_by": 1,
  "posted_by_name": "John Doe",
  "posted_by_email": "john@example.com",
  "application_count": 5
}
```

### 5. Create Job
- **Endpoint:** `POST /api/jobs`
- **Authentication:** Required
- **Request Body:**
```json
{
  "title": "Software Engineer Intern",
  "company": "Tech Corp",
  "location": "New York, NY",
  "type": "internship",
  "description": "We are looking for a talented software engineer intern...",
  "requirements": "Bachelor's degree in Computer Science or related field...",
  "salary_min": 50000,
  "salary_max": 70000,
  "application_deadline": "2024-12-31"
}
```
- **Required Fields:** title, company, location, type, description, requirements
- **Optional Fields:** salary_min, salary_max, application_deadline
- **Response (201):**
```json
{
  "id": 1,
  "title": "Software Engineer Intern",
  "company": "Tech Corp",
  "location": "New York, NY",
  "type": "internship",
  "description": "We are looking for...",
  "requirements": "Bachelor's degree...",
  "salary_min": 50000,
  "salary_max": 70000,
  "application_deadline": "2024-12-31",
  "posted_by": 1,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### 6. Update Job
- **Endpoint:** `PUT /api/jobs/:id`
- **Authentication:** Required (must be job owner or admin)
- **Example:** `PUT /api/jobs/1`
- **Request Body:** (all fields optional, only provided fields will be updated)
```json
{
  "title": "Updated Title",
  "salary_max": 80000
}
```
- **Response (200):**
```json
{
  "id": 1,
  "title": "Updated Title",
  "company": "Tech Corp",
  "location": "New York, NY",
  "type": "internship",
  "description": "We are looking for...",
  "requirements": "Bachelor's degree...",
  "salary_min": 50000,
  "salary_max": 80000,
  "application_deadline": "2024-12-31",
  "posted_by": 1,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T11:00:00Z"
}
```

### 7. Delete Job
- **Endpoint:** `DELETE /api/jobs/:id`
- **Authentication:** Required (must be job owner or admin)
- **Example:** `DELETE /api/jobs/1`
- **Response (200):**
```json
{
  "message": "Job deleted successfully"
}
```

---

## Application Endpoints

### 8. Apply to Job
- **Endpoint:** `POST /api/jobs/:id/apply`
- **Authentication:** Required
- **Example:** `POST /api/jobs/1/apply`
- **Request Body:**
```json
{
  "cover_letter": "I am writing to apply for...",
  "resume_url": "https://example.com/resume.pdf"
}
```
- **Response (201):**
```json
{
  "id": 1,
  "job_id": 1,
  "user_id": 2,
  "status": "pending",
  "cover_letter": "I am writing to apply for...",
  "resume_url": "https://example.com/resume.pdf",
  "applied_at": "2024-01-15T12:00:00Z",
  "updated_at": "2024-01-15T12:00:00Z"
}
```

### 9. Get Applications for Job
- **Endpoint:** `GET /api/jobs/:id/apply`
- **Authentication:** Required (must be job owner or admin)
- **Example:** `GET /api/jobs/1/apply`
- **Response (200):**
```json
{
  "applications": [
    {
      "id": 1,
      "job_id": 1,
      "user_id": 2,
      "status": "pending",
      "cover_letter": "I am writing to apply for...",
      "resume_url": "https://example.com/resume.pdf",
      "applied_at": "2024-01-15T12:00:00Z",
      "updated_at": "2024-01-15T12:00:00Z",
      "applicant_name": "Jane Smith",
      "applicant_email": "jane@example.com"
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Error message describing what went wrong"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Database Initialization

Before using the API, make sure your Neon DB (PostgreSQL) database is set up. You can initialize the database tables by:

1. Making a GET request to `/api/init-db` (optional - tables auto-create on first use)
2. Or manually running the SQL from `DATABASE_SETUP.md`

### Initialize Database
- **Endpoint:** `GET /api/init-db`
- **Authentication:** Not required
- **Response (200):**
```json
{
  "message": "Database initialized successfully"
}
```

## Postman Collection Setup

### Environment Variables
Create a Postman environment with:
- `base_url`: `http://localhost:1092`
- `token`: (will be set after login)

### Testing Flow

1. **Register a new user:**
   - POST `{{base_url}}/api/auth/register`
   - Save the `token` from response to environment variable

2. **Login (alternative):**
   - POST `{{base_url}}/api/auth/login`
   - Save the `token` from response to environment variable

3. **Get all jobs:**
   - GET `{{base_url}}/api/jobs`

4. **Get a specific job:**
   - GET `{{base_url}}/api/jobs/1`

5. **Create a job (requires auth):**
   - POST `{{base_url}}/api/jobs`
   - Header: `Authorization: Bearer {{token}}`

6. **Update a job (requires auth):**
   - PUT `{{base_url}}/api/jobs/1`
   - Header: `Authorization: Bearer {{token}}`

7. **Delete a job (requires auth):**
   - DELETE `{{base_url}}/api/jobs/1`
   - Header: `Authorization: Bearer {{token}}`

8. **Apply to a job (requires auth):**
   - POST `{{base_url}}/api/jobs/1/apply`
   - Header: `Authorization: Bearer {{token}}`

9. **Get applications for a job (requires auth, owner/admin only):**
   - GET `{{base_url}}/api/jobs/1/apply`
   - Header: `Authorization: Bearer {{token}}`

---

## Marketplace Endpoints

### 10. Get Marketplace Listings
- **Endpoint:** `GET /api/marketplace`
- **Authentication:** Not required
- **Response (200):**
```json
[
  {
    "id": 1,
    "title": "Complete Calculus Notes (MATH 205)",
    "type": "Notes",
    "course": "Calculus II",
    "price": 18,
    "condition": "Digital PDF • Annotated",
    "location": "Download / Campus pickup",
    "deliveryOptions": ["Instant PDF download", "Optional printed copy", "Solved examples"],
    "seller": "Aisha Rahman",
    "sellerYear": "Sophomore • Mathematics",
    "postedAt": "2 days ago",
    "description": "150+ pages of color-coded Calculus II notes...",
    "highlights": ["Midterm-focused summaries", "Formula bank", "Practice problems with solutions"],
    "contactEmail": "aisha.rahman@example.edu",
    "previewPages": 12
  }
]
```

### 11. Create Marketplace Listing
- **Endpoint:** `POST /api/marketplace`
- **Authentication:** Required (seller, admin, or verified student vendor)
- **Request Body:**
```json
{
  "title": "3D-printed dorm desk organizer",
  "type": "Supplies",
  "course": "General",
  "price": 25,
  "condition": "Brand new • Custom colors available",
  "location": "North Campus lockers",
  "deliveryOptions": ["In-person handoff", "Locker drop-off"],
  "description": "Modular organizer with whiteboard slot + pencil tray.",
  "highlights": ["Custom engraving", "Includes sticky notes"],
  "contactEmail": "maker.labs@example.edu",
  "images": ["https://cdn.example.edu/market/desk-organizer-front.jpg"]
}
```
- **Required Fields:** `title`, `type`, `price`, `description`, `contactEmail`
- **Defaults:** `deliveryOptions` defaults to `["Meet on campus"]`, `location` defaults to `"Campus"`
- **Response (201):**
```json
{
  "id": 18,
  "title": "3D-printed dorm desk organizer",
  "type": "Supplies",
  "price": 25,
  "status": "active",
  "sellerId": 7,
  "createdAt": "2025-11-20T17:31:00.000Z"
}
```
- **Validation Errors:**
  - `400` when required fields missing or `price < 0`
  - `413` when more than 6 `images` URLs are provided

### 12. Get Marketplace Listing by ID
- **Endpoint:** `GET /api/marketplace/:id`
- **Authentication:** Not required
- **Example:** `GET /api/marketplace/2`
- **Response (200):** Same shape as above

---

## Tournament & Event Endpoints

### 13. Get All Tournaments
- **Endpoint:** `GET /api/tournaments`
- **Authentication:** Not required
- **Response (200):**
```json
[
  {
    "id": 101,
    "title": "Inter-University Hackathon 2025",
    "organizer": "Innovation Lab",
    "category": "Technology",
    "location": "Engineering Hall • Hybrid",
    "dateRange": "Dec 5 - Dec 7, 2025",
    "registrationDeadline": "Nov 30, 2025",
    "prizePool": "$4,000 cash + incubator slots",
    "maxParticipants": 30,
    "enrolledParticipants": 18,
    "description": "Build solutions for campus sustainability challenges...",
    "rules": [
      "Teams must have at least one first or second year student",
      "Code must be pushed to the provided GitHub repository",
      "Final presentations limited to 6 minutes + Q&A"
    ],
    "tags": ["Hackathon", "Sustainability", "Team Event"],
    "status": "Upcoming"
  }
]
```

### 14. Get Tournament by ID
- **Endpoint:** `GET /api/tournaments/:id`
- **Authentication:** Not required
- **Example:** `GET /api/tournaments/205`

### 15. Join Tournament
- **Endpoint:** `POST /api/tournaments/:id/join`
- **Authentication:** Not required
- **Example:** `POST /api/tournaments/101/join`
- **Request Body:**
```json
{
  "participant": "Team Lambda"
}
```
- **Responses:**
  - `201` (default): `{"message": "You have joined the tournament roster", "participant": "Team Lambda", "tournamentId": 101}`
  - `404`: `{"error": "Tournament not found"}`
  - `409`: `{"message": "Tournament is full. Added to waitlist."}`

---

## Student Tutor Endpoints

### 16. Get All Tutors
- **Endpoint:** `GET /api/tutors`
- **Authentication:** Not required
- **Response (200):**
```json
[
  {
    "id": 1,
    "name": "Sofia Martinez",
    "subjects": ["Calculus II", "Linear Algebra", "Differential Equations"],
    "hourlyRate": 22,
    "year": "Senior • Applied Mathematics",
    "headline": "Exam-focused calc prep with live problem solving workshops",
    "description": "I run structured 75-minute sessions...",
    "mode": "Hybrid",
    "availability": "Tue & Thu evenings • Sat mornings",
    "achievements": ["4.9/5 average rating", "Math Learning Center Lead", "Putnam Honorable Mention"],
    "contactEmail": "sofia.martinez@example.edu",
    "sessionsHosted": 48,
    "rating": 4.9,
    "joinedStudents": 9,
    "maxStudents": 12
  }
]
```

### 17. Get Tutor by ID
- **Endpoint:** `GET /api/tutors/:id`
- **Authentication:** Not required
- **Example:** `GET /api/tutors/2`

### 18. Join Tutor Session
- **Endpoint:** `POST /api/tutors/:id/join`
- **Authentication:** Not required
- **Example:** `POST /api/tutors/1/join`
- **Request Body:**
```json
{
  "student": "Alex Kim"
}
```
- **Responses:**
  - `201`: `{"message": "You have reserved a seat with this tutor", "student": "Alex Kim", "tutorId": 1}`
  - `404`: `{"error": "Tutor not found"}`
  - `409`: `{"message": "Session is full. Added to waitlist."}`

---

## Global Chat Endpoints

### 19. Get Chat Messages
- **Endpoint:** `GET /api/chat`
- **Authentication:** Not required
- **Response (200):**
```json
[
  {
    "id": 1,
    "author": "System",
    "content": "Welcome to the global study hall! Be respectful and share your best tips ✨",
    "createdAt": "2025-11-16T12:00:00.000Z"
  }
]
```

### 20. Send Chat Message
- **Endpoint:** `POST /api/chat`
- **Authentication:** Not required
- **Request Body:**
```json
{
  "author": "Jordan",
  "content": "Anyone sharing OS final tips?"
}
```
- **Response (201):**
```json
{
  "id": 5,
  "author": "Jordan",
  "content": "Anyone sharing OS final tips?",
  "createdAt": "2025-11-16T13:05:00.000Z"
}
```
- **Validation:**
  - `author` and `content` are required strings
  - `content` maximum length: 500 characters

---

## Role-Based Profile Dashboard Endpoints

These endpoints let the frontend assemble a personalized dashboard depending on the authenticated user’s role (`student`, `seller`, `recruiter`, `tutor`, `admin`). All responses include a `role` key so clients can confirm what dataset they received.

### 21. Get Dashboard Overview
- **Endpoint:** `GET /api/dashboard/overview`
- **Authentication:** Required
- **Description:** Returns core profile info plus role-aware summary cards (counts, upcoming deadlines, unread notifications).
- **Response (200):**
```json
{
  "user": {
    "id": 7,
    "name": "Aisha Rahman",
    "role": "seller",
    "avatarUrl": "https://cdn.example.edu/avatars/aisha.png",
    "program": "Mathematics • Sophomore"
  },
  "role": "seller",
  "widgets": {
    "marketplaceStats": {
      "activeListings": 4,
      "pendingInquiries": 3,
      "earningsThisMonth": 142
    },
    "recommendedActions": [
      "Respond to 2 unanswered buyer questions",
      "Promote Calculus II bundle before finals week"
    ]
  },
  "notifications": [
    {"id": 81, "message": "You have a new order for Calculus bundle", "read": false}
  ]
}
```
- **Errors:** `401` when token missing/invalid.

### 22. Get Role Activity Feed
- **Endpoint:** `GET /api/dashboard/:role/activity`
- **Authentication:** Required (requested `:role` must match authenticated user’s role unless admin)
- **Query Params:** `limit` (default 10), `cursor` (for pagination), `filters` (comma-separated tags like `jobs,marketplace`)
- **Response (200):**
```json
{
  "role": "recruiter",
  "activity": [
    {
      "type": "job_application",
      "title": "New applicant for UX Research Intern",
      "jobId": 42,
      "applicant": "Mina Patel",
      "timestamp": "2025-11-20T09:15:00.000Z"
    },
    {
      "type": "job_post",
      "title": "Full-stack Fellow position published",
      "jobId": 44,
      "timestamp": "2025-11-19T20:04:00.000Z"
    }
  ],
  "nextCursor": "eyJpZCI6NDIsInQiOiIyMDI1LTExLTE5In0="
}
```
- **Errors:** `403` if role mismatch, `404` when unsupported role provided.

### 23. Update Dashboard Preferences
- **Endpoint:** `PUT /api/dashboard/preferences`
- **Authentication:** Required
- **Description:** Allows users to customize which widgets/tabs show by default.
- **Request Body:**
```json
{
  "role": "student",
  "defaultTab": "jobs",
  "widgetOrder": ["applications", "deadlines", "tournaments"],
  "notificationsMuted": false
}
```
- **Response (200):**
```json
{
  "message": "Dashboard preferences saved",
  "preferences": {
    "role": "student",
    "defaultTab": "jobs",
    "widgetOrder": ["applications", "deadlines", "tournaments"],
    "notificationsMuted": false,
    "updatedAt": "2025-11-20T18:02:00.000Z"
  }
}
```
- **Validation Rules:** `widgetOrder` must be an array of predefined widget keys, `role` must match authenticated user unless admin.

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Job types: `full-time`, `part-time`, `internship`, `contract`, `freelance`
- Application statuses: `pending`, `accepted`, `rejected`
- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt
- Database uses Neon DB (PostgreSQL) with proper foreign key constraints

