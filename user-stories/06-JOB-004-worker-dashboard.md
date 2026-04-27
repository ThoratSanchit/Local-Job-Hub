# JOB-004: Worker Dashboard & Job Discovery

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | JOB-004 |
| **Type** | User Story |
| **Priority** | High |
| **Status** | Ready for Dev |
| **Actor** | Authenticated User (Worker Mode) |

---

## Story

> As a worker, I want to discover nearby jobs, apply to them, and track all my job applications in one place — including my earnings — so that I can manage my work efficiently.

---

## Description

Workers browse jobs posted in their **city + area**. They can apply to any job that is `OPEN` or `PARTIALLY_ACCEPTED`, is not expired, and was not created by themselves.

Once applied, workers can track the full lifecycle of their applications via a dashboard that categorizes jobs by status.

---

## Acceptance Criteria

### AC-1: Discover Nearby Jobs
- [ ] Worker sees jobs filtered by their own `city` and `area`.
- [ ] Jobs with `urgent: true` appear at the top of the list.
- [ ] Worker does NOT see their own posted jobs in the discovery list.
- [ ] Worker does NOT see `COMPLETED`, `CANCELLED`, or `EXPIRED` jobs.
- [ ] Each job card shows: title, category, price, workers_required, urgent badge, creator name + rating.

### AC-2: Apply to a Job
- [ ] Worker can send `POST /api/jobs/:jobId/respond`.
- [ ] System prevents duplicate applications (409 Conflict).
- [ ] System prevents applying to own job (400 Bad Request).
- [ ] System prevents applying to expired jobs (400 Bad Request).
- [ ] System prevents applying to `FULL`, `COMPLETED`, `CANCELLED`, or `EXPIRED` jobs (400 Bad Request).
- [ ] On success, job creator receives a `NEW_RESPONSE` notification.

### AC-3: View My Applied Jobs (All Statuses)
- [ ] Worker can fetch all jobs they have applied to.
- [ ] Each entry shows: job details + response status (`PENDING`, `ACCEPTED`, `REJECTED`).

### AC-4: View My Accepted Jobs
- [ ] Worker can fetch jobs where their response status = `ACCEPTED` and job status = `PARTIALLY_ACCEPTED` or `FULL`.
- [ ] These are "active gigs" the worker is currently hired for.
- [ ] Worker can access messaging for these jobs.

### AC-5: View My Completed Jobs + Earnings
- [ ] Worker can fetch jobs where their response status = `ACCEPTED` and job status = `COMPLETED`.
- [ ] Dashboard shows **total earnings** = sum of `price` from all completed jobs.
- [ ] Each completed job shows: title, price, completion date, review received (if any).

### AC-6: View My Pending Jobs
- [ ] Worker can fetch jobs where their response status = `PENDING`.
- [ ] These are jobs the worker applied to but the creator has not decided yet.

### AC-7: View My Rejected Jobs
- [ ] Worker can fetch jobs where their response status = `REJECTED`.
- [ ] Rejected jobs are shown in a separate tab for historical reference.

### AC-8: View Auto-Cancelled / Expired Jobs
- [ ] Worker can fetch jobs they applied to where the job status became `CANCELLED` or `EXPIRED`.
- [ ] If job was `CANCELLED`, show cancellation reason (if available).
- [ ] If job was `EXPIRED`, show "Job expired before you were accepted".

---

## API Contract

### Discover Nearby Jobs

```http
GET /api/jobs
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Jobs fetched successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Need 2 movers",
      "category": "Labour",
      "price": 800,
      "workers_required": 2,
      "status": "OPEN",
      "urgent": true,
      "expires_at": "2025-05-01T18:00:00.000Z",
      "creator": {
        "id": "uuid",
        "name": "Rahul",
        "rating": 4.5
      }
    }
  ]
}
```

### Apply to a Job

```http
POST /api/jobs/:jobId/respond
Authorization: Bearer <token>
```

**Response (201):**
```json
{
  "message": "Response submitted successfully",
  "data": {
    "id": "uuid",
    "job_id": "uuid",
    "worker_id": "uuid",
    "status": "PENDING"
  }
}
```

### View My Accepted Jobs

```http
GET /api/users/me/jobs/accepted
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Jobs fetched successfully",
  "data": [
    {
      "id": "uuid",
      "status": "ACCEPTED",
      "job": {
        "id": "uuid",
        "title": "Need 2 movers",
        "price": 800,
        "status": "FULL"
      }
    }
  ]
}
```

---

## Happy Paths

### Path 1: Discover & Apply

```
1. Worker opens app and sees nearby jobs (sorted by urgent first).
2. Worker taps on a job to view details.
3. Worker taps "Apply".
4. System creates a PENDING JobResponse.
5. Job creator receives notification.
6. Worker sees the job under "My Pending Jobs".
```

### Path 2: Get Accepted & Earn

```
1. Creator accepts worker's application.
2. Worker receives "You were accepted!" notification.
3. Job moves from "Pending" to "Accepted" tab.
4. Worker completes the job.
5. Creator marks job as COMPLETED.
6. Job moves to "Completed" tab.
7. Worker's total earnings increase by job price.
8. Creator may leave a review (rating + comment).
```

---

## Edge Cases

| # | Scenario | Expected Result |
|---|----------|-----------------|
| E1 | Worker applies to same job twice | 409 Conflict |
| E2 | Worker applies to own job | 400 Bad Request |
| E3 | Worker applies to expired job | 400 Bad Request |
| E4 | Worker applies to FULL job | 400 Bad Request |
| E5 | Job gets CANCELLED while worker is ACCEPTED | Moves to "Cancelled" tab; worker notified |
| E6 | Job EXPIRES while worker is PENDING | Moves to "Expired" tab |

---

## Business Rules

1. Job discovery is **location-based** (same city + area as worker).
2. Workers **cannot** see or apply to their own jobs.
3. A worker can only have **one response per job**.
4. Accepted workers can **message** the creator.
5. Only accepted workers on completed jobs can be **reviewed**.
6. Earnings = sum of `price` from all jobs where worker was accepted AND job is completed.

---

## Notifications

| Trigger | Recipient | Type |
|---------|-----------|------|
| Worker applies | Job creator | `NEW_RESPONSE` |
| Creator accepts worker | Worker | `WORKER_ACCEPTED` |
| Job cancelled | Accepted workers | `JOB_CANCELLED` |
| Job completed | Accepted workers + Creator | `JOB_COMPLETED` |

---

## UI Tabs (Suggested)

| Tab | Filter Condition |
|-----|-----------------|
| Discover | Nearby OPEN/PARTIALLY_ACCEPTED jobs (not own) |
| Pending | My responses with status = PENDING |
| Accepted | My responses with status = ACCEPTED + job not COMPLETED |
| Completed | My responses with status = ACCEPTED + job = COMPLETED |
| Rejected | My responses with status = REJECTED |
| Cancelled / Expired | My responses where job = CANCELLED or EXPIRED |

---

## Related Tickets

| Ticket | Relation | Description |
|--------|----------|-------------|
| JOB-001 | Parent | Job Creation & Expiry Rules |
| JOB-002 | Child | Worker Response to Job |
| JOB-003 | Child | Accept / Reject Worker |
| MSG-001 | Related | Messaging Between Participants |
| REV-001 | Related | Submit Review |

---
