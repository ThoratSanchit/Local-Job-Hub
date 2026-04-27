# JOB-003: Accept / Reject Worker

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | JOB-003 |
| **Type** | User Story |
| **Priority** | High |
| **Status** | Ready for Dev |
| **Actor** | Authenticated User (Job Creator) |

---

## Story

> As a job creator, I want to review worker applications and accept or reject them, so that I can build the right team for my job.

---

## Description

The job creator views all responses to their job. They can accept or reject each worker individually. When enough workers are accepted to meet `workers_required`, the job becomes `FULL` and all remaining `PENDING` responses are automatically rejected.

The system guards against race conditions where two concurrent accept requests could overfill the job.

---

## Acceptance Criteria

### AC-1: View All Responses
- [ ] Creator sends `GET /api/jobs/:jobId/responses`.
- [ ] System returns all `JobResponse` records for that job.
- [ ] Each response includes worker details: name, rating, city, area.
- [ ] Only the job creator can view responses (403 for others).

### AC-2: Accept a Worker
- [ ] Creator sends `PATCH /api/jobs/:jobId/responses/:responseId/accept`.
- [ ] System validates the response is in `PENDING` status.
- [ ] System validates the job is still `OPEN` or `PARTIALLY_ACCEPTED`.
- [ ] System updates response status to `ACCEPTED`.
- [ ] System updates job status:
  - If accepted count >= workers_required → `FULL` + auto-reject all remaining PENDING.
  - Else → `PARTIALLY_ACCEPTED`.
- [ ] Worker receives `WORKER_ACCEPTED` notification.
- [ ] System returns 200 with new job status.

### AC-3: Reject a Worker
- [ ] Creator sends `PATCH /api/jobs/:jobId/responses/:responseId/reject`.
- [ ] System validates the response is in `PENDING` status.
- [ ] System updates response status to `REJECTED`.
- [ ] System returns 200 with success message.

### AC-4: Race Condition Protection
- [ ] If two accept requests happen concurrently and would exceed `workers_required`:
  - The second request detects the job is already full.
  - It rejects the response and marks job as `FULL`.
  - It auto-rejects all remaining PENDING responses.
  - Returns 400 with message "Job is already full".

### AC-5: Prevent Unauthorized Access
- [ ] Non-creator tries to view responses or accept/reject workers.
- [ ] System returns 403 Forbidden.

---

## API Contract

### View Responses

```http
GET /api/jobs/:jobId/responses
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "worker_id": "uuid",
      "status": "PENDING",
      "worker": {
        "id": "uuid",
        "name": "Amit",
        "rating": 4.2,
        "city": "Mumbai",
        "area": "Andheri"
      }
    }
  ]
}
```

### Accept Worker

```http
PATCH /api/jobs/:jobId/responses/:responseId/accept
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Worker accepted successfully",
  "job_status": "FULL"
}
```

### Reject Worker

```http
PATCH /api/jobs/:jobId/responses/:responseId/reject
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Worker rejected"
}
```

---

## Happy Path — Accept Until Full

```
1. Creator posts a job requiring 2 workers.
2. 3 workers respond (all PENDING).
3. Creator accepts Worker A.
   - Job status → PARTIALLY_ACCEPTED (1 of 2 filled).
4. Creator accepts Worker B.
   - Accepted count = 2, meets workers_required.
   - Job status → FULL.
   - Worker C's response auto-rejected.
5. Worker A and B receive "You were accepted!" notifications.
6. Worker C receives no notification (silently rejected).
```

---

## Edge Cases

| # | Scenario | Expected Result |
|---|----------|-----------------|
| E1 | Creator accepts non-existent response | 404 Not Found |
| E2 | Creator accepts already ACCEPTED response | 400 Bad Request |
| E3 | Creator accepts when job is already FULL | 400 Bad Request |
| E4 | Non-creator tries to accept | 403 Forbidden |
| E5 | Concurrent accepts exceed workers_required | 400 Bad Request + auto-reject pending |

---

## Business Rules

1. Only the **job creator** can view responses and accept/reject workers.
2. Accept/reject is only allowed when the response status is `PENDING`.
3. Accept is only allowed when job status is `OPEN` or `PARTIALLY_ACCEPTED`.
4. When `accepted_count >= workers_required`:
   - Job status → `FULL`.
   - All remaining `PENDING` responses are auto-rejected.
5. Race conditions are handled by re-checking accepted count **after** fetching the response.

---

## Notifications

| Trigger | Recipient | Type | Message |
|---------|-----------|------|---------|
| Worker accepted | Worker | `WORKER_ACCEPTED` | "You have been accepted for the job {title}." |

---

## Related Tickets

| Ticket | Relation | Description |
|--------|----------|-------------|
| JOB-001 | Parent | Job Creation & Expiry Rules |
| JOB-002 | Sibling | Worker Response to Job |
| JOB-004 | Sibling | Worker Dashboard & Job Discovery |
| MSG-001 | Related | Messaging Between Participants |

---
