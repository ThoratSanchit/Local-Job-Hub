# AUTH-002: User Onboarding (Profile Setup)

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | AUTH-002 |
| **Type** | User Story |
| **Priority** | High |
| **Status** | Ready for Dev |
| **Actor** | Authenticated User (New) |

---

## Story

> As a new user, I want to set up my professional profile by providing my name, city, area, and skills, so that I can be discovered by customers or apply for relevant jobs in my locality.

---

## Description

After the initial OTP login, if `is_onboarded` is false, the user must complete this flow. This step transforms a "dummy" user into a complete profile.

---

## Acceptance Criteria

### AC-1: Update Profile Details
- [ ] User can send `PUT /api/users/me/onboard`.
- [ ] User provides `name`, `city`, `area`, `bio`, and `category` (optional for customers, recommended for workers).
- [ ] System updates the user record.
- [ ] System sets `is_onboarded = true`.

### AC-2: Field Validation
- [ ] `name`, `city`, and `area` are mandatory.
- [ ] `city` and `area` must be from a predefined list (or validated strings).

### AC-3: Redirect Logic
- [ ] After successful onboarding, user is redirected to the main dashboard.

---

## API Contract

### Request
```http
PUT /api/users/me/onboard
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "city": "Mumbai",
  "area": "Andheri",
  "bio": "Professional electrician with 5 years experience.",
  "category": "Electrician"
}
```

### Success Response (200)
```json
{
  "message": "Onboarding completed successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "is_onboarded": true
  }
}
```

---

## Happy Paths

1. User logs in for the first time.
2. System detects `is_onboarded: false`.
3. User fills the onboarding form.
4. User submits the form.
5. System updates user and returns success.
6. User can now post or accept jobs.

---

## Technical Notes
- Reuse/Extend the existing `updateProfile` logic but ensure `is_onboarded` is toggled.
- Ensure the frontend blocks access to other features until onboarding is done.
