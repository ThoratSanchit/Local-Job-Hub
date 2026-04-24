# NOT-001: Notification System

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | NOT-001 |
| **Type** | User Story |
| **Priority** | Medium |
| **Status** | Ready for Dev |
| **Actor** | All Authenticated Users |

---

## Story

> As a user, I want to receive real-time notifications about job-related events so that I stay informed without constantly checking the app.

---

## Description

The notification system automatically generates events at key points in the job lifecycle. Users can view all their notifications and mark individual ones as read. Notifications are stored persistently in the database.

---

## Acceptance Criteria

### AC-1: Fetch Notifications
- [ ] User sends `GET /api/notifications`.
- [ ] System returns all notifications for the logged-in user.
- [ ] Notifications are sorted by newest first (`createdAt DESC`).
- [ ] Each notification includes: id, type, title, body, is_read, meta, createdAt.

### AC-2: Mark Notification as Read
- [ ] User sends `PATCH /api/notifications/:id/read`.
- [ ] System updates `is_read = true` for that notification.
- [ ] System validates the notification belongs to the requesting user.
- [ ] System returns 200 with success message.

### AC-3: Auto-Generated Notifications
- [ ] Notifications are automatically created at the following triggers:
  - `JOB_CREATED` → nearby users in same city + area
  - `NEW_RESPONSE` → job creator when a worker responds
  - `WORKER_ACCEPTED` → worker when accepted by creator
  - `JOB_COMPLETED` → creator + all accepted workers
  - `JOB_CANCELLED` → all accepted workers

### AC-4: Unread Count (Optional Enhancement)
- [ ] *(Future)* API returns unread notification count.
- [ ] *(Future)* Badge on UI reflects unread count.

---

## API Contract

### Fetch Notifications

```http
GET /api/notifications
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Notifications fetched successfully",
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "WORKER_ACCEPTED",
      "title": "You were accepted!",
      "body": "You have been accepted for the job 'Need 2 movers'.",
      "is_read": false,
      "meta": { "job_id": "uuid" },
      "createdAt": "2025-04-24T10:00:00.000Z"
    },
    {
      "id": "uuid",
      "user_id": "uuid",
      "type": "NEW_RESPONSE",
      "title": "New Worker Response",
      "body": "Someone responded to your job.",
      "is_read": true,
      "meta": { "job_id": "uuid" },
      "createdAt": "2025-04-24T09:00:00.000Z"
    }
  ]
}
```

### Mark as Read

```http
PATCH /api/notifications/:id/read
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Notification marked as read"
}
```

---

## Notification Types Reference

| Type | Trigger | Recipient(s) | Title | Body |
|------|---------|-------------|-------|------|
| `JOB_CREATED` | New job posted | Nearby users (same city + area, excluding creator) | "New Job Near You" | `{title} — ₹{price}` |
| `NEW_RESPONSE` | Worker responds | Job creator | "New Worker Response" | "Someone responded to your job." |
| `WORKER_ACCEPTED` | Creator accepts worker | Accepted worker | "You were accepted!" | "You have been accepted for the job '{title}'." |
| `JOB_COMPLETED` | Creator marks completed | Creator + all accepted workers | "Job Completed" | "The job '{title}' has been marked as completed." |
| `JOB_CANCELLED` | Creator cancels job | All accepted workers | "Job Cancelled" | "The job '{title}' has been cancelled." |

---

## Happy Path

```
1. Creator posts a job.
2. Nearby workers receive JOB_CREATED notifications.
3. Worker A applies.
4. Creator receives NEW_RESPONSE notification.
5. Creator accepts Worker A.
6. Worker A receives WORKER_ACCEPTED notification.
7. Creator marks job as COMPLETED.
8. Creator and Worker A receive JOB_COMPLETED notifications.
```

---

## Edge Cases

| # | Scenario | Expected Result |
|---|----------|-----------------|
| E1 | User marks another user's notification as read | 403 Forbidden (or 404 if scoped) |
| E2 | No notifications for user | Returns empty array |
| E3 | Job created in area with no other users | No notifications sent |
| E4 | Creator cancels job with no accepted workers | No JOB_CANCELLED notifications |

---

## Business Rules

1. Notifications are **persistent** (stored in DB, not ephemeral).
2. Each user only sees their own notifications.
3. `is_read` defaults to `false`.
4. `meta` stores contextual data (e.g., `job_id`) as JSON.
5. Bulk notifications (e.g., JOB_CREATED to nearby users) use `bulkCreate` for efficiency.
6. Notifications are **not real-time** (no WebSocket). Polling or push notifications can be added later.

---

## Related Tickets

| Ticket | Relation | Description |
|--------|----------|-------------|
| JOB-001 | Triggers | Job Creation |
| JOB-002 | Triggers | Worker Response |
| JOB-003 | Triggers | Accept Worker |
| JOB-001 | Triggers | Cancel / Complete Job |

---
