# REV-001: Submit Review

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | REV-001 |
| **Type** | User Story |
| **Priority** | Medium |
| **Status** | Ready for Dev |
| **Actor** | Authenticated User (Job Creator) |

---

## Story

> As a job creator, I want to review workers after a job is completed so that good workers build reputation and future creators can hire with confidence.

---

## Description

After marking a job as `COMPLETED`, the creator can submit a review for each accepted worker. The review includes a 1-5 star rating and an optional text comment. Submitting a review automatically updates the worker's profile stats: `rating`, `total_jobs_completed`, and `completion_rate`.

A creator can only review each worker once per job.

---

## Acceptance Criteria

### AC-1: Submit Review
- [ ] Creator sends `POST /api/jobs/:jobId/reviews`.
- [ ] Body contains `worker_id`, `rating` (1-5), and optional `comment`.
- [ ] System validates the job status is `COMPLETED`.
- [ ] System validates the requester is the job creator.
- [ ] System validates the worker was actually accepted for this job.
- [ ] System validates rating is an integer between 1 and 5.
- [ ] System prevents self-review.
- [ ] System prevents duplicate reviews for the same (job + reviewer + worker) triple.
- [ ] System creates the review and returns 201.

### AC-2: Update Worker Stats
- [ ] After review submission, system recalculates worker's `rating` (average of all reviews).
- [ ] System updates `total_jobs_completed` (count of accepted jobs with COMPLETED status).
- [ ] System updates `completion_rate` (completed jobs / total accepted jobs × 100).

### AC-3: Prevent Review Before Completion
- [ ] Creator tries to review a job that is not `COMPLETED`.
- [ ] System returns 400 Bad Request with message "Job must be completed before reviewing".

### AC-4: Prevent Non-Creator Review
- [ ] A worker or third-party user tries to submit a review.
- [ ] System returns 403 Forbidden with message "Only the job creator can submit reviews".

---

## API Contract

### Request

```http
POST /api/jobs/:jobId/reviews
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "worker_id": "uuid-of-worker",
  "rating": 5,
  "comment": "Very punctual and hardworking"
}
```

### Success Response (201)

```json
{
  "message": "Review submitted successfully"
}
```

### Error Response (400) — Job Not Completed

```json
{
  "message": "Job must be completed before reviewing"
}
```

### Error Response (403) — Not Creator

```json
{
  "message": "Only the job creator can submit reviews"
}
```

### Error Response (409) — Duplicate Review

```json
{
  "message": "You have already reviewed this worker for this job"
}
```

---

## Happy Path

```
1. Creator marks job as COMPLETED.
2. Creator sends POST /api/jobs/:jobId/reviews for Worker A.
3. System validates all conditions.
4. Review is created (rating = 5, comment = "...").
5. System recalculates Worker A's stats:
   - rating = average of all reviews
   - total_jobs_completed = count of completed accepted jobs
   - completion_rate = (completed / total accepted) × 100
6. Worker A's profile reflects updated stats.
```

---

## Edge Cases

| # | Scenario | Expected Result |
|---|----------|-----------------|
| E1 | Review job that is OPEN | 400 Bad Request |
| E2 | Review job that is CANCELLED | 400 Bad Request |
| E3 | Worker reviews themselves | 400 Bad Request |
| E4 | Review worker who was not accepted | 400 Bad Request |
| E5 | Rating is 0 or 6 | 400 Bad Request |
| E6 | Rating is not an integer | 400 Bad Request |
| E7 | Duplicate review same job+worker | 409 Conflict |
| E8 | Non-creator tries to review | 403 Forbidden |

---

## Business Rules

1. Only the **job creator** can submit reviews.
2. Reviews can only be submitted after job status = `COMPLETED`.
3. Only **accepted workers** can be reviewed.
4. **One review per (job + reviewer + worker)** triple.
5. Rating must be an integer between 1 and 5.
6. Self-reviews are not allowed.
7. Worker's `rating` is the **average** of all their review ratings (rounded to 1 decimal).
8. `completion_rate` = `(completed jobs / total accepted jobs) × 100`, rounded to integer.

---

## Notifications

*(No notifications triggered by review submission in current implementation.)*

---

## Related Tickets

| Ticket | Relation | Description |
|--------|----------|-------------|
| JOB-003 | Parent | Accept / Reject Worker (determines who can be reviewed) |
| JOB-001 | Related | Job Creation & Expiry (job must be completed first) |

---
