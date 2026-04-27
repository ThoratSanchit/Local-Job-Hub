# JOB-005: Service Provider Discovery (Customer Search)

---

## Ticket Info

| Field | Value |
|-------|-------|
| **Ticket ID** | JOB-005 |
| **Type** | User Story |
| **Priority** | High |
| **Status** | Ready for Dev |
| **Actor** | Authenticated User (Customer) |

---

## Story

> As a customer, I want to search and browse local service providers by their category, area, and rating, so that I can find and discover reliable professionals nearby and contact them for work.

---

## Description

This feature shifts the platform from just "Jobs" to a "Directory". Customers can view a list of users who have marked themselves as available and have specific skills (categories).

---

## Acceptance Criteria

### AC-1: Search Service Providers
- [ ] User can send `GET /api/providers` with query params: `category`, `city`, `area`.
- [ ] System returns a list of users who match the criteria.
- [ ] Users must have `availability_status = ONLINE` to appear in search (default filter).

### AC-2: Provider Cards/Profiles
- [ ] Each provider entry shows: Name, Rating, Total Jobs Completed, Bio, and Category.
- [ ] Results are sorted by Rating (highest first) by default.

### AC-3: View Provider Detail
- [ ] User can click on a provider to view their full profile, including past reviews.

---

## API Contract

### Request
```http
GET /api/providers?category=Plumber&city=Mumbai&area=Andheri
Authorization: Bearer <token>
```

### Success Response (200)
```json
{
  "message": "Providers fetched successfully",
  "data": [
    {
      "id": "uuid-1",
      "name": "John Plumber",
      "category": "Plumbing",
      "rating": 4.8,
      "total_jobs_completed": 25,
      "bio": "Expert in fixing leaks and new installations.",
      "availability_status": "ONLINE"
    }
  ]
}
```

---

## Happy Paths

1. Customer goes to the "Discover Providers" tab.
2. Customer selects "Electrician" and "Mumbai".
3. System displays a list of top-rated electricians in Mumbai.
4. Customer clicks on a profile to see reviews and contact info.

---

## Technical Notes
- Create a new `ProviderController`.
- Optimize the SQL query to filter by `city`, `area`, and `category` efficiently.
- Ensure only users with `is_onboarded: true` are returned.
