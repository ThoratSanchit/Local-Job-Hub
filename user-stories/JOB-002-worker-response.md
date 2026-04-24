# JOB-002: Worker Response to Job

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | JOB-002 |
| **Type** | User Story |
| **Priority** | High |
| **Status** | Ready for Dev |
| **Actor** | Authenticated User (Worker) |

---

## Story

> As a worker, I want to respond to nearby jobs so that the creator can consider me for the gig.

---

## Description

A worker browses jobs in their city + area and applies to ones they are interested in. The application creates a `JobResponse` record with status `PENDING`. The job creator is immediately notified.

Multiple workers can respond to the same job until the required worker count is filled.

---

## Acceptance Criteria

### AC-1: Successful Response
- [ ] Worker sends `POST /api/jobs/:jobId/respond`.
- [ ] System creates a `JobResponse` with `status = PENDING`.
- [ ] System returns 201 with the response object.
- [ ] Job creator receives a `NEW_RESPONSE` notification.

### AC-2: Prevent Duplicate Response
- [ ] Worker tries to respond to a job they already applied to.
- [ ] System returns 409 Conflict with message "You have already responded to this job".

### AC-3: Prevent Self-Response
- [ ] Worker tries to respond to their own job.
- [ ] System returns 400 Bad Request with message "You cannot respond to your own job".

### AC-4: Prevent Response to Expired Job
- [ ] Worker tries to respond to a job where `expires_at` has passed (if set).
- [ ] System returns 400 Bad Request with message "Job has expired".

### AC-5: Prevent Response to Non-Open Job
- [ ] Worker tries to respond to a job with status `FULL`, `COMPLETED`, `CANCELLED`, or `EXPIRED`.
- [ ] System returns 400 Bad Request with message "Job is not open for responses".

### AC-6: Race Condition Handling
- [ ] If two workers simultaneously respond and trigger a unique constraint violation, system returns 409 gracefully.

---

## API Contract

### Request

```http
POST /api/jobs/:jobId/respond
Authorization: Bearer <token>
```

**Path Params:**
| Param | Type | Description |
|-------|------|-------------|
| `jobId` | UUID | ID of the job to respond to |

### Success Response (201)

```json
{
  "message": "Response submitted successfully",
  "data": {
    "id": "uuid",
    "job_id": "uuid",
    "worker_id": "uuid",
    "status": "PENDING",
    "createdAt": "2025-04-24T10:00:00.000Z"
  }
}
```

### Error Response (409) — Duplicate

```json
{
  "message": "You have already responded to this job"
}
```

### Error Response (400) — Self-Response

```json
{
  "message": "You cannot respond to your own job"
}
```

---

## Happy Path

```
1. Worker discovers a job in the listing.
2. Worker sends POST /api/jobs/:jobId/respond.
3. System validates:
   - Job exists
   - Job is OPEN or PARTIALLY_ACCEPTED
   - Job is not expired
   - Worker is not the creator
   - Worker has not already responded
4. System creates JobResponse (status = PENDING).
5. System notifies job creator.
6. Worker sees job under "My Pending Jobs".
```

---

## Edge Cases

| # | Scenario | Expected Result |
|---|----------|-----------------|
| E1 | Worker applies to non-existent job | 404 Not Found |
| E2 | Worker applies to own job | 400 Bad Request |
| E3 | Worker applies twice (race condition) | 409 Conflict |
| E4 | Worker applies to expired job | 400 Bad Request |
| E5 | Worker applies to FULL job | 400 Bad Request |
| E6 | Worker applies to CANCELLED job | 400 Bad Request |

---

## Business Rules

1. A worker can have **at most one response per job**.
2. Workers **cannot** respond to their own jobs.
3. Responses are only allowed when job status is `OPEN` or `PARTIALLY_ACCEPTED`.
4. If `expires_at` is set and has passed, responses are blocked.
5. The unique DB index on `(job_id, worker_id)` enforces duplicate prevention at the DB level.

---

## Notifications

| Trigger | Recipient | Type | Message |
|---------|-----------|------|---------|
| Worker responds | Job creator | `NEW_RESPONSE` | "Someone responded to your job." |

---

## Related Tickets

| Ticket | Relation | Description |
|--------|----------|-------------|
| JOB-001 | Parent | Job Creation & Expiry Rules |
| JOB-003 | Sibling | Accept / Reject Worker |
| JOB-004 | Sibling | Worker Dashboard & Job Discovery |

---
