# Phase 7: Finance (Billing & Operations) Testing Guide

## Overview

This guide covers testing the Finance module:
- **Fee Plans** - Fee structure definitions
- **Invoices** - Invoice management with auto-generated invoice numbers
- **Payments** - Payment recording and tracking
- **Expenses** - Expense tracking by category
- **Summary** - Financial summary and reporting

All endpoints are multi-tenant and role-aware.

---

## Prerequisites

1. **Database Migration**: Ensure the Finance tables are created:
   ```bash
   cd apps/skynet-plus-api
   psql "$DATABASE_URL" -f db/migrations/2025_11_16_0007_finance.sql
   ```

2. **Auth Tokens**: You'll need valid JWT tokens for:
   - ADMIN user (for all finance operations)
   - OPS user (for all finance operations)
   - STUDENT user (for viewing own invoices and payments)

3. **Existing Data**: From previous phases, you should have:
   - At least one student profile (for creating invoices)
   - Optional: training program (for linking fee plans)

---

## 1. Fee Plans

### 1.1 Create Fee Plan

**Endpoint:** `POST /api/finance/fee-plans`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "name": "PPL Course Fee",
  "programId": "program-uuid",
  "currency": "INR",
  "amount": 500000.00,
  "billingType": "ONE_TIME"
}
```

**Billing Types:** ONE_TIME, PER_HOUR, PER_SORTIE, PER_MONTH

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/finance/fee-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "PPL Course Fee",
    "currency": "INR",
    "amount": 500000.00,
    "billingType": "ONE_TIME"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "fee-plan-uuid",
  "tenantId": "tenant-uuid",
  "name": "PPL Course Fee",
  "programId": null,
  "currency": "INR",
  "amount": 500000.00,
  "billingType": "ONE_TIME",
  "createdAt": "2025-01-20T10:00:00.000Z",
  "updatedAt": "2025-01-20T10:00:00.000Z"
}
```

---

### 1.2 List Fee Plans

**Endpoint:** `GET /api/finance/fee-plans`  
**Roles:** ADMIN, OPS

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/finance/fee-plans \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 2. Invoices

### 2.1 Create Invoice

**Endpoint:** `POST /api/finance/invoices`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "studentProfileId": "student-profile-uuid",
  "feePlanId": "fee-plan-uuid",
  "issueDate": "2025-01-20",
  "dueDate": "2025-02-20",
  "currency": "INR",
  "amount": 500000.00,
  "notes": "PPL course enrollment fee"
}
```

**Note:** Invoice number is auto-generated in format `INV-YYYY-XXX` if not provided.

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/finance/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "studentProfileId": "student-profile-uuid",
    "issueDate": "2025-01-20",
    "dueDate": "2025-02-20",
    "amount": 500000.00,
    "notes": "PPL course enrollment fee"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "invoice-uuid",
  "tenantId": "tenant-uuid",
  "studentProfileId": "student-profile-uuid",
  "invoiceNumber": "INV-2025-001",
  "issueDate": "2025-01-20",
  "dueDate": "2025-02-20",
  "currency": "INR",
  "amount": 500000.00,
  "status": "DRAFT",
  "notes": "PPL course enrollment fee",
  ...
}
```

---

### 2.2 List Invoices

**Endpoint:** `GET /api/finance/invoices`  
**Roles:** ADMIN, OPS, STUDENT

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, ISSUED, PAID, PARTIAL, VOID)
- `studentProfileId` (optional): Filter by student
- `from` (optional): Filter from date
- `to` (optional): Filter to date

**Note:** STUDENT users can only see their own invoices.

**cURL Command (as ADMIN/OPS):**
```bash
curl -X GET "http://localhost:3000/api/finance/invoices?status=ISSUED" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**cURL Command (as STUDENT):**
```bash
curl -X GET http://localhost:3000/api/finance/invoices \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

---

### 2.3 Get Invoice by ID

**Endpoint:** `GET /api/finance/invoices/:id`  
**Roles:** ADMIN, OPS, STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/finance/invoices/INVOICE_UUID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Note:** STUDENT users can only access their own invoices (403 if trying to access another student's invoice).

---

### 2.4 Update Invoice Status

**Endpoint:** `PATCH /api/finance/invoices/:id/status`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "status": "ISSUED"
}
```

**cURL Command:**
```bash
curl -X PATCH http://localhost:3000/api/finance/invoices/INVOICE_UUID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "status": "ISSUED"
  }'
```

---

## 3. Payments

### 3.1 Record Payment

**Endpoint:** `POST /api/finance/invoices/:id/payments`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "paymentDate": "2025-01-25",
  "amount": 250000.00,
  "method": "BANK_TRANSFER",
  "reference": "TXN123456789"
}
```

**Payment Methods:** CASH, CARD, BANK_TRANSFER, UPI, OTHER

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/finance/invoices/INVOICE_UUID/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "paymentDate": "2025-01-25",
    "amount": 250000.00,
    "method": "BANK_TRANSFER",
    "reference": "TXN123456789"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "payment-uuid",
  "tenantId": "tenant-uuid",
  "invoiceId": "invoice-uuid",
  "paymentDate": "2025-01-25",
  "amount": 250000.00,
  "method": "BANK_TRANSFER",
  "reference": "TXN123456789",
  "createdAt": "2025-01-25T10:00:00.000Z"
}
```

**Note:** Invoice status is automatically updated:
- If total payments >= invoice amount → status becomes `PAID`
- If total payments > 0 but < invoice amount → status becomes `PARTIAL`

---

### 3.2 List Payments

**Endpoint:** `GET /api/finance/invoices/:id/payments`  
**Roles:** ADMIN, OPS, STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/finance/invoices/INVOICE_UUID/payments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Note:** STUDENT users can only see payments for their own invoices.

---

## 4. Expenses

### 4.1 Create Expense

**Endpoint:** `POST /api/finance/expenses`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "category": "FUEL",
  "amount": 50000.00,
  "currency": "INR",
  "incurredOn": "2025-01-20",
  "notes": "Monthly fuel purchase"
}
```

**Categories:** FUEL, MAINTENANCE, SALARY, RENT, OTHER

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/finance/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "category": "FUEL",
    "amount": 50000.00,
    "currency": "INR",
    "incurredOn": "2025-01-20",
    "notes": "Monthly fuel purchase"
  }'
```

---

### 4.2 List Expenses

**Endpoint:** `GET /api/finance/expenses`  
**Roles:** ADMIN, OPS

**Query Parameters:**
- `category` (optional): Filter by category
- `from` (optional): Filter from date
- `to` (optional): Filter to date

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/finance/expenses?category=FUEL&from=2025-01-01&to=2025-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 5. Financial Summary

### 5.1 Get Summary

**Endpoint:** `GET /api/finance/summary?from=YYYY-MM-DD&to=YYYY-MM-DD`  
**Roles:** ADMIN, OPS

**cURL Command:**
```bash
curl -X GET "http://localhost:3000/api/finance/summary?from=2025-01-01&to=2025-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "totalRevenue": 1500000.00,
  "totalOutstanding": 500000.00,
  "totalPaid": 1000000.00,
  "totalExpenses": 200000.00,
  "netProfit": 1300000.00,
  "expensesByCategory": {
    "FUEL": 80000.00,
    "MAINTENANCE": 50000.00,
    "SALARY": 50000.00,
    "RENT": 20000.00
  }
}
```

**Metrics Explained:**
- **totalRevenue**: Sum of amounts from invoices with status PAID or PARTIAL
- **totalOutstanding**: Sum of (invoice amount - total payments) for ISSUED/PARTIAL invoices
- **totalPaid**: Sum of all payments in date range
- **totalExpenses**: Sum of all expenses in date range
- **netProfit**: totalRevenue - totalExpenses
- **expensesByCategory**: Expenses grouped by category

---

## 6. Complete Testing Flow

### Step 1: Create Fee Plan

```bash
curl -X POST http://localhost:3000/api/finance/fee-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "PPL Course Fee",
    "amount": 500000.00,
    "billingType": "ONE_TIME"
  }'
```

---

### Step 2: Create Invoice

```bash
curl -X POST http://localhost:3000/api/finance/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "studentProfileId": "student-profile-uuid",
    "issueDate": "2025-01-20",
    "dueDate": "2025-02-20",
    "amount": 500000.00
  }'
```

Save the `invoiceNumber` and `id` from response.

---

### Step 3: Update Invoice Status to ISSUED

```bash
curl -X PATCH http://localhost:3000/api/finance/invoices/INVOICE_UUID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"status": "ISSUED"}'
```

---

### Step 4: Record Partial Payment

```bash
curl -X POST http://localhost:3000/api/finance/invoices/INVOICE_UUID/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "paymentDate": "2025-01-25",
    "amount": 250000.00,
    "method": "BANK_TRANSFER",
    "reference": "TXN123456"
  }'
```

**Expected:** Invoice status automatically changes to `PARTIAL`.

---

### Step 5: Record Remaining Payment

```bash
curl -X POST http://localhost:3000/api/finance/invoices/INVOICE_UUID/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "paymentDate": "2025-02-10",
    "amount": 250000.00,
    "method": "UPI",
    "reference": "UPI789012"
  }'
```

**Expected:** Invoice status automatically changes to `PAID`.

---

### Step 6: Create Expenses

```bash
curl -X POST http://localhost:3000/api/finance/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "category": "FUEL",
    "amount": 50000.00,
    "incurredOn": "2025-01-20"
  }'
```

---

### Step 7: Get Financial Summary

```bash
curl -X GET "http://localhost:3000/api/finance/summary?from=2025-01-01&to=2025-01-31" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 7. Test Cases

### Test Case 1: Auto Invoice Number Generation

1. Create invoice without `invoiceNumber`
2. **Expected:** Auto-generated number in format `INV-YYYY-001`
3. Create another invoice
4. **Expected:** Next number `INV-YYYY-002`

---

### Test Case 2: Payment Updates Invoice Status

1. Create invoice with amount 1000
2. Record payment of 500
3. **Expected:** Invoice status = `PARTIAL`
4. Record payment of 500
5. **Expected:** Invoice status = `PAID`

---

### Test Case 3: Student Access Control

1. As STUDENT, try to access another student's invoice
2. **Expected:** 403 Forbidden

---

### Test Case 4: Void Invoice Payment

1. Create invoice and set status to `VOID`
2. Try to record payment
3. **Expected:** 403 Forbidden (cannot pay voided invoice)

---

## 8. Notes

- Invoice numbers are auto-generated per tenant per year (format: `INV-YYYY-XXX`)
- Invoice status is automatically updated when payments are recorded
- Students can only view their own invoices and payments
- All financial calculations are tenant-scoped
- Summary includes revenue, outstanding, expenses, and net profit

---

## End of Phase 7 Testing Guide

