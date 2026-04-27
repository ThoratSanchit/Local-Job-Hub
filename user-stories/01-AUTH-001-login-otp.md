# AUTH-001: Login & OTP Verification

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | AUTH-001 |
| **Type** | User Story |
| **Priority** | Critical |
| **Status** | Ready for Dev |
| **Actor** | Unauthenticated User |

---

## Story

> As a user, I want to login by receiving an OTP on my email, so that I can quickly and securely access the platform without remembering a password. I want the system to handle me as a "first-time" user if I don't have an account yet.

---

## Description

The authentication system uses a passwordless OTP-based flow. 
- A user enters their email.
- The system sends a 6-digit OTP.
- The user verifies the OTP.
- If the user is new, a dummy profile is created.
- A JWT token is returned for session management.

---

## Acceptance Criteria

### AC-1: Request OTP
- [ ] User can send `POST /api/auth/otp/send` with an email.
- [ ] System generates a 6-digit OTP and "sends" it (logs for now, or via email service).
- [ ] System stores OTP with a 5-minute expiry.

### AC-2: Verify OTP & Login
- [ ] User can send `POST /api/auth/otp/verify` with email and OTP.
- [ ] System validates OTP.
- [ ] If valid and user exists → Login user.
- [ ] If valid and user DOES NOT exist → Create user with `name: "New User"`, `is_onboarded: false`, and default city/area.
- [ ] System returns JWT and user info (including `is_onboarded` flag).

### AC-3: Token Security
- [ ] JWT contains `userId` and `exp`.
- [ ] Token is required for all protected `/api/*` routes.

---

## API Contract

### Request: Send OTP
```http
POST /api/auth/otp/send
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Request: Verify OTP
```http
POST /api/auth/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Success Response (200)
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "is_onboarded": false
  }
}
```

---

## Happy Paths

### Path 1: Existing User Login
1. User enters email and clicks "Send OTP".
2. User receives OTP and enters it.
3. System verifies OTP and returns JWT.
4. `is_onboarded` is `true`. User goes to Dashboard.

### Path 2: First-time User Onboarding Start
1. New user enters email and clicks "Send OTP".
2. User receives OTP and enters it.
3. System creates user record and returns JWT.
4. `is_onboarded` is `false`. Frontend redirects to Onboarding page.

---

## Technical Notes
- Use `crypto` to generate OTP.
- Store OTP in a cache or a temporary DB table with `expiresAt`.
- Ensure `is_onboarded` flag is added to the User model.
