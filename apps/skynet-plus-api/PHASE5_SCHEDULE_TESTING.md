# Phase 5: Schedule Engine (Gen-1) + Ops Overview Testing Guide

## Overview

This guide covers testing the Schedule and Ops Overview modules:
- **Schedule** - Static schedule blocks and instructor daily schedules
- **Ops Overview** - Operational summaries and utilization metrics

All endpoints are multi-tenant and role-aware.

---

## Prerequisites

1. **Database Migration**: Ensure the schedule and ops tables are created:
   ```bash
   cd apps/skynet-plus-api
   psql "$DATABASE_URL" -f db/migrations/2025_11_16_0005_schedule_ops.sql
   ```

2. **Auth Tokens**: You'll need valid JWT tokens for:
   - ADMIN user (for block management and ops overview)
   - OPS user (for block management and ops overview)
   - INSTRUCTOR user (for setting own daily schedule)
   - STUDENT user (for viewing schedules)

3. **Existing Data**: From previous phases, you should have:
   - At least one instructor user
   - At least one aircraft
   - Some roster sorties (for ops overview)

---

## 1. Schedule Module

### 1.1 Create Schedule Block

**Endpoint:** `POST /api/schedule/blocks`  
**Roles:** ADMIN, OPS

Creates a static time block (e.g., "Block A" from 06:00-08:00).

**Request Body:**
```json
{
  "label": "Block A",
  "startMinutes": 360,
  "endMinutes": 480
}
```

**Note:** 
- `startMinutes`: Minutes from midnight (360 = 06:00, 480 = 08:00)
- `endMinutes`: Must be greater than `startMinutes`
- `label`: Must be unique per tenant

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/schedule/blocks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "label": "Block A",
    "startMinutes": 360,
    "endMinutes": 480
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "block-uuid",
  "tenantId": "tenant-uuid",
  "label": "Block A",
  "startMinutes": 360,
  "endMinutes": 480,
  "createdAt": "2025-01-20T10:00:00.000Z"
}
```

**Error Cases:**
- **409 Conflict**: If block label already exists
- **400 Bad Request**: If `startMinutes >= endMinutes`

---

### 1.2 List Schedule Blocks

**Endpoint:** `GET /api/schedule/blocks`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/schedule/blocks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "block-uuid-1",
    "label": "Block A",
    "startMinutes": 360,
    "endMinutes": 480
  },
  {
    "id": "block-uuid-2",
    "label": "Block B",
    "startMinutes": 480,
    "endMinutes": 600
  }
]
```

**Note:** Blocks are ordered by `startMinutes` ascending.

---

### 1.3 Get Schedule Block by ID

**Endpoint:** `GET /api/schedule/blocks/:id`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/schedule/blocks/BLOCK_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "id": "block-uuid",
  "tenantId": "tenant-uuid",
  "label": "Block A",
  "startMinutes": 360,
  "endMinutes": 480,
  "createdAt": "2025-01-20T10:00:00.000Z"
}
```

---

### 1.4 Update Schedule Block

**Endpoint:** `PUT /api/schedule/blocks/:id`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "label": "Morning Block",
  "startMinutes": 360,
  "endMinutes": 500
}
```

**cURL Command:**
```bash
curl -X PUT http://localhost:3000/api/schedule/blocks/BLOCK_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "label": "Morning Block",
    "startMinutes": 360,
    "endMinutes": 500
  }'
```

**Expected Response (200 OK):**
```json
{
  "id": "block-uuid",
  "label": "Morning Block",
  "startMinutes": 360,
  "endMinutes": 500,
  ...
}
```

---

### 1.5 Delete Schedule Block

**Endpoint:** `DELETE /api/schedule/blocks/:id`  
**Roles:** ADMIN, OPS

**cURL Command:**
```bash
curl -X DELETE http://localhost:3000/api/schedule/blocks/BLOCK_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (204 No Content)**

**Note:** Deleting a block will cascade delete related instructor daily schedule entries.

---

### 1.6 Set Instructor Daily Schedule

**Endpoint:** `POST /api/schedule/instructors/:instructorUserId/daily`  
**Roles:** ADMIN, OPS, INSTRUCTOR

Sets the daily schedule for an instructor by mapping schedule blocks to statuses.

**Request Body:**
```json
{
  "date": "2025-01-20",
  "blocks": [
    {
      "blockId": "block-uuid-1",
      "status": "AVAILABLE"
    },
    {
      "blockId": "block-uuid-2",
      "status": "BUSY"
    },
    {
      "blockId": "block-uuid-3",
      "status": "LEAVE"
    }
  ]
}
```

**Status Values:**
- `AVAILABLE`: Instructor is available for this block
- `BUSY`: Instructor is busy (assigned to another activity)
- `LEAVE`: Instructor is on leave

**cURL Command (as ADMIN/OPS):**
```bash
curl -X POST http://localhost:3000/api/schedule/instructors/INSTRUCTOR_USER_UUID/daily \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "date": "2025-01-20",
    "blocks": [
      {
        "blockId": "block-uuid-1",
        "status": "AVAILABLE"
      },
      {
        "blockId": "block-uuid-2",
        "status": "BUSY"
      }
    ]
  }'
```

**cURL Command (as INSTRUCTOR - own schedule):**
```bash
curl -X POST http://localhost:3000/api/schedule/instructors/YOUR_INSTRUCTOR_USER_UUID/daily \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -d '{
    "date": "2025-01-20",
    "blocks": [
      {
        "blockId": "block-uuid-1",
        "status": "AVAILABLE"
      }
    ]
  }'
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "schedule-uuid-1",
    "tenantId": "tenant-uuid",
    "instructorUserId": "instructor-user-uuid",
    "date": "2025-01-20",
    "blockId": "block-uuid-1",
    "status": "AVAILABLE",
    "createdAt": "2025-01-20T10:00:00.000Z",
    "updatedAt": "2025-01-20T10:00:00.000Z"
  },
  {
    "id": "schedule-uuid-2",
    "instructorUserId": "instructor-user-uuid",
    "date": "2025-01-20",
    "blockId": "block-uuid-2",
    "status": "BUSY",
    ...
  }
]
```

**Error Cases:**
- **403 Forbidden**: If INSTRUCTOR tries to set another instructor's schedule
- **404 Not Found**: If instructor or block not found
- **400 Bad Request**: If invalid status value

---

### 1.7 Get Instructor Daily Schedule

**Endpoint:** `GET /api/schedule/instructors/:instructorUserId/daily?date=YYYY-MM-DD`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/schedule/instructors/INSTRUCTOR_USER_UUID/daily?date=2025-01-20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "schedule-uuid-1",
    "instructorUserId": "instructor-user-uuid",
    "date": "2025-01-20",
    "blockId": "block-uuid-1",
    "status": "AVAILABLE",
    ...
  },
  {
    "id": "schedule-uuid-2",
    "instructorUserId": "instructor-user-uuid",
    "date": "2025-01-20",
    "blockId": "block-uuid-2",
    "status": "BUSY",
    ...
  }
]
```

**Note:** Results are ordered by block start time (ascending).

---

## 2. Ops Overview Module

### 2.1 Get Daily Summary

**Endpoint:** `GET /api/ops/summary?date=YYYY-MM-DD`  
**Roles:** ADMIN, OPS

Returns operational summary for a specific date, including:
- Sortie counts by status
- Instructor utilization
- Aircraft utilization
- Overall utilization

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/ops/summary?date=2025-01-20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "date": "2025-01-20",
  "totalSorties": 15,
  "completed": 12,
  "cancelled": 2,
  "noShow": 1,
  "scheduled": 0,
  "dispatched": 0,
  "inFlight": 0,
  "instructorUtilization": 75.5,
  "aircraftUtilization": 80.0,
  "overallUtilization": 77.75
}
```

**Metrics Explained:**
- **totalSorties**: Total number of sorties scheduled for the date
- **completed**: Number of sorties with status `COMPLETED`
- **cancelled**: Number of sorties with status `CANCELLED`
- **noShow**: Number of sorties with status `NO_SHOW`
- **instructorUtilization**: Percentage of active instructors who completed at least one sortie
- **aircraftUtilization**: Percentage of active aircraft that completed at least one sortie
- **overallUtilization**: Average of instructor and aircraft utilization

---

### 2.2 Get Summary Range

**Endpoint:** `GET /api/ops/summary/range?from=YYYY-MM-DD&to=YYYY-MM-DD`  
**Roles:** ADMIN, OPS

Returns operational summaries for a date range.

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/ops/summary/range?from=2025-01-20&to=2025-01-25" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "date": "2025-01-25",
    "totalSorties": 18,
    "completed": 16,
    "cancelled": 1,
    "noShow": 1,
    "instructorUtilization": 82.5,
    "aircraftUtilization": 85.0,
    "overallUtilization": 83.75
  },
  {
    "date": "2025-01-24",
    "totalSorties": 15,
    "completed": 14,
    "cancelled": 1,
    "noShow": 0,
    ...
  },
  ...
]
```

**Note:** Results are ordered by date descending (most recent first).

---

### 2.3 Get Utilization by Airport

**Endpoint:** `GET /api/ops/utilization?airportIcao=VOMM&date=YYYY-MM-DD`  
**Roles:** ADMIN, OPS

Returns utilization metrics for a specific airport on a specific date.

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/ops/utilization?airportIcao=VOMM&date=2025-01-20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "airportIcao": "VOMM",
  "date": "2025-01-20",
  "totalSorties": 10,
  "completed": 9,
  "utilization": 90.0
}
```

**Metrics Explained:**
- **totalSorties**: Total number of sorties at this airport on this date
- **completed**: Number of completed sorties
- **utilization**: Percentage of sorties that were completed (completed / totalSorties * 100)

---

## 3. Complete Testing Flow

### Step 1: Create Schedule Blocks

```bash
# Create Block A (06:00-08:00)
curl -X POST http://localhost:3000/api/schedule/blocks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "label": "Block A",
    "startMinutes": 360,
    "endMinutes": 480
  }'

# Create Block B (08:00-10:00)
curl -X POST http://localhost:3000/api/schedule/blocks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "label": "Block B",
    "startMinutes": 480,
    "endMinutes": 600
  }'
```

Save the `id` values from responses as `BLOCK_A_UUID` and `BLOCK_B_UUID`.

---

### Step 2: Set Instructor Daily Schedule

```bash
curl -X POST http://localhost:3000/api/schedule/instructors/INSTRUCTOR_USER_UUID/daily \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "date": "2025-01-20",
    "blocks": [
      {
        "blockId": "BLOCK_A_UUID",
        "status": "AVAILABLE"
      },
      {
        "blockId": "BLOCK_B_UUID",
        "status": "BUSY"
      }
    ]
  }'
```

---

### Step 3: Get Instructor Schedule

```bash
curl -X GET "http://localhost:3000/api/schedule/instructors/INSTRUCTOR_USER_UUID/daily?date=2025-01-20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:** List of blocks with statuses for the instructor on that date.

---

### Step 4: Create Some Sorties (from Phase 3)

Create a few sorties for the date you're testing with, ensuring some are completed.

---

### Step 5: Get Ops Summary

```bash
curl -X GET "http://localhost:3000/api/ops/summary?date=2025-01-20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected:** Summary with sortie counts and utilization metrics.

---

### Step 6: Get Utilization by Airport

```bash
curl -X GET "http://localhost:3000/api/ops/utilization?airportIcao=VOMM&date=2025-01-20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected:** Airport-specific utilization metrics.

---

## 4. Test Cases

### Test Case 1: Duplicate Block Label

1. Create a block with label "Block A"
2. Try to create another block with label "Block A"
3. **Expected:** 409 Conflict error

---

### Test Case 2: Invalid Time Range

1. Try to create a block with `startMinutes: 480, endMinutes: 360`
2. **Expected:** 400 Bad Request (startMinutes must be < endMinutes)

---

### Test Case 3: Instructor Access Control

1. As INSTRUCTOR, try to set schedule for another instructor
2. **Expected:** 403 Forbidden

---

### Test Case 4: Set Own Schedule as Instructor

1. As INSTRUCTOR, set your own schedule
2. **Expected:** 200 OK with schedule entries

---

### Test Case 5: Ops Summary with No Sorties

1. Get ops summary for a date with no sorties
2. **Expected:** Summary with all counts = 0, utilization = 0

---

### Test Case 6: Ops Summary Range

1. Get ops summary for a date range
2. **Expected:** Array of summaries, one per date, ordered by date descending

---

## 5. Notes

- Schedule blocks are tenant-specific (each tenant has their own blocks)
- Instructor daily schedules are unique per (instructor, date, block) combination
- Setting an instructor's schedule replaces all existing entries for that date
- Ops summaries are computed on-the-fly from roster_sorties data
- Utilization metrics are calculated as:
  - **Instructor Utilization**: (instructors with completed sorties / total active instructors) * 100
  - **Aircraft Utilization**: (aircraft with completed sorties / total active aircraft) * 100
  - **Overall Utilization**: Average of instructor and aircraft utilization

---

## 6. Troubleshooting

### Issue: "Block not found" when setting instructor schedule

**Solution:** Ensure the block exists and belongs to the correct tenant. Check the block ID.

---

### Issue: "Instructor not found"

**Solution:** Ensure the instructor user exists and has role `INSTRUCTOR` in the tenant.

---

### Issue: 403 Forbidden when setting schedule as INSTRUCTOR

**Solution:** Ensure you're setting your own schedule (instructorUserId matches your user ID).

---

### Issue: Ops summary shows 0 utilization

**Solution:** Check that:
1. There are sorties for the date
2. Some sorties have status `COMPLETED`
3. There are active instructors and aircraft in the tenant

---

## End of Phase 5 Testing Guide

