# Phase 3: Core Ops Testing Guide

## Overview

This guide covers testing the Ops modules:
- **Fleet** - Aircraft management
- **Availability** - Instructor and aircraft availability
- **Roster** - Manual sortie scheduling and dispatch

All endpoints are multi-tenant and role-aware.

---

## Prerequisites

1. **Database Migration**: Ensure the ops tables are created:
   ```bash
   cd apps/skynet-plus-api
   psql "$DATABASE_URL" -f db/migrations/2025_11_16_0003_ops_core.sql
   ```

2. **Auth Tokens**: You'll need valid JWT tokens for:
   - ADMIN user (for fleet, availability, roster management)
   - INSTRUCTOR user (for own availability and sortie updates)
   - STUDENT user (for viewing own sorties)

3. **Existing Data**: From Phase 2, you should have:
   - A training program
   - A student profile
   - An instructor user

---

## 1. Fleet Management

### 1.1 Create Aircraft

**Endpoint:** `POST /api/fleet/aircraft`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "registration": "VT-ABC",
  "type": "C172",
  "baseAirportIcao": "VOMM",
  "status": "ACTIVE",
  "capabilities": {
    "IFR": true,
    "Night": true,
    "Spins": false
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/fleet/aircraft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "registration": "VT-ABC",
    "type": "C172",
    "baseAirportIcao": "VOMM",
    "status": "ACTIVE",
    "capabilities": {
      "IFR": true,
      "Night": true,
      "Spins": false
    }
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "aircraft-uuid",
  "tenantId": "tenant-uuid",
  "registration": "VT-ABC",
  "type": "C172",
  "baseAirportIcao": "VOMM",
  "status": "ACTIVE",
  "capabilities": {
    "IFR": true,
    "Night": true,
    "Spins": false
  },
  "createdAt": "2025-01-14T10:00:00.000Z",
  "updatedAt": "2025-01-14T10:00:00.000Z"
}
```

---

### 1.2 List Aircraft

**Endpoint:** `GET /api/fleet/aircraft`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
# List all aircraft
curl -X GET http://localhost:3000/api/fleet/aircraft \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by status
curl -X GET "http://localhost:3000/api/fleet/aircraft?status=ACTIVE" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "aircraft-uuid",
    "registration": "VT-ABC",
    "type": "C172",
    "baseAirportIcao": "VOMM",
    "status": "ACTIVE",
    "capabilities": {}
  }
]
```

---

### 1.3 Get Aircraft by ID

**Endpoint:** `GET /api/fleet/aircraft/:id`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/fleet/aircraft/AIRCRAFT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 1.4 Update Aircraft

**Endpoint:** `PATCH /api/fleet/aircraft/:id`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "status": "MAINTENANCE",
  "capabilities": {
    "IFR": true,
    "Night": false
  }
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost:3000/api/fleet/aircraft/AIRCRAFT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "MAINTENANCE"
  }'
```

---

## 2. Availability Management

### 2.1 Set Instructor Availability (Self)

**Endpoint:** `POST /api/availability/instructors/me`  
**Roles:** INSTRUCTOR

**Request Body:**
```json
{
  "slots": [
    {
      "startAt": "2025-01-20T09:00:00.000Z",
      "endAt": "2025-01-20T17:00:00.000Z",
      "status": "AVAILABLE",
      "notes": "Available for training"
    },
    {
      "startAt": "2025-01-21T09:00:00.000Z",
      "endAt": "2025-01-21T13:00:00.000Z",
      "status": "AVAILABLE"
    }
  ]
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/availability/instructors/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -d '{
    "slots": [
      {
        "startAt": "2025-01-20T09:00:00.000Z",
        "endAt": "2025-01-20T17:00:00.000Z",
        "status": "AVAILABLE",
        "notes": "Available for training"
      }
    ]
  }'
```

**Expected Response (201 Created):**
```json
[
  {
    "id": "availability-uuid",
    "tenantId": "tenant-uuid",
    "instructorUserId": "instructor-uuid",
    "startAt": "2025-01-20T09:00:00.000Z",
    "endAt": "2025-01-20T17:00:00.000Z",
    "status": "AVAILABLE",
    "notes": "Available for training",
    "createdAt": "2025-01-14T10:00:00.000Z",
    "updatedAt": "2025-01-14T10:00:00.000Z"
  }
]
```

---

### 2.2 Get My Availability (Instructor)

**Endpoint:** `GET /api/availability/instructors/me`  
**Roles:** INSTRUCTOR

**cURL Command:**
```bash
# Get all availability
curl -X GET http://localhost:3000/api/availability/instructors/me \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN"

# Get availability for date range
curl -X GET "http://localhost:3000/api/availability/instructors/me?from=2025-01-20T00:00:00.000Z&to=2025-01-25T23:59:59.000Z" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN"
```

---

### 2.3 Get Instructor Availability (Admin/Ops)

**Endpoint:** `GET /api/availability/instructors/:instructorUserId`  
**Roles:** ADMIN, OPS

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/availability/instructors/INSTRUCTOR_USER_ID?from=2025-01-20T00:00:00.000Z&to=2025-01-25T23:59:59.000Z" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 2.4 Set Aircraft Availability

**Endpoint:** `POST /api/availability/aircraft/:aircraftId`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "slots": [
    {
      "startAt": "2025-01-20T09:00:00.000Z",
      "endAt": "2025-01-20T17:00:00.000Z",
      "status": "AVAILABLE",
      "notes": "Aircraft ready for operations"
    },
    {
      "startAt": "2025-01-22T00:00:00.000Z",
      "endAt": "2025-01-22T23:59:59.000Z",
      "status": "MAINTENANCE",
      "notes": "Annual inspection"
    }
  ]
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/availability/aircraft/AIRCRAFT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "slots": [
      {
        "startAt": "2025-01-20T09:00:00.000Z",
        "endAt": "2025-01-20T17:00:00.000Z",
        "status": "AVAILABLE"
      }
    ]
  }'
```

---

### 2.5 Get Aircraft Availability

**Endpoint:** `GET /api/availability/aircraft/:aircraftId`  
**Roles:** ADMIN, OPS, INSTRUCTOR

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/availability/aircraft/AIRCRAFT_ID?from=2025-01-20T00:00:00.000Z&to=2025-01-25T23:59:59.000Z" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. Roster / Sortie Management

### 3.1 Create a Sortie

**Endpoint:** `POST /api/roster/sorties`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "studentProfileId": "student-profile-uuid",
  "instructorUserId": "instructor-user-uuid",
  "aircraftId": "aircraft-uuid",
  "programId": "program-uuid",
  "lessonId": "lesson-uuid",
  "airportIcao": "VOMM",
  "reportTime": "2025-01-20T09:00:00.000Z",
  "dispatchNotes": "Standard briefing required"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/roster/sorties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "studentProfileId": "student-profile-uuid",
    "instructorUserId": "instructor-user-uuid",
    "aircraftId": "aircraft-uuid",
    "programId": "program-uuid",
    "lessonId": "lesson-uuid",
    "airportIcao": "VOMM",
    "reportTime": "2025-01-20T09:00:00.000Z",
    "dispatchNotes": "Standard briefing required"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "sortie-uuid",
  "tenantId": "tenant-uuid",
  "studentProfileId": "student-profile-uuid",
  "instructorUserId": "instructor-user-uuid",
  "aircraftId": "aircraft-uuid",
  "programId": "program-uuid",
  "lessonId": "lesson-uuid",
  "airportIcao": "VOMM",
  "reportTime": "2025-01-20T09:00:00.000Z",
  "blockOffAt": null,
  "blockOnAt": null,
  "status": "SCHEDULED",
  "dispatchNotes": "Standard briefing required",
  "createdByUserId": "admin-uuid",
  "createdAt": "2025-01-14T10:00:00.000Z",
  "updatedAt": "2025-01-14T10:00:00.000Z"
}
```

---

### 3.2 Update Sortie Status

**Endpoint:** `PATCH /api/roster/sorties/:id/status`  
**Roles:** ADMIN, OPS, INSTRUCTOR

**Status Transition Rules:**
- **INSTRUCTOR** can only move: `SCHEDULED → DISPATCHED → IN_FLIGHT → COMPLETED`
- **ADMIN/OPS** can set any status including `CANCELLED` and `NO_SHOW`

**Request Body:**
```json
{
  "status": "DISPATCHED",
  "dispatchNotes": "Weather clear, aircraft ready"
}
```

**cURL Command (Instructor):**
```bash
# Move from SCHEDULED to DISPATCHED
curl -X PATCH http://localhost:3000/api/roster/sorties/SORTIE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -d '{
    "status": "DISPATCHED",
    "dispatchNotes": "Weather clear, aircraft ready"
  }'

# Move from DISPATCHED to IN_FLIGHT
curl -X PATCH http://localhost:3000/api/roster/sorties/SORTIE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -d '{
    "status": "IN_FLIGHT"
  }'

# Move from IN_FLIGHT to COMPLETED
curl -X PATCH http://localhost:3000/api/roster/sorties/SORTIE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -d '{
    "status": "COMPLETED"
  }'
```

**cURL Command (Admin - Cancel):**
```bash
curl -X PATCH http://localhost:3000/api/roster/sorties/SORTIE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "CANCELLED",
    "dispatchNotes": "Student unavailable"
  }'
```

---

### 3.3 Get My Sorties (Instructor)

**Endpoint:** `GET /api/roster/sorties/me/instructor`  
**Roles:** INSTRUCTOR

**cURL Command:**
```bash
# Get all sorties
curl -X GET http://localhost:3000/api/roster/sorties/me/instructor \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN"

# Get sorties for date range
curl -X GET "http://localhost:3000/api/roster/sorties/me/instructor?from=2025-01-20T00:00:00.000Z&to=2025-01-25T23:59:59.000Z" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "sortie-uuid",
    "studentProfileId": "student-profile-uuid",
    "instructorUserId": "instructor-uuid",
    "aircraftId": "aircraft-uuid",
    "programId": "program-uuid",
    "lessonId": "lesson-uuid",
    "airportIcao": "VOMM",
    "reportTime": "2025-01-20T09:00:00.000Z",
    "status": "SCHEDULED"
  }
]
```

---

### 3.4 Get My Sorties (Student)

**Endpoint:** `GET /api/roster/sorties/me/student`  
**Roles:** STUDENT

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/roster/sorties/me/student?from=2025-01-20T00:00:00.000Z&to=2025-01-25T23:59:59.000Z" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

---

### 3.5 Get Sorties for Ops

**Endpoint:** `GET /api/roster/sorties/ops`  
**Roles:** ADMIN, OPS

**Query Parameters:**
- `from` - Start date (ISO 8601)
- `to` - End date (ISO 8601)
- `status` - Filter by status
- `aircraftId` - Filter by aircraft
- `instructorUserId` - Filter by instructor

**cURL Command:**
```bash
# Get all sorties
curl -X GET http://localhost:3000/api/roster/sorties/ops \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by status
curl -X GET "http://localhost:3000/api/roster/sorties/ops?status=SCHEDULED" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Filter by date range and aircraft
curl -X GET "http://localhost:3000/api/roster/sorties/ops?from=2025-01-20T00:00:00.000Z&to=2025-01-25T23:59:59.000Z&aircraftId=AIRCRAFT_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Complete Test Flow

### Step 1: Create 1-2 Aircraft

```bash
# Aircraft 1
AIRCRAFT_ID_1=$(curl -s -X POST http://localhost:3000/api/fleet/aircraft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"registration":"VT-ABC","type":"C172","baseAirportIcao":"VOMM","status":"ACTIVE","capabilities":{"IFR":true}}' \
  | jq -r '.id')

# Aircraft 2
AIRCRAFT_ID_2=$(curl -s -X POST http://localhost:3000/api/fleet/aircraft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"registration":"VT-XYZ","type":"DA40","baseAirportIcao":"VOMM","status":"ACTIVE"}' \
  | jq -r '.id')
```

---

### Step 2: Set Instructor Availability

```bash
curl -X POST http://localhost:3000/api/availability/instructors/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -d '{
    "slots": [
      {
        "startAt": "2025-01-20T09:00:00.000Z",
        "endAt": "2025-01-20T17:00:00.000Z",
        "status": "AVAILABLE"
      },
      {
        "startAt": "2025-01-21T09:00:00.000Z",
        "endAt": "2025-01-21T17:00:00.000Z",
        "status": "AVAILABLE"
      }
    ]
  }'
```

---

### Step 3: Set Aircraft Availability

```bash
curl -X POST http://localhost:3000/api/availability/aircraft/$AIRCRAFT_ID_1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "slots": [
      {
        "startAt": "2025-01-20T09:00:00.000Z",
        "endAt": "2025-01-20T17:00:00.000Z",
        "status": "AVAILABLE"
      }
    ]
  }'
```

---

### Step 4: Create Student Profile (if not exists)

```bash
curl -X POST http://localhost:3000/api/training/students/STUDENT_USER_ID/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "regulatoryId": "DGCA-FILE-12345",
    "status": "ACTIVE"
  }' | jq
```

**Save the `id` as `STUDENT_PROFILE_ID`.**

---

### Step 5: Schedule a Sortie

```bash
SORTIE_ID=$(curl -s -X POST http://localhost:3000/api/roster/sorties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d "{
    \"studentProfileId\": \"$STUDENT_PROFILE_ID\",
    \"instructorUserId\": \"INSTRUCTOR_USER_ID\",
    \"aircraftId\": \"$AIRCRAFT_ID_1\",
    \"programId\": \"PROGRAM_ID\",
    \"lessonId\": \"LESSON_ID\",
    \"airportIcao\": \"VOMM\",
    \"reportTime\": \"2025-01-20T09:00:00.000Z\"
  }" | jq -r '.id')
```

---

### Step 6: Update Sortie Status Through Lifecycle

```bash
# SCHEDULED → DISPATCHED
curl -X PATCH http://localhost:3000/api/roster/sorties/$SORTIE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -d '{"status":"DISPATCHED","dispatchNotes":"Weather clear"}'

# DISPATCHED → IN_FLIGHT
curl -X PATCH http://localhost:3000/api/roster/sorties/$SORTIE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -d '{"status":"IN_FLIGHT"}'

# IN_FLIGHT → COMPLETED
curl -X PATCH http://localhost:3000/api/roster/sorties/$SORTIE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -d '{"status":"COMPLETED"}'
```

---

## Error Scenarios

### 1. Unauthorized (401)
```bash
curl -X POST http://localhost:3000/api/fleet/aircraft \
  -H "Content-Type: application/json" \
  -d '{"registration":"VT-TEST","type":"C172","baseAirportIcao":"VOMM"}'
```

**Response:**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

---

### 2. Forbidden - Wrong Role (403)
```bash
# STUDENT trying to create aircraft
curl -X POST http://localhost:3000/api/fleet/aircraft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{"registration":"VT-TEST","type":"C172","baseAirportIcao":"VOMM"}'
```

**Response:**
```json
{
  "statusCode": 403,
  "message": "Required role: ADMIN or OPS"
}
```

---

### 3. Not Found (404)
```bash
curl -X GET http://localhost:3000/api/fleet/aircraft/00000000-0000-0000-0000-000000000000 \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Response:**
```json
{
  "statusCode": 404,
  "message": "Aircraft with id '00000000-0000-0000-0000-000000000000' not found"
}
```

---

### 4. Conflict - Duplicate Registration (409)
```bash
# Creating aircraft with existing registration
curl -X POST http://localhost:3000/api/fleet/aircraft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"registration":"VT-ABC","type":"C172","baseAirportIcao":"VOMM"}'
```

**Response:**
```json
{
  "statusCode": 409,
  "message": "Aircraft with registration 'VT-ABC' already exists"
}
```

---

### 5. Forbidden - Invalid Status Transition (403)
```bash
# INSTRUCTOR trying to move from SCHEDULED directly to COMPLETED
curl -X PATCH http://localhost:3000/api/roster/sorties/SORTIE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -d '{"status":"COMPLETED"}'
```

**Response:**
```json
{
  "statusCode": 403,
  "message": "Cannot transition from SCHEDULED to COMPLETED. Allowed: DISPATCHED, CANCELLED"
}
```

---

## Summary

### Files Created/Modified:
- ✅ `db/migrations/2025_11_16_0003_ops_core.sql` (migration)
- ✅ `src/modules/fleet/` (fleet module)
- ✅ `src/modules/availability/` (availability module)
- ✅ `src/modules/roster/` (roster module)

### New Tables:
- `aircraft` - Fleet management
- `instructor_availability` - Instructor availability slots
- `aircraft_availability` - Aircraft availability slots
- `roster_sorties` - Manual sortie scheduling

### New Endpoints:

**Fleet:**
1. `POST /api/fleet/aircraft` - Create aircraft (ADMIN, OPS)
2. `GET /api/fleet/aircraft` - List aircraft (all roles)
3. `GET /api/fleet/aircraft/:id` - Get aircraft (all roles)
4. `PATCH /api/fleet/aircraft/:id` - Update aircraft (ADMIN, OPS)

**Availability:**
5. `POST /api/availability/instructors/me` - Set my availability (INSTRUCTOR)
6. `GET /api/availability/instructors/me` - Get my availability (INSTRUCTOR)
7. `GET /api/availability/instructors/:instructorUserId` - Get instructor availability (ADMIN, OPS)
8. `POST /api/availability/aircraft/:aircraftId` - Set aircraft availability (ADMIN, OPS)
9. `GET /api/availability/aircraft/:aircraftId` - Get aircraft availability (ADMIN, OPS, INSTRUCTOR)

**Roster:**
10. `POST /api/roster/sorties` - Create sortie (ADMIN, OPS)
11. `PATCH /api/roster/sorties/:id/status` - Update sortie status (ADMIN, OPS, INSTRUCTOR)
12. `GET /api/roster/sorties/me/instructor` - Get my sorties as instructor (INSTRUCTOR)
13. `GET /api/roster/sorties/me/student` - Get my sorties as student (STUDENT)
14. `GET /api/roster/sorties/ops` - Get sorties for ops (ADMIN, OPS)

### Quick Test Commands:

**1. Create aircraft:**
```bash
curl -X POST http://localhost:3000/api/fleet/aircraft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"registration":"VT-ABC","type":"C172","baseAirportIcao":"VOMM","status":"ACTIVE"}'
```

**2. Set instructor availability:**
```bash
curl -X POST http://localhost:3000/api/availability/instructors/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -d '{"slots":[{"startAt":"2025-01-20T09:00:00.000Z","endAt":"2025-01-20T17:00:00.000Z","status":"AVAILABLE"}]}'
```

**3. Set aircraft availability:**
```bash
curl -X POST http://localhost:3000/api/availability/aircraft/AIRCRAFT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"slots":[{"startAt":"2025-01-20T09:00:00.000Z","endAt":"2025-01-20T17:00:00.000Z","status":"AVAILABLE"}]}'
```

**4. Create sortie:**
```bash
curl -X POST http://localhost:3000/api/roster/sorties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"studentProfileId":"PROFILE_ID","instructorUserId":"INSTRUCTOR_ID","aircraftId":"AIRCRAFT_ID","programId":"PROGRAM_ID","lessonId":"LESSON_ID","airportIcao":"VOMM","reportTime":"2025-01-20T09:00:00.000Z"}'
```

**5. Get my sorties as instructor:**
```bash
curl -X GET http://localhost:3000/api/roster/sorties/me/instructor \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN"
```

**6. Get my sorties as student:**
```bash
curl -X GET http://localhost:3000/api/roster/sorties/me/student \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

