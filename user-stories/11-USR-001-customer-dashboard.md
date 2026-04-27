# USR-001: Customer Dashboard

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | USR-001 |
| **Type** | User Story |
| **Priority** | High |
| **Status** | Ready for Dev |
| **Actor** | Authenticated User (Customer) |

---

## Story

> As a customer, I want a centralized dashboard where I can manage my posted jobs, see how many workers have applied, and quickly find new providers, so that I can keep my home/office maintenance organized.

---

## Description

The Customer Dashboard is the landing page for users who primarily post jobs. It provides a summary of their activity and quick actions.

---

## Acceptance Criteria

### AC-1: Active Jobs Overview
- [ ] Dashboard shows a list of "Active Jobs" (OPEN or PARTIALLY_ACCEPTED).
- [ ] Each job shows the number of pending responses (e.g., "3 workers applied").

### AC-2: Recent Activity / Notifications
- [ ] Dashboard shows a feed of the latest 5 notifications (e.g., "New response for 'Fix Tap'").

### AC-3: Quick Search
- [ ] A prominent search bar to quickly find providers by category.

### AC-4: Navigation
- [ ] Quick links to "Post a New Job" and "My Completed Jobs".

---

## Happy Paths

1. User logs in as a Customer.
2. Dashboard displays:
    - "You have 2 active jobs."
    - "3 new responses waiting for review."
    - "Suggested Plumbers near you."
3. User clicks on a job to manage responses.

---

## Technical Notes
- Frontend-heavy story. Requires an API endpoint `GET /api/users/me/dashboard/summary` that aggregates job counts and recent notifications.
