# JOB-001: Job Creation & Expiry Rules

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | JOB-001 |
| **Type** | User Story |
| **Priority** | High |
| **Status** | Ready for Dev |
| **Actor** | Authenticated User |

---

## Story

> As an authenticated user, I want to create a job post with an optional expiry date, so that nearby workers can find it and apply. I want jobs without an expiry to stay active indefinitely (unless stale), and jobs with an expiry to die at the specified time.

---

## Description

Any user can post a job in their city + area. The `expires_at` field is now **optional**.

- If `expires_at` is provided → job expires at that exact timestamp.
- If `expires_at` is not provided → job stays active until completed, cancelled, or auto-deleted after 100 days if it has **zero responses**.

The `urgent` flag is **decoupled from expiry** — it only affects listing order (urgent jobs appear first).

---

## Acceptance Criteria

### AC-1: Create Job WITH Expiry
- [ ] User can send `POST /api/jobs` with `expires_at` as a valid future ISO date.
- [ ] System validates `expires_at` is in the future.
- [ ] Job is created with `status = OPEN`.
- [ ] Nearby users are notified.

### AC-2: Create Job WITHOUT Expiry
- [ ] User can send `POST /api/jobs` without `expires_at`.
- [ ] Job is created with `expires_at = NULL`.
- [ ] Job stays active indefinitely until manually resolved.

### AC-3: Expiry Behaviour
- [ ] Jobs with `expires_at` set → marked `EXPIRED` when timestamp passes (regardless of responses).
- [ ] Jobs without `expires_at` and **>0 responses** → never auto-deleted.
- [ ] Jobs without `expires_at` and **0 responses** → auto-deleted after **100 days**.

### AC-4: Urgent Flag
- [ ] `urgent: true` only affects listing order (shown first).
- [ ] `urgent` does NOT affect expiry time.

### AC-5: Response Validation
- [ ] Worker can respond to a job with `expires_at = NULL`.
- [ ] Worker cannot respond to a job where `expires_at` has passed.

---

## API Contract

### Request

```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (with expiry):**
```json
{
  "title": "Need 2 movers for home shifting",
  "description": "Heavy furniture from 3rd floor",
  "category": "Labour",
  "price": 800,
  "workers_required": 2,
  "urgent": true,
  "expires_at": "2025-05-01T18:00:00Z"
}
```

**Body (without expiry):**
```json
{
  "title": "Need a plumber",
  "description": "Leaking kitchen tap",
  "category": "Plumbing",
  "price": 300,
  "urgent": false
}
```

### Success Response (201)

```json
{
  "message": "Job created successfully",
  "data": {
    "id": "uuid",
    "title": "Need 2 movers for home shifting",
    "status": "OPEN",
    "expires_at": "2025-05-01T18:00:00.000Z",
    "urgent": true
  }
}
```

### Error Response (400)

```json
{
  "message": "expires_at must be in the future"
}
```

---

## Happy Paths

### Path 1: Create Job with Custom Expiry

```
1. User sends POST /api/jobs with expires_at set.
2. System validates required fields + future date.
3. System copies city/area from creator profile.
4. System creates job (status = OPEN).
5. System notifies nearby users.
6. Returns 201 with job data.
```

### Path 2: Create Job without Expiry (Open-Ended)

```
1. User sends POST /api/jobs without expires_at.
2. System creates job with expires_at = NULL.
3. Job stays active until:
   a) Worker accepted + job completed, OR
   b) Creator cancels, OR
   c) 100 days pass with 0 responses → auto-deleted.
```

---

## Alternate Paths / Edge Cases

| # | Scenario | Expected Result |
|---|----------|-----------------|
| E1 | `expires_at` is a past date | 400 Bad Request |
| E2 | `expires_at` is invalid string | 400 Bad Request |
| E3 | Job with `expires_at` passes while OPEN | Status → EXPIRED |
| E4 | Job with `expires_at`, 0 responses, time passes | Status → EXPIRED (expires_at wins) |
| E5 | Job without `expires_at`, 0 responses, 100 days old | Permanently deleted |
| E6 | Job without `expires_at`, >0 responses, 100 days old | Stays active |

---

## Business Rules

1. `expires_at` is **optional**. If provided, must be a valid future ISO date.
2. If `expires_at` is `NULL`, job has **no expiry deadline**.
3. `urgent` flag is **listing priority only** — does not affect expiry.
4. Jobs **with** `expires_at` → expire at that timestamp.
5. Jobs **without** `expires_at` and **with responses** → stay active forever.
6. Jobs **without** `expires_at` and **0 responses** → deleted after 100 days.
7. Workers cannot respond to their own job or an expired/completed/cancelled job.

---

## Notifications

| Trigger | Recipients | Type |
|---------|-----------|------|
| Job created | Nearby users (same city + area) | `JOB_CREATED` |

---

## Related Tickets

| Ticket | Relation | Description |
|--------|----------|-------------|
| JOB-002 | Child | Worker Response to Job |
| JOB-003 | Child | Accept / Reject Worker |
| MSG-001 | Related | Messaging Between Participants |

---

## Technical Notes

- **Scheduler Tasks:**
  - `runExpiry()` — runs every 60s, marks jobs with passed `expires_at` as EXPIRED.
  - `runCleanup()` — runs daily, deletes zero-response jobs without `expires_at` older than 100 days.
- **DB Change:** `jobs.expires_at` changed from `NOT NULL` to `NULL` with default `NULL`.

---
