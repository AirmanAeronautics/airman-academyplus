# Phase 6: CRM & Marketing Testing Guide

## Overview

This guide covers testing the CRM module:
- **Leads** - Lead management with stages and activities
- **Campaigns** - Marketing campaign tracking
- **Activities** - Activity logging for leads

All endpoints are multi-tenant and role-aware.

---

## Prerequisites

1. **Database Migration**: Ensure the CRM tables are created:
   ```bash
   cd apps/skynet-plus-api
   psql "$DATABASE_URL" -f db/migrations/2025_11_16_0006_marketing_crm.sql
   ```

2. **Auth Tokens**: You'll need valid JWT tokens for:
   - ADMIN user (for all CRM operations)
   - OPS user (for all CRM operations)
   - INSTRUCTOR user (for viewing leads)

3. **Existing Data**: From previous phases, you should have:
   - At least one user (for assigning leads)

---

## 1. Leads Management

### 1.1 Create Lead

**Endpoint:** `POST /api/crm/leads`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+91 9876543210",
  "source": "Website",
  "stage": "NEW",
  "assignedToUserId": "user-uuid",
  "notes": "Interested in PPL course"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/crm/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+91 9876543210",
    "source": "Website",
    "stage": "NEW",
    "notes": "Interested in PPL course"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "lead-uuid",
  "tenantId": "tenant-uuid",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+91 9876543210",
  "source": "Website",
  "stage": "NEW",
  "assignedToUserId": "user-uuid",
  "notes": "Interested in PPL course",
  "createdAt": "2025-01-20T10:00:00.000Z",
  "updatedAt": "2025-01-20T10:00:00.000Z"
}
```

**Error Cases:**
- **409 Conflict**: If email already exists (when email is provided)

---

### 1.2 List Leads

**Endpoint:** `GET /api/crm/leads`  
**Roles:** ADMIN, OPS, INSTRUCTOR

**Query Parameters:**
- `stage` (optional): Filter by stage (NEW, CONTACTED, SCHEDULED_DEMO, APPLIED, ENROLLED, LOST)
- `source` (optional): Filter by source
- `assignedToUserId` (optional): Filter by assigned user
- `search` (optional): Search in full_name, email, phone

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/crm/leads?stage=NEW&source=Website" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "lead-uuid-1",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "source": "Website",
    "stage": "NEW",
    ...
  },
  {
    "id": "lead-uuid-2",
    "fullName": "Jane Smith",
    "email": "jane.smith@example.com",
    "source": "Website",
    "stage": "NEW",
    ...
  }
]
```

---

### 1.3 Get Lead by ID

**Endpoint:** `GET /api/crm/leads/:id`  
**Roles:** ADMIN, OPS

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/crm/leads/LEAD_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "id": "lead-uuid",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+91 9876543210",
  "source": "Website",
  "stage": "NEW",
  "assignedToUserId": "user-uuid",
  "notes": "Interested in PPL course",
  ...
}
```

---

### 1.4 Update Lead

**Endpoint:** `PATCH /api/crm/leads/:id`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "stage": "CONTACTED",
  "notes": "Called on 2025-01-20, interested in demo"
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost:3000/api/crm/leads/LEAD_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "stage": "CONTACTED",
    "notes": "Called on 2025-01-20, interested in demo"
  }'
```

**Expected Response (200 OK):**
```json
{
  "id": "lead-uuid",
  "stage": "CONTACTED",
  "notes": "Called on 2025-01-20, interested in demo",
  ...
}
```

---

## 2. Activities

### 2.1 Create Activity

**Endpoint:** `POST /api/crm/leads/:id/activities`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "type": "CALL",
  "subject": "Initial contact call",
  "details": "Discussed PPL course options, scheduled demo for next week",
  "performedAt": "2025-01-20T14:30:00.000Z"
}
```

**Activity Types:** CALL, WHATSAPP, EMAIL, MEETING, VISIT

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/crm/leads/LEAD_UUID/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "CALL",
    "subject": "Initial contact call",
    "details": "Discussed PPL course options, scheduled demo for next week"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "activity-uuid",
  "tenantId": "tenant-uuid",
  "leadId": "lead-uuid",
  "type": "CALL",
  "subject": "Initial contact call",
  "details": "Discussed PPL course options, scheduled demo for next week",
  "performedByUserId": "user-uuid",
  "performedAt": "2025-01-20T14:30:00.000Z"
}
```

---

### 2.2 List Activities

**Endpoint:** `GET /api/crm/leads/:id/activities`  
**Roles:** ADMIN, OPS

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/crm/leads/LEAD_UUID/activities \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "activity-uuid-1",
    "type": "CALL",
    "subject": "Initial contact call",
    "performedAt": "2025-01-20T14:30:00.000Z",
    ...
  },
  {
    "id": "activity-uuid-2",
    "type": "EMAIL",
    "subject": "Sent course brochure",
    "performedAt": "2025-01-19T10:00:00.000Z",
    ...
  }
]
```

**Note:** Activities are ordered by `performedAt` descending (most recent first).

---

## 3. Campaigns

### 3.1 Create Campaign

**Endpoint:** `POST /api/crm/campaigns`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "name": "Summer 2025 Google Ads",
  "channel": "GOOGLE_ADS",
  "budget": 50000.00,
  "startDate": "2025-06-01",
  "endDate": "2025-08-31",
  "status": "PLANNED"
}
```

**Channel Types:** GOOGLE_ADS, SOCIAL, FAIR, REFERRAL, OTHER  
**Status Types:** PLANNED, ACTIVE, PAUSED, COMPLETED

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/crm/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Summer 2025 Google Ads",
    "channel": "GOOGLE_ADS",
    "budget": 50000.00,
    "startDate": "2025-06-01",
    "endDate": "2025-08-31",
    "status": "PLANNED"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "campaign-uuid",
  "tenantId": "tenant-uuid",
  "name": "Summer 2025 Google Ads",
  "channel": "GOOGLE_ADS",
  "budget": 50000.00,
  "startDate": "2025-06-01",
  "endDate": "2025-08-31",
  "status": "PLANNED",
  "createdAt": "2025-01-20T10:00:00.000Z",
  "updatedAt": "2025-01-20T10:00:00.000Z"
}
```

---

### 3.2 List Campaigns

**Endpoint:** `GET /api/crm/campaigns`  
**Roles:** ADMIN, OPS

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/crm/campaigns \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "campaign-uuid-1",
    "name": "Summer 2025 Google Ads",
    "channel": "GOOGLE_ADS",
    "status": "ACTIVE",
    ...
  },
  {
    "id": "campaign-uuid-2",
    "name": "Instagram Campaign Q1",
    "channel": "SOCIAL",
    "status": "COMPLETED",
    ...
  }
]
```

---

### 3.3 Update Campaign

**Endpoint:** `PATCH /api/crm/campaigns/:id`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "status": "ACTIVE",
  "budget": 60000.00
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost:3000/api/crm/campaigns/CAMPAIGN_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "ACTIVE",
    "budget": 60000.00
  }'
```

---

### 3.4 Attach Lead to Campaign

**Endpoint:** `POST /api/crm/campaigns/:id/attach-lead/:leadId`  
**Roles:** ADMIN, OPS

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/crm/campaigns/CAMPAIGN_UUID/attach-lead/LEAD_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "message": "Lead attached to campaign successfully"
}
```

---

## 4. Complete Testing Flow

### Step 1: Create a Lead

```bash
curl -X POST http://localhost:3000/api/crm/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+91 9876543210",
    "source": "Website",
    "stage": "NEW"
  }'
```

Save the `id` from response as `LEAD_UUID`.

---

### Step 2: Create an Activity

```bash
curl -X POST http://localhost:3000/api/crm/leads/LEAD_UUID/activities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "type": "CALL",
    "subject": "Initial contact",
    "details": "Discussed course options"
  }'
```

---

### Step 3: Update Lead Stage

```bash
curl -X PATCH http://localhost:3000/api/crm/leads/LEAD_UUID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "stage": "CONTACTED"
  }'
```

---

### Step 4: Create a Campaign

```bash
curl -X POST http://localhost:3000/api/crm/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Website Campaign 2025",
    "channel": "GOOGLE_ADS",
    "budget": 50000.00,
    "status": "ACTIVE"
  }'
```

Save the `id` as `CAMPAIGN_UUID`.

---

### Step 5: Attach Lead to Campaign

```bash
curl -X POST http://localhost:3000/api/crm/campaigns/CAMPAIGN_UUID/attach-lead/LEAD_UUID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 5. Test Cases

### Test Case 1: Duplicate Email

1. Create a lead with email "test@example.com"
2. Try to create another lead with the same email
3. **Expected:** 409 Conflict error

---

### Test Case 2: Search Functionality

1. Create multiple leads with different names
2. Search with `?search=John`
3. **Expected:** Only leads matching "John" in name, email, or phone

---

### Test Case 3: Filter by Stage

1. Create leads with different stages
2. Filter with `?stage=NEW`
3. **Expected:** Only leads with stage "NEW"

---

### Test Case 4: Update Lead Email Conflict

1. Create lead A with email "a@example.com"
2. Create lead B with email "b@example.com"
3. Try to update lead B's email to "a@example.com"
4. **Expected:** 409 Conflict error

---

## 6. Notes

- Email uniqueness is enforced per tenant (nullable emails are allowed)
- Activities are automatically timestamped if `performedAt` is not provided
- Lead-campaign relationships are many-to-many (one lead can be in multiple campaigns)
- All queries are tenant-scoped

---

## End of Phase 6 Testing Guide

