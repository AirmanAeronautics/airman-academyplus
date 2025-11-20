# Phase 4: Environment & Dispatch Intelligence Testing Guide

## Overview

This guide covers testing the Environment and Dispatch modules:
- **Environment** - WX/NOTAM/Traffic snapshot ingestion and querying
- **Dispatch** - Risk assessment and dispatch annotations for roster sorties

All endpoints are multi-tenant and role-aware.

---

## Prerequisites

1. **Database Migration**: Ensure the environment and dispatch tables are created:
   ```bash
   cd apps/skynet-plus-api
   psql "$DATABASE_URL" -f db/migrations/2025_11_16_0004_environment_dispatch.sql
   ```

2. **Auth Tokens**: You'll need valid JWT tokens for:
   - ADMIN user (for environment ingestion and dispatch annotations)
   - OPS user (for dispatch dashboard)
   - INSTRUCTOR user (for viewing own sorties with dispatch info)
   - STUDENT user (for viewing own sorties with dispatch info)

3. **Existing Data**: From Phase 3, you should have:
   - At least one roster sortie (scheduled flight)
   - Aircraft and instructor availability

---

## 1. Environment Module

### 1.1 Ingest Environment Snapshot

**Endpoint:** `POST /api/environment/ingest`  
**Roles:** ADMIN, OPS

This endpoint ingests weather, NOTAM, and traffic data for an airport. The system automatically computes derived flags (wxBelowVfrMinima, strongCrosswind, runwayClosed, highTraffic).

**Request Body:**
```json
{
  "airportIcao": "VOMM",
  "capturedAt": "2025-01-20T04:30:00.000Z",
  "metarJson": {
    "visibility": 8.5,
    "ceiling": 3500,
    "windSpeed": 18,
    "windDirection": 270,
    "crosswindComponent": 14
  },
  "tafJson": {
    "validFrom": "2025-01-20T00:00:00.000Z",
    "validTo": "2025-01-21T00:00:00.000Z",
    "forecast": "VFR conditions expected"
  },
  "notamsJson": [
    {
      "id": "NOTAM001",
      "text": "RWY 07/25 CLSD 2000-2200 UTC daily for maintenance"
    }
  ],
  "trafficJson": {
    "densityIndex": 0.4,
    "nearbyAircraft": 8
  }
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/environment/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "airportIcao": "VOMM",
    "capturedAt": "2025-01-20T04:30:00.000Z",
    "metarJson": {
      "visibility": 8.5,
      "ceiling": 3500,
      "windSpeed": 18,
      "windDirection": 270,
      "crosswindComponent": 14
    },
    "tafJson": {
      "validFrom": "2025-01-20T00:00:00.000Z",
      "validTo": "2025-01-21T00:00:00.000Z",
      "forecast": "VFR conditions expected"
    },
    "notamsJson": [
      {
        "id": "NOTAM001",
        "text": "RWY 07/25 CLSD 2000-2200 UTC daily for maintenance"
      }
    ],
    "trafficJson": {
      "densityIndex": 0.4,
      "nearbyAircraft": 8
    }
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "snapshot-uuid",
  "tenantId": null,
  "airportIcao": "VOMM",
  "capturedAt": "2025-01-20T04:30:00.000Z",
  "metarJson": {
    "visibility": 8.5,
    "ceiling": 3500,
    "windSpeed": 18,
    "windDirection": 270,
    "crosswindComponent": 14
  },
  "tafJson": { ... },
  "notamsJson": [ ... ],
  "trafficJson": { ... },
  "derivedFlags": {
    "wxBelowVfrMinima": false,
    "strongCrosswind": true,
    "runwayClosed": false,
    "highTraffic": false
  },
  "createdAt": "2025-01-20T04:30:00.000Z"
}
```

**Note:** The `derivedFlags` are automatically computed:
- `wxBelowVfrMinima`: true if visibility < 5km OR ceiling < 3000ft
- `strongCrosswind`: true if crosswindComponent > 15kt OR windSpeed > 20kt
- `runwayClosed`: true if any NOTAM contains "RWY" and "CLSD" or "CLOSED"
- `highTraffic`: true if trafficJson.densityIndex > 0.7

---

### 1.2 Get Latest Environment Snapshot

**Endpoint:** `GET /api/environment/latest?airportIcao=VOMM`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/environment/latest?airportIcao=VOMM" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "id": "snapshot-uuid",
  "tenantId": null,
  "airportIcao": "VOMM",
  "capturedAt": "2025-01-20T04:30:00.000Z",
  "metarJson": { ... },
  "derivedFlags": { ... },
  "createdAt": "2025-01-20T04:30:00.000Z"
}
```

---

### 1.3 Get Environment History

**Endpoint:** `GET /api/environment/history?airportIcao=VOMM&from=2025-01-20T00:00:00.000Z&to=2025-01-21T00:00:00.000Z`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/environment/history?airportIcao=VOMM&from=2025-01-20T00:00:00.000Z&to=2025-01-21T00:00:00.000Z" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "snapshot-uuid-1",
    "airportIcao": "VOMM",
    "capturedAt": "2025-01-20T04:30:00.000Z",
    "derivedFlags": { ... }
  },
  {
    "id": "snapshot-uuid-2",
    "airportIcao": "VOMM",
    "capturedAt": "2025-01-20T02:00:00.000Z",
    "derivedFlags": { ... }
  }
]
```

---

## 2. Dispatch Module

### 2.1 Annotate Sortie (Create/Update Dispatch Annotation)

**Endpoint:** `POST /api/dispatch/sorties/:sortieId/annotate`  
**Roles:** ADMIN, OPS

This endpoint:
1. Looks up the sortie by ID
2. Fetches the latest environment snapshot for the sortie's airport where `captured_at <= report_time`
3. Computes risk level from derived flags:
   - **RED**: if `wxBelowVfrMinima = true` OR `runwayClosed = true`
   - **AMBER**: if `highTraffic = true` OR `strongCrosswind = true` (and not already RED)
   - **GREEN**: otherwise
4. Creates or updates the dispatch annotation

**Request Body:**
```json
{
  "notes": "WX marginal but acceptable for circuits; monitor crosswind."
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/dispatch/sorties/SORTIE_UUID/annotate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "notes": "WX marginal but acceptable for circuits; monitor crosswind."
  }'
```

**Expected Response (200 OK):**
```json
{
  "id": "annotation-uuid",
  "tenantId": "tenant-uuid",
  "rosterSortieId": "sortie-uuid",
  "snapshotId": "snapshot-uuid",
  "riskLevel": "AMBER",
  "flags": {
    "wxBelowVfrMinima": false,
    "strongCrosswind": true,
    "runwayClosed": false,
    "highTraffic": false
  },
  "notes": "WX marginal but acceptable for circuits; monitor crosswind.",
  "createdByUserId": "user-uuid",
  "createdAt": "2025-01-20T05:00:00.000Z"
}
```

**Expected Behavior:**
- If no snapshot exists → annotation falls back to GREEN with no flags
- If `derivedFlags.wxBelowVfrMinima = true` → riskLevel must be RED
- If `derivedFlags.runwayClosed = true` → riskLevel must be RED

---

### 2.2 Get Sortie with Dispatch Info

**Endpoint:** `GET /api/dispatch/sorties/:sortieId`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT (with access control)

**Access Control:**
- **INSTRUCTOR**: Can only access sorties where `instructor_user_id` matches current user
- **STUDENT**: Can only access sorties where `student_profile_id` belongs to current student
- **ADMIN/OPS**: Can access any sortie in tenant

**cURL Command (as ADMIN/OPS):**
```bash
curl -X GET http://localhost:3000/api/dispatch/sorties/SORTIE_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**cURL Command (as INSTRUCTOR):**
```bash
curl -X GET http://localhost:3000/api/dispatch/sorties/SORTIE_UUID \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "sortie": {
    "id": "sortie-uuid",
    "tenantId": "tenant-uuid",
    "studentProfileId": "student-profile-uuid",
    "instructorUserId": "instructor-user-uuid",
    "aircraftId": "aircraft-uuid",
    "airportIcao": "VOMM",
    "reportTime": "2025-01-20T06:00:00.000Z",
    "status": "SCHEDULED",
    ...
  },
  "dispatchAnnotation": {
    "id": "annotation-uuid",
    "riskLevel": "AMBER",
    "flags": { ... },
    "notes": "...",
    ...
  },
  "environmentSnapshot": {
    "id": "snapshot-uuid",
    "airportIcao": "VOMM",
    "capturedAt": "2025-01-20T04:30:00.000Z",
    "derivedFlags": { ... },
    ...
  }
}
```

**Error Cases:**
- **403 Forbidden**: If user tries to access a sortie they don't own (instructor/student)
- **404 Not Found**: If sortie not found in tenant

---

### 2.3 Get Dispatch Dashboard

**Endpoint:** `GET /api/dispatch/dashboard`  
**Roles:** ADMIN, OPS

Returns a list of sorties with dispatch annotations, filtered by various criteria.

**Query Parameters:**
- `from` (optional): ISO date string - filter sorties from this date
- `to` (optional): ISO date string - filter sorties to this date
- `airportIcao` (optional): Filter by airport ICAO code
- `riskLevel` (optional): Filter by risk level (GREEN, AMBER, RED)
- `status` (optional): Filter by sortie status

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/dispatch/dashboard?airportIcao=VOMM&riskLevel=AMBER&from=2025-01-20T00:00:00.000Z" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "sortieId": "sortie-uuid-1",
    "tenantId": "tenant-uuid",
    "studentProfileId": "student-profile-uuid",
    "instructorUserId": "instructor-user-uuid",
    "aircraftId": "aircraft-uuid",
    "airportIcao": "VOMM",
    "reportTime": "2025-01-20T06:00:00.000Z",
    "status": "SCHEDULED",
    "riskLevel": "AMBER",
    "flags": {
      "wxBelowVfrMinima": false,
      "strongCrosswind": true,
      "runwayClosed": false,
      "highTraffic": false
    },
    "annotationId": "annotation-uuid",
    "snapshotId": "snapshot-uuid"
  },
  {
    "sortieId": "sortie-uuid-2",
    "airportIcao": "VOMM",
    "reportTime": "2025-01-20T08:00:00.000Z",
    "status": "SCHEDULED",
    "riskLevel": "GREEN",
    "flags": null,
    "annotationId": null,
    "snapshotId": null
  }
]
```

**Note:** Sorties without annotations will have `riskLevel = 'GREEN'` (default), `flags = null`, and `annotationId = null`.

---

## 3. Complete Testing Flow

### Step 1: Create a Sortie (from Phase 3)

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
    "reportTime": "2025-01-20T06:00:00.000Z"
  }'
```

Save the `id` from the response as `SORTIE_UUID`.

---

### Step 2: Ingest Environment Snapshot

```bash
curl -X POST http://localhost:3000/api/environment/ingest \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "airportIcao": "VOMM",
    "capturedAt": "2025-01-20T04:30:00.000Z",
    "metarJson": {
      "visibility": 4.0,
      "ceiling": 2500,
      "windSpeed": 22,
      "crosswindComponent": 16
    },
    "notamsJson": [],
    "trafficJson": {
      "densityIndex": 0.5
    }
  }'
```

**Expected:** `derivedFlags.wxBelowVfrMinima = true` (visibility 4.0 < 5.0), `strongCrosswind = true` (crosswind 16 > 15).

---

### Step 3: Annotate the Sortie

```bash
curl -X POST http://localhost:3000/api/dispatch/sorties/SORTIE_UUID/annotate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "notes": "WX below VFR minima - RED risk level expected."
  }'
```

**Expected:** `riskLevel = "RED"` because `wxBelowVfrMinima = true`.

---

### Step 4: View Sortie with Dispatch Info

```bash
curl -X GET http://localhost:3000/api/dispatch/sorties/SORTIE_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected:** Full sortie details with dispatch annotation showing RED risk level.

---

### Step 5: View Dispatch Dashboard

```bash
curl -X GET "http://localhost:3000/api/dispatch/dashboard?airportIcao=VOMM&riskLevel=RED" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected:** List of sorties filtered by airport and RED risk level, including the sortie from Step 1.

---

## 4. Test Cases

### Test Case 1: No Snapshot → GREEN Risk

1. Create a sortie for airport "VOBL"
2. Annotate the sortie (no snapshot exists for VOBL)
3. **Expected:** `riskLevel = "GREEN"`, `flags = {}`, `snapshotId = null`

---

### Test Case 2: WX Below VFR Minima → RED Risk

1. Ingest snapshot with `visibility: 3.0` (km) OR `ceiling: 2000` (ft)
2. Create sortie for same airport
3. Annotate the sortie
4. **Expected:** `riskLevel = "RED"`, `flags.wxBelowVfrMinima = true`

---

### Test Case 3: Runway Closed → RED Risk

1. Ingest snapshot with NOTAM containing "RWY 07 CLSD"
2. Create sortie for same airport
3. Annotate the sortie
4. **Expected:** `riskLevel = "RED"`, `flags.runwayClosed = true`

---

### Test Case 4: High Traffic → AMBER Risk

1. Ingest snapshot with `trafficJson.densityIndex = 0.8`
2. Create sortie for same airport
3. Annotate the sortie
4. **Expected:** `riskLevel = "AMBER"`, `flags.highTraffic = true`

---

### Test Case 5: Access Control (INSTRUCTOR)

1. As INSTRUCTOR, try to access a sortie assigned to another instructor
2. **Expected:** 403 Forbidden

---

### Test Case 6: Access Control (STUDENT)

1. As STUDENT, try to access a sortie assigned to another student
2. **Expected:** 403 Forbidden

---

## 5. Notes

- Environment snapshots are stored with `tenant_id = NULL` by default (global/shared data)
- The system looks up snapshots where `captured_at <= sortie.report_time` to get the most recent snapshot before the sortie
- If multiple snapshots exist, the one with the latest `captured_at` (but still <= report_time) is used
- Derived flags are computed automatically on ingestion
- Risk level is computed automatically when annotating a sortie
- Dispatch annotations are unique per sortie (one annotation per sortie)

---

## 6. Troubleshooting

### Issue: "Sortie not found" when annotating

**Solution:** Ensure the sortie exists and belongs to the correct tenant. Check the sortie ID and tenant ID.

---

### Issue: Risk level is GREEN even though WX is bad

**Solution:** Check that:
1. A snapshot exists for the sortie's airport
2. The snapshot's `captured_at` is <= the sortie's `report_time`
3. The snapshot's `derivedFlags` are correctly computed

---

### Issue: 403 Forbidden when accessing sortie

**Solution:** Ensure:
- INSTRUCTOR users can only access sorties where they are the assigned instructor
- STUDENT users can only access sorties where they are the assigned student
- ADMIN/OPS users can access any sortie in their tenant

---

## End of Phase 4 Testing Guide

