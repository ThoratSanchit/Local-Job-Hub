# USR-002: Profile Management & Settings

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | USR-002 |
| **Type** | User Story |
| **Priority** | Medium |
| **Status** | Ready for Dev |
| **Actor** | Authenticated User |

---

## Story

> As a user, I want to update my profile picture, bio, and availability status at any time, so that I can control my visibility on the platform and keep my professional details up to date.

---

## Description

Users need a way to manage their profile after the initial onboarding. This includes toggling availability (for workers) and updating contact or professional info.

---

## Acceptance Criteria

### AC-1: Update Bio and Skills
- [ ] User can send `PUT /api/users/me`.
- [ ] User can update `name`, `bio`, and `category`.

### AC-2: Toggle Availability
- [ ] User can send `PATCH /api/users/me/availability` with `ONLINE` or `OFFLINE`.
- [ ] If `OFFLINE`, user does not appear in "Provider Discovery" results.

### AC-3: Profile Verification (Mock/Simple)
- [ ] User can see their verification status (e.g., "Verified" badge if `is_verified` is true).

---

## API Contract

### Request: Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Now offering electrical and plumbing services.",
  "category": "Handyman"
}
```

### Request: Toggle Availability
```http
PATCH /api/users/me/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "availability_status": "OFFLINE"
}
```

---

## Happy Paths

1. Worker goes to "Profile Settings".
2. Worker updates their bio and adds a new skill category.
3. Worker toggles status to "OFFLINE" because they are busy.
4. System updates the profile and hides them from search results.

---

## Technical Notes
- Ensure `PATCH /api/users/me/availability` correctly handles the ENUM values.
- Validate that the user remains "onboarded" after updates.
