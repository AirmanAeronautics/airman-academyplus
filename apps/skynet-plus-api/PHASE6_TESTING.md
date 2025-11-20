# Phase 6 - CRM & Marketing Module Testing Guide

## Overview

This guide provides testing instructions for the enhanced CRM & Marketing module, including:
- **Marketing Sources** - Track and manage marketing channels
- **Lead Assignments** - History tracking for lead assignments
- **Enhanced Leads** - Now includes marketing source references

## Prerequisites

1. Database migration applied:
   ```bash
   psql "$DATABASE_URL" -f db/migrations/2025_11_16_0006a_marketing_sources_assignments.sql
   ```

2. Valid JWT token for a tenant with ADMIN or OPS role
3. API base URL: `http://localhost:3000/api`

## Test Data Setup

### 1. Create Test Users

```bash
# Create an OPS user (if not exists)
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ops@test.com",
    "password": "password123",
    "fullName": "Ops User",
    "role": "OPS"
  }'
```

### 2. Create Marketing Sources

```bash
# Create Digital Marketing Source
curl -X POST http://localhost:3000/api/crm/marketing-sources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Google Ads",
    "description": "Google Search and Display Ads",
    "category": "DIGITAL",
    "costPerLead": 25.50,
    "isActive": true
  }'

# Create Social Media Source
curl -X POST http://localhost:3000/api/crm/marketing-sources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Instagram",
    "description": "Instagram organic and paid posts",
    "category": "SOCIAL",
    "costPerLead": 15.00,
    "isActive": true
  }'

# Create Referral Source
curl -X POST http://localhost:3000/api/crm/marketing-sources \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Student Referral",
    "description": "Referrals from existing students",
    "category": "REFERRAL",
    "costPerLead": 0.00,
    "isActive": true
  }'
```

Save the returned IDs for use in lead creation.

## API Endpoint Tests

### Marketing Sources

#### 1. List All Marketing Sources

```bash
curl -X GET "http://localhost:3000/api/crm/marketing-sources" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:** Array of marketing sources

#### 2. List Active Marketing Sources Only

```bash
curl -X GET "http://localhost:3000/api/crm/marketing-sources?isActive=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 3. List by Category

```bash
curl -X GET "http://localhost:3000/api/crm/marketing-sources?category=DIGITAL" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Get Marketing Source by ID

```bash
curl -X GET "http://localhost:3000/api/crm/marketing-sources/{SOURCE_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. Update Marketing Source

```bash
curl -X PATCH http://localhost:3000/api/crm/marketing-sources/{SOURCE_ID} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "costPerLead": 30.00,
    "isActive": false
  }'
```

### Leads with Marketing Sources

#### 1. Create Lead with Marketing Source

```bash
curl -X POST http://localhost:3000/api/crm/leads \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "source": "Google Ads",
    "marketingSourceId": "{GOOGLE_ADS_SOURCE_ID}",
    "stage": "NEW",
    "notes": "Interested in PPL course"
  }'
```

**Note:** `marketingSourceId` is optional. If provided, it must reference an existing marketing source.

#### 2. Update Lead Marketing Source

```bash
curl -X PATCH http://localhost:3000/api/crm/leads/{LEAD_ID} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "marketingSourceId": "{INSTAGRAM_SOURCE_ID}"
  }'
```

#### 3. Get Lead (should include marketingSourceId)

```bash
curl -X GET "http://localhost:3000/api/crm/leads/{LEAD_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:** Lead object with `marketingSourceId` field

### Lead Assignments

#### 1. Create Lead Assignment

```bash
curl -X POST http://localhost:3000/api/crm/leads/{LEAD_ID}/assignments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedToUserId": "{USER_ID}",
    "reason": "Initial assignment to sales team"
  }'
```

**Expected:** Assignment record with:
- `assignedToUserId`
- `assignedByUserId` (current user)
- `previousAssignedToUserId` (if lead was previously assigned)
- `assignedAt`
- `isActive: true`

#### 2. List All Assignments for a Lead

```bash
curl -X GET "http://localhost:3000/api/crm/leads/{LEAD_ID}/assignments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected:** Array of all assignment records (active and inactive)

#### 3. List Active Assignments Only

```bash
curl -X GET "http://localhost:3000/api/crm/leads/{LEAD_ID}/assignments?isActive=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Get Active Assignment

```bash
curl -X GET "http://localhost:3000/api/crm/leads/{LEAD_ID}/assignments/active" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. Reassign Lead (Creates New Assignment)

```bash
curl -X POST http://localhost:3000/api/crm/leads/{LEAD_ID}/assignments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedToUserId": "{NEW_USER_ID}",
    "reason": "Reassigned due to workload"
  }'
```

**Expected Behavior:**
- Previous assignment is automatically deactivated
- New assignment is created with `previousAssignedToUserId` set
- Lead's `assignedToUserId` is updated

#### 6. Unassign Lead

```bash
curl -X POST "http://localhost:3000/api/crm/leads/{LEAD_ID}/assignments/{ASSIGNMENT_ID}/unassign" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Behavior:**
- Assignment is deactivated (`isActive: false`, `unassignedAt` set)
- Lead's `assignedToUserId` is set to `null`

## Integration Test Scenarios

### Scenario 1: Complete Lead Lifecycle

1. Create marketing source
2. Create lead with marketing source
3. Assign lead to user
4. Create activity on lead
5. Reassign lead to different user
6. Update lead stage
7. Unassign lead
8. Verify assignment history

### Scenario 2: Marketing Source Analytics

1. Create multiple marketing sources
2. Create leads from different sources
3. List leads by marketing source
4. Calculate cost per lead for each source

### Scenario 3: Assignment History Tracking

1. Create lead
2. Assign to User A
3. Reassign to User B
4. Reassign to User C
5. Unassign
6. Verify all assignment records exist with correct `previousAssignedToUserId` chain

## Error Cases to Test

### Marketing Sources

1. **Duplicate Name:** Try creating two sources with the same name
   - Expected: `409 Conflict` - "Marketing source with name 'X' already exists"

2. **Invalid Category:** Try creating source with invalid category
   - Expected: `400 Bad Request` - Validation error

3. **Non-existent Source:** Try referencing non-existent source in lead
   - Expected: `404 Not Found` - "Marketing source with id 'X' not found"

### Lead Assignments

1. **Non-existent Lead:** Try creating assignment for non-existent lead
   - Expected: `404 Not Found` - "Lead with id 'X' not found"

2. **Non-existent User:** Try assigning to non-existent user
   - Expected: `404 Not Found` - "User with id 'X' not found"

3. **Non-existent Assignment:** Try unassigning non-existent assignment
   - Expected: `404 Not Found` - "Active assignment with id 'X' not found"

## Database Verification

### Check Marketing Sources

```sql
SELECT id, name, category, cost_per_lead, is_active
FROM marketing_sources
WHERE tenant_id = 'YOUR_TENANT_ID'
ORDER BY name;
```

### Check Lead Assignments

```sql
SELECT 
  l.full_name AS lead_name,
  a.assigned_to_user_id,
  a.assigned_by_user_id,
  a.previous_assigned_to_user_id,
  a.reason,
  a.assigned_at,
  a.is_active
FROM crm_lead_assignments a
JOIN crm_leads l ON a.lead_id = l.id
WHERE a.tenant_id = 'YOUR_TENANT_ID'
ORDER BY a.assigned_at DESC;
```

### Check Leads with Marketing Sources

```sql
SELECT 
  l.full_name,
  l.source,
  ms.name AS marketing_source_name,
  ms.category,
  ms.cost_per_lead
FROM crm_leads l
LEFT JOIN marketing_sources ms ON l.marketing_source_id = ms.id
WHERE l.tenant_id = 'YOUR_TENANT_ID'
ORDER BY l.created_at DESC;
```

## Performance Considerations

1. **Indexes:** Verify indexes are created:
   - `idx_marketing_sources_tenant_active`
   - `idx_crm_lead_assignments_tenant_lead`
   - `idx_crm_lead_assignments_tenant_active`

2. **Query Performance:** Test with large datasets (1000+ leads, 100+ assignments)

3. **Concurrent Assignments:** Test multiple users assigning leads simultaneously

## Notes

- All endpoints require authentication and tenant context
- Assignment history is automatically tracked via database trigger
- Marketing source references are optional for backward compatibility
- Assignment creation automatically updates the lead's `assignedToUserId` field

