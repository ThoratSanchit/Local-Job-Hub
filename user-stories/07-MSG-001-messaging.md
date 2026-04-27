# MSG-001: Messaging Between Participants

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | MSG-001 |
| **Type** | User Story |
| **Priority** | Medium |
| **Status** | Ready for Dev |
| **Actor** | Job Creator + Accepted Workers |

---

## Story

> As a job participant, I want to send and receive messages within a job thread so that I can coordinate details with the other party.

---

## Description

Messaging is enabled only after at least one worker has been accepted for a job. Only the job creator and accepted workers can participate in the conversation. Messages are scoped per job.

---

## Acceptance Criteria

### AC-1: Send Message
- [ ] Participant sends `POST /api/jobs/:jobId/messages`.
- [ ] Body contains `receiver_id` and `content`.
- [ ] System validates sender is a participant (creator or accepted worker).
- [ ] System validates receiver is a participant.
- [ ] System prevents sending messages to self.
- [ ] System prevents empty content.
- [ ] System creates the message and returns 201.

### AC-2: View Messages
- [ ] Participant sends `GET /api/jobs/:jobId/messages`.
- [ ] System returns all messages for that job, sorted oldest first.
- [ ] Each message includes sender and receiver names.
- [ ] Only participants can view messages (403 for non-participants).

### AC-3: Messaging Availability
- [ ] Messaging is allowed when job status is `PARTIALLY_ACCEPTED`, `FULL`, or `COMPLETED`.
- [ ] Messaging is blocked when job status is `CANCELLED` or `EXPIRED`.
- [ ] Messaging is blocked when job status is `OPEN` (no accepted workers yet).

### AC-4: Participant Validation
- [ ] Sender must be either the job creator or an accepted worker.
- [ ] Receiver must be either the job creator or an accepted worker.
- [ ] Sender and receiver must be different users.

---

## API Contract

### Send Message

```http
POST /api/jobs/:jobId/messages
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "receiver_id": "uuid-of-recipient",
  "content": "I'll be there by 10am"
}
```

**Response (201):**
```json
{
  "message": "Message sent successfully",
  "data": {
    "id": "uuid",
    "job_id": "uuid",
    "sender_id": "uuid",
    "receiver_id": "uuid",
    "content": "I'll be there by 10am",
    "createdAt": "2025-04-24T10:30:00.000Z"
  }
}
```

### View Messages

```http
GET /api/jobs/:jobId/messages
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Messages fetched successfully",
  "data": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "sender_id": "uuid",
      "receiver_id": "uuid",
      "content": "I'll be there by 10am",
      "sender": { "id": "uuid", "name": "Amit" },
      "receiver": { "id": "uuid", "name": "Rahul" },
      "createdAt": "2025-04-24T10:30:00.000Z"
    }
  ]
}
```

---

## Happy Path

```
1. Creator accepts a worker for the job.
2. Job status becomes PARTIALLY_ACCEPTED or FULL.
3. Messaging is now enabled.
4. Worker sends message: "I'll reach by 10am."
5. Creator views the message thread.
6. Creator replies: "Great, see you then."
```

---

## Edge Cases

| # | Scenario | Expected Result |
|---|----------|-----------------|
| E1 | Non-participant tries to send message | 403 Forbidden |
| E2 | Sender sends message to self | 400 Bad Request |
| E3 | Empty message content | 400 Bad Request |
| E4 | Messaging on OPEN job (no accepted workers) | 400 Bad Request |
| E5 | Messaging on CANCELLED job | 400 Bad Request |
| E6 | Messaging on EXPIRED job | 400 Bad Request |
| E7 | Receiver is not a participant | 403 Forbidden |

---

## Business Rules

1. Messaging is **only available once a worker is accepted**.
2. Allowed job statuses for messaging: `PARTIALLY_ACCEPTED`, `FULL`, `COMPLETED`.
3. Blocked job statuses for messaging: `OPEN`, `CANCELLED`, `EXPIRED`.
4. Only the **job creator** and **accepted workers** can send/receive messages.
5. Messages are ordered by `createdAt` ascending (oldest first).
6. Each message belongs to exactly one job thread.

---

## Notifications

*(No dedicated message notifications in current implementation. Consider adding real-time or push notifications in future.)*

---

## Related Tickets

| Ticket | Relation | Description |
|--------|----------|-------------|
| JOB-003 | Parent | Accept / Reject Worker (enables messaging) |
| JOB-004 | Related | Worker Dashboard (worker accesses messages from accepted jobs) |

---
