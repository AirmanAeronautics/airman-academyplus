# Phase 8: Support, Messaging, Maverick Sync & Compliance Testing Guide

## Overview

This guide covers testing the Phase 8 modules:
- **Support** - Helpdesk ticket management
- **Messaging** - Internal organizational messaging
- **Maverick Sync** - Event synchronization for Maverick app
- **Compliance** - Compliance items, records, and incidents

All endpoints are multi-tenant and role-aware.

---

## Prerequisites

1. **Database Migrations**: Ensure all Phase 8 tables are created:
   ```bash
   cd apps/skynet-plus-api
   psql "$DATABASE_URL" -f db/migrations/2025_11_16_0008_support.sql
   psql "$DATABASE_URL" -f db/migrations/2025_11_16_0009_messaging_sync.sql
   psql "$DATABASE_URL" -f db/migrations/2025_11_16_0010_compliance.sql
   ```

2. **Auth Tokens**: You'll need valid JWT tokens for:
   - ADMIN user (for all operations)
   - OPS user (for all operations)
   - INSTRUCTOR user (for support tickets, messaging, compliance records)
   - STUDENT user (for creating support tickets and incidents)

3. **Existing Data**: From previous phases, you should have:
   - At least one sortie (for linking threads/messages)
   - At least one aircraft (for linking threads/incidents)
   - At least one student profile (for linking threads)

---

## 1. Support Module

### 1.1 Create Support Ticket

**Endpoint:** `POST /api/support/tickets`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**Request Body:**
```json
{
  "category": "TECHNICAL",
  "priority": "MEDIUM",
  "subject": "Aircraft radio not working",
  "description": "VT-ABC radio frequency selector stuck on 121.5"
}
```

**Categories:** TECHNICAL, SCHEDULING, BILLING, MAINTENANCE, OTHER  
**Priorities:** LOW, MEDIUM, HIGH, CRITICAL

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/support/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "category": "TECHNICAL",
    "priority": "MEDIUM",
    "subject": "Aircraft radio not working",
    "description": "VT-ABC radio frequency selector stuck on 121.5"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "ticket-uuid",
  "tenantId": "tenant-uuid",
  "createdByUserId": "user-uuid",
  "assignedToUserId": null,
  "category": "TECHNICAL",
  "priority": "MEDIUM",
  "status": "OPEN",
  "subject": "Aircraft radio not working",
  "description": "VT-ABC radio frequency selector stuck on 121.5",
  "createdAt": "2025-01-20T10:00:00.000Z",
  "updatedAt": "2025-01-20T10:00:00.000Z"
}
```

---

### 1.2 List Tickets

**Endpoint:** `GET /api/support/tickets`  
**Roles:** ADMIN, OPS, INSTRUCTOR

**Query Parameters:**
- `status` (optional): Filter by status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- `category` (optional): Filter by category

**Note:** INSTRUCTOR and STUDENT can only see tickets they created or are assigned to.

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/support/tickets?status=OPEN&category=TECHNICAL" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 1.3 Get My Tickets

**Endpoint:** `GET /api/support/tickets/mine`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/support/tickets/mine \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 1.4 Update Ticket

**Endpoint:** `PATCH /api/support/tickets/:id`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "assignedToUserId": "user-uuid",
  "priority": "HIGH"
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost:3000/api/support/tickets/TICKET_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "IN_PROGRESS",
    "assignedToUserId": "user-uuid"
  }'
```

---

### 1.5 Create Ticket Message

**Endpoint:** `POST /api/support/tickets/:id/messages`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**Request Body:**
```json
{
  "message": "Maintenance team has been notified. Expected resolution: 2 hours."
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/support/tickets/TICKET_UUID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Maintenance team has been notified. Expected resolution: 2 hours."
  }'
```

**Note:** Only participants (creator, assignee, or users who have sent messages) can add messages.

---

### 1.6 List Ticket Messages

**Endpoint:** `GET /api/support/tickets/:id/messages`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/support/tickets/TICKET_UUID/messages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2. Messaging Module

### 2.1 Create Thread

**Endpoint:** `POST /api/messaging/threads`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**Request Body:**
```json
{
  "type": "SORTIE",
  "title": "Discussion about tomorrow's flight",
  "sortieId": "sortie-uuid"
}
```

**Thread Types:** GENERAL, SORTIE, AIRCRAFT, STUDENT

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/messaging/threads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "GENERAL",
    "title": "Weekly briefing discussion"
  }'
```

---

### 2.2 List Threads

**Endpoint:** `GET /api/messaging/threads`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**Query Parameters:**
- `type` (optional): Filter by type
- `sortieId` (optional): Filter by sortie
- `aircraftId` (optional): Filter by aircraft
- `studentProfileId` (optional): Filter by student

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/messaging/threads?type=SORTIE&sortieId=SORTIE_UUID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2.3 Get Thread

**Endpoint:** `GET /api/messaging/threads/:id`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/messaging/threads/THREAD_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2.4 Create Message

**Endpoint:** `POST /api/messaging/threads/:id/messages`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**Request Body:**
```json
{
  "body": "Weather looks good for tomorrow. All systems checked."
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/messaging/threads/THREAD_UUID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "body": "Weather looks good for tomorrow. All systems checked."
  }'
```

**Note:** If thread type is SORTIE and linked to a student, a Maverick sync event is automatically created.

---

### 2.5 List Messages

**Endpoint:** `GET /api/messaging/threads/:id/messages`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/messaging/threads/THREAD_UUID/messages \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. Maverick Sync Module

### 3.1 List Events

**Endpoint:** `GET /api/maverick/events`  
**Roles:** ADMIN, OPS

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, SENT, FAILED)
- `since` (optional): ISO date string - get events since this date

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/maverick/events?status=PENDING&since=2025-01-20T00:00:00.000Z" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "event-uuid-1",
    "tenantId": "tenant-uuid",
    "eventType": "SORTIE_SCHEDULED",
    "entityType": "SORTIE",
    "entityId": "sortie-uuid",
    "payload": {
      "studentProfileId": "student-profile-uuid",
      "instructorUserId": "instructor-user-uuid",
      "reportTime": "2025-01-20T06:00:00.000Z"
    },
    "status": "PENDING",
    "createdAt": "2025-01-20T05:00:00.000Z"
  },
  {
    "id": "event-uuid-2",
    "eventType": "MESSAGE_CREATED",
    "entityType": "MESSAGE",
    "entityId": "message-uuid",
    "status": "PENDING",
    ...
  }
]
```

---

### 3.2 Acknowledge Event

**Endpoint:** `POST /api/maverick/events/:id/ack`  
**Roles:** ADMIN, OPS

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/maverick/events/EVENT_UUID/ack \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "id": "event-uuid",
  "status": "SENT",
  ...
}
```

**Note:** This marks the event as SENT, indicating Maverick app has processed it.

---

## 4. Compliance Module

### 4.1 Create Compliance Item

**Endpoint:** `POST /api/compliance/items`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "code": "DGCA-CFI-001",
  "title": "Pre-flight inspection checklist",
  "description": "Verify all aircraft systems before flight",
  "category": "SAFETY",
  "frequency": "PER_FLIGHT",
  "isActive": true
}
```

**Categories:** TRAINING, MAINTENANCE, SAFETY, DOCUMENTS  
**Frequencies:** DAILY, WEEKLY, MONTHLY, PER_FLIGHT, ADHOC

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/compliance/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code": "DGCA-CFI-001",
    "title": "Pre-flight inspection checklist",
    "description": "Verify all aircraft systems before flight",
    "category": "SAFETY",
    "frequency": "PER_FLIGHT"
  }'
```

---

### 4.2 List Compliance Items

**Endpoint:** `GET /api/compliance/items`  
**Roles:** ADMIN, OPS, INSTRUCTOR

**Query Parameters:**
- `activeOnly` (optional): If "true", only return active items

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/compliance/items?activeOnly=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 4.3 Create Compliance Record

**Endpoint:** `POST /api/compliance/records`  
**Roles:** ADMIN, OPS, INSTRUCTOR

**Request Body:**
```json
{
  "itemId": "item-uuid",
  "status": "PASS",
  "remarks": "All checks completed successfully",
  "linkedSortieId": "sortie-uuid",
  "linkedAircraftId": "aircraft-uuid"
}
```

**Status Values:** PASS, FAIL, N/A

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/compliance/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -d '{
    "itemId": "item-uuid",
    "status": "PASS",
    "remarks": "All checks completed successfully",
    "linkedSortieId": "sortie-uuid"
  }'
```

---

### 4.4 List Compliance Records

**Endpoint:** `GET /api/compliance/records`  
**Roles:** ADMIN, OPS, INSTRUCTOR

**Query Parameters:**
- `category` (optional): Filter by category
- `from` (optional): Filter from date
- `to` (optional): Filter to date

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/compliance/records?category=SAFETY&from=2025-01-01&to=2025-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 4.5 Create Incident

**Endpoint:** `POST /api/compliance/incidents`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**Request Body:**
```json
{
  "severity": "HIGH",
  "summary": "Runway incursion during taxi",
  "details": "Aircraft VT-ABC entered active runway without clearance",
  "occurredAt": "2025-01-20T14:30:00.000Z",
  "linkedSortieId": "sortie-uuid",
  "linkedAircraftId": "aircraft-uuid"
}
```

**Severity Values:** LOW, MEDIUM, HIGH, CRITICAL

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/compliance/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "severity": "HIGH",
    "summary": "Runway incursion during taxi",
    "details": "Aircraft VT-ABC entered active runway without clearance",
    "occurredAt": "2025-01-20T14:30:00.000Z"
  }'
```

---

### 4.6 List Incidents

**Endpoint:** `GET /api/compliance/incidents`  
**Roles:** ADMIN, OPS, INSTRUCTOR

**Query Parameters:**
- `status` (optional): Filter by status (OPEN, INVESTIGATING, CLOSED)
- `severity` (optional): Filter by severity

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/compliance/incidents?status=OPEN&severity=HIGH" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### 4.7 Update Incident Status

**Endpoint:** `PATCH /api/compliance/incidents/:id/status`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "status": "INVESTIGATING"
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost:3000/api/compliance/incidents/INCIDENT_UUID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "INVESTIGATING"
  }'
```

---

## 5. Complete Testing Flow

### Step 1: Create Support Ticket

```bash
curl -X POST http://localhost:3000/api/support/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -d '{
    "category": "TECHNICAL",
    "subject": "Aircraft issue",
    "description": "Radio not working"
  }'
```

Save the `id` as `TICKET_UUID`.

---

### Step 2: Add Message to Ticket

```bash
curl -X POST http://localhost:3000/api/support/tickets/TICKET_UUID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "message": "Maintenance notified, will fix by EOD"
  }'
```

---

### Step 3: Create Messaging Thread

```bash
curl -X POST http://localhost:3000/api/messaging/threads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "SORTIE",
    "title": "Flight briefing",
    "sortieId": "SORTIE_UUID"
  }'
```

Save the `id` as `THREAD_UUID`.

---

### Step 4: Add Message to Thread

```bash
curl -X POST http://localhost:3000/api/messaging/threads/THREAD_UUID/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "body": "Weather looks good, all systems go"
  }'
```

**Expected:** Maverick sync event created if thread is linked to sortie and student.

---

### Step 5: Check Maverick Events

```bash
curl -X GET "http://localhost:3000/api/maverick/events?status=PENDING" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Step 6: Create Compliance Item

```bash
curl -X POST http://localhost:3000/api/compliance/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code": "DGCA-CFI-001",
    "title": "Pre-flight inspection",
    "category": "SAFETY",
    "frequency": "PER_FLIGHT"
  }'
```

Save the `id` as `ITEM_UUID`.

---

### Step 7: Create Compliance Record

```bash
curl -X POST http://localhost:3000/api/compliance/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -d '{
    "itemId": "ITEM_UUID",
    "status": "PASS",
    "remarks": "All checks OK",
    "linkedSortieId": "SORTIE_UUID"
  }'
```

---

### Step 8: Create Incident

```bash
curl -X POST http://localhost:3000/api/compliance/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "severity": "MEDIUM",
    "summary": "Minor taxiway deviation",
    "details": "Aircraft slightly deviated from centerline",
    "occurredAt": "2025-01-20T15:00:00.000Z"
  }'
```

---

## 6. Test Cases

### Test Case 1: Ticket Participant Access

1. User A creates a ticket
2. User B (not involved) tries to add a message
3. **Expected:** 403 Forbidden

---

### Test Case 2: Maverick Sync on Sortie Creation

1. Create a sortie
2. Check Maverick events
3. **Expected:** Event with `eventType: 'SORTIE_SCHEDULED'` and `status: 'PENDING'`

---

### Test Case 3: Maverick Sync on Message Creation

1. Create a thread with type='SORTIE' linked to a sortie and student
2. Add a message to the thread
3. Check Maverick events
4. **Expected:** Event with `eventType: 'MESSAGE_CREATED'`

---

### Test Case 4: Compliance Item Duplicate Code

1. Create item with code "DGCA-CFI-001"
2. Try to create another item with same code
3. **Expected:** Error (duplicate code)

---

### Test Case 5: Student Can Create Incidents

1. As STUDENT, create an incident
2. **Expected:** 201 Created

---

## 7. Notes

- Support tickets: Only participants (creator, assignee, message senders) can add messages
- Messaging threads: Automatically create Maverick sync events for SORTIE-type threads with students
- Maverick sync: Events are created automatically when sorties are created/updated/cancelled
- Compliance: Items have unique codes per tenant
- All queries are tenant-scoped
- Maverick events are polled by the Maverick app and acknowledged when processed

---

## End of Phase 8 Testing Guide

