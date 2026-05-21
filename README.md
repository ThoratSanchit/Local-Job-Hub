# Local Job Hub

An on-demand local manpower platform where any user can both post jobs and accept them as a worker — no fixed roles.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Fastify
- **Database:** MySQL + Sequelize ORM
- **Auth:** JWT + bcrypt

## Getting Started

### Prerequisites

- Node.js >= 18
- MySQL running locally

### Setup

```bash
npm install
```

Configure your `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=local_job_hub_db

JWT_SECRET=your_secret_key
```

### Run

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Tables are auto-created/altered on startup via `sequelize.sync({ alter: true })`.

---

## API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

---

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register a new user |
| POST | `/api/auth/login` | ❌ | Login and receive JWT |

**Signup body:**
```json
{
  "name": "John Doe",
  "mobile_number": "9876543210",
  "gender": "male",
  "city": "Mumbai",
  "area": "Andheri"
}
```
> Gender values: `male` | `female`

**Login body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

---

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | ✅ | Get own profile |
| GET | `/api/users/me/jobs/posted` | ✅ | Jobs you have posted |
| GET | `/api/users/me/jobs/accepted` | ✅ | Jobs you were accepted as a worker for |
| GET | `/api/users/:id` | ✅ | Get any user's public profile |
| PUT | `/api/users/me` | ✅ | Update name, city, area |
| PATCH | `/api/users/me/availability` | ✅ | Toggle availability status |

**Update profile body:**
```json
{ "name": "Jane", "city": "Delhi", "area": "Saket" }
```

**Toggle availability body:**
```json
{ "availability_status": "ONLINE" }
```
> Values: `ONLINE` | `OFFLINE`

---

### Jobs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/jobs` | ✅ | Create a new job |
| GET | `/api/jobs` | ✅ | List jobs in your city + area |
| GET | `/api/jobs/:id` | ✅ | Get job details |
| PATCH | `/api/jobs/:id/cancel` | ✅ | Cancel a job (creator only) |
| PATCH | `/api/jobs/:id/complete` | ✅ | Mark job as completed (creator only) |

**Create job body:**
```json
{
  "title": "House shifting helper",
  "description": "Need 2 helpers for moving furniture from a 3BHK flat.",
  "category": "Shifting",
  "price": 500,
  "payment_type": "PER_WORKER",
  "workers_required": 2,
  "work_duration": "2 HOURS",
  "start_date": "2026-05-20",
  "preferred_time": "09:00 AM",
  "full_address": "House no, Street name, Landmark",
  "latitude": 19.076,
  "longitude": 72.8777,
  "urgent": false,
  "need_workers_immediately": true,
  "requirements": ["HEAVY_LIFTING", "TOOLS_PROVIDED"],
  "city": "Mumbai",
  "area": "Bandra West"
}
```

> `city` and `area` still default to the creator profile if omitted.

**Cancel job body (optional):**
```json
{ "reason": "Plans changed" }
```

#### Job Status Lifecycle

```
OPEN → PARTIALLY_ACCEPTED → FULL → COMPLETED
                                 → CANCELLED
                                 → EXPIRED (auto, via scheduler)
```

---

### Job Responses

Workers respond to jobs; creators accept or reject them.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/jobs/:jobId/respond` | ✅ | Respond to a job as a worker |
| GET | `/api/jobs/:jobId/responses` | ✅ | View all responses (creator only) |
| PATCH | `/api/jobs/:jobId/responses/:responseId/accept` | ✅ | Accept a worker |
| PATCH | `/api/jobs/:jobId/responses/:responseId/reject` | ✅ | Reject a worker |

> When accepted workers reach `workers_required`, job becomes `FULL` and all remaining pending responses are auto-rejected.

---

### Messages

Only the job creator and accepted workers can message each other.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/jobs/:jobId/messages` | ✅ | Send a message |
| GET | `/api/jobs/:jobId/messages` | ✅ | Get all messages for a job |

**Send message body:**
```json
{
  "receiver_id": "uuid-of-recipient",
  "content": "I'll be there by 10am"
}
```

---

### Reviews

Only the job creator can review accepted workers after the job is completed.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/jobs/:jobId/reviews` | ✅ | Submit a review for a worker |

**Review body:**
```json
{
  "worker_id": "uuid-of-worker",
  "rating": 5,
  "comment": "Very punctual and hardworking"
}
```

> Submitting a review automatically updates the worker's `rating`, `total_jobs_completed`, and `completion_rate`.

---

### Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | ✅ | Get all your notifications |
| PATCH | `/api/notifications/:id/read` | ✅ | Mark a notification as read |

**Notification triggers:**
- Job created → nearby users in same city + area are notified
- Worker responds → job creator is notified
- Worker accepted → that worker is notified
- Job completed → creator and all accepted workers are notified
- Job cancelled → all accepted workers are notified

---

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Primary key |
| name | string | |
| mobile_number | string | Unique |
| gender | enum | `male` / `female` |
| city | string | Used for location filtering |
| area | string | Used for location filtering |
| rating | float | Auto-updated on review |
| total_jobs_completed | int | Auto-updated on review |
| completion_rate | float | |
| is_verified | boolean | |
| availability_status | enum | `ONLINE` / `OFFLINE` |

### Job
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| title | string | |
| description | text | |
| category | string | |
| price | float | |
| city / area | string | Inherited from creator |
| created_by | UUID | FK → User |
| workers_required | int | |
| status | enum | See lifecycle above |
| urgent | boolean | |
| expires_at | datetime | Auto-set on 
creation |
| cancelled_by | UUID | nullable |
| cancellation_reason | text | nullable |

### JobResponse
| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| job_id | UUID | FK → Job |
| worker_id | UUID | FK → User |
| status | enum | `PENDING` / `ACCEPTED` / `REJECTED` |

---

## Project Structure

```
src/
├── app.ts                  # Entry point
├── config/                 # DB config and Sequelize instance
├── controllers/            # Route handlers
├── middlewares/            # JWT verification
├── models/                 # Sequelize models + associations
├── repositories/           # DB query layer
├── routes/                 # Fastify route definitions
├── language/en/            # Response messages
└── utility/                # JWT helper, notifications, expiry scheduler
```

## 🚀 Deployment (AWS Lambda)

This project is configured to run on **AWS Lambda** using the **Serverless Framework** and **esbuild** for high-performance bundling.

### Prerequisites
- Node.js 20+
- Serverless Framework (`npm install -g serverless`)
- AWS CLI configured with appropriate permissions

### Deploy to AWS
To deploy the API to the Mumbai region (`ap-south-1`):
```bash
npx serverless deploy --force
```

### Local Development
To run the Lambda environment locally:
```bash
npx serverless offline
```

## 🏥 API Health Status
You can verify the API and Database connectivity using the health endpoint:

**Endpoint**: `https://3mi90yl0n8.execute-api.ap-south-1.amazonaws.com/dev/`

**CURL Command**:
```bash
curl --location 'https://3mi90yl0n8.execute-api.ap-south-1.amazonaws.com/dev/health'
```

---
*Maintained by [ThoratSanchit](https://github.com/ThoratSanchit)*
