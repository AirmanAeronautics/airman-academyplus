# Phase 1: Auth, Tenancy & Roles Testing Guide

## 1. Configuration

### Environment Variables

Create or update `.env` file in `apps/skynet-plus-api/`:

```bash
DATABASE_URL=postgresql://airman:airman@localhost:5432/airman
JWT_SECRET=skynet-plus-dgca-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000
CORS_ORIGIN=http://localhost:8080
```

**Note:** `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, and `CORS_ORIGIN` have defaults, but `DATABASE_URL` is required.

## 2. Start the API

```bash
cd apps/skynet-plus-api
npm run start:dev
```

The API will start on `http://localhost:3000` with global prefix `/api`.

## 3. Auth Endpoints & Testing

### 3.1 POST /api/auth/register-tenant

**Purpose:** Register a new tenant and create the first admin user.

**Request Body:**
```json
{
  "tenantName": "Demo Flight Academy",
  "regulatoryFrameworkCode": "DGCA",
  "timezone": "Asia/Kolkata",
  "adminEmail": "admin@demo.com",
  "adminPassword": "SecurePass123!",
  "adminFullName": "Admin User"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Demo Flight Academy",
    "regulatoryFrameworkCode": "DGCA",
    "timezone": "Asia/Kolkata",
    "adminEmail": "admin@demo.com",
    "adminPassword": "SecurePass123!",
    "adminFullName": "Admin User"
  }'
```

**Expected Response (201 Created):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "admin@demo.com",
    "fullName": "Admin User",
    "role": "ADMIN",
    "tenantId": "uuid-here"
  }
}
```

**JWT Payload (decode the accessToken):**
```json
{
  "sub": "user-uuid",
  "tenantId": "tenant-uuid",
  "role": "ADMIN",
  "fullName": "Admin User",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

### 3.2 POST /api/auth/login

**Purpose:** Login with existing user credentials.

**Request Body:**
```json
{
  "email": "admin@demo.com",
  "password": "SecurePass123!"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "SecurePass123!"
  }'
```

**Expected Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "admin@demo.com",
    "fullName": "Admin User",
    "role": "ADMIN",
    "tenantId": "uuid-here"
  }
}
```

---

### 3.3 POST /api/auth/refresh

**Purpose:** Refresh an access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Command:**
```bash
# Replace YOUR_REFRESH_TOKEN with the actual refresh token from login/register
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Expected Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 4. Protected Endpoints & Multi-Tenancy Verification

### 4.1 GET /api/auth/me

**Purpose:** Get current authenticated user info (requires any authenticated user).

**cURL Command (with token):**
```bash
# Replace YOUR_ACCESS_TOKEN with the actual access token
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "id": "uuid-here",
  "email": "admin@demo.com",
  "fullName": "Admin User",
  "role": "ADMIN",
  "tenantId": "uuid-here"
}
```

**cURL Command (without token - should fail):**
```bash
curl -X GET http://localhost:3000/api/auth/me
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

---

### 4.2 GET /api/admin/test

**Purpose:** Test endpoint that requires ADMIN role.

**cURL Command (with ADMIN token):**
```bash
# Replace YOUR_ACCESS_TOKEN with an ADMIN user's access token
curl -X GET http://localhost:3000/api/admin/test \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "message": "Admin endpoint accessed successfully",
  "user": {
    "id": "uuid-here",
    "email": "admin@demo.com",
    "fullName": "Admin User",
    "role": "ADMIN",
    "tenantId": "uuid-here"
  },
  "timestamp": "2025-01-14T10:30:00.000Z"
}
```

**cURL Command (without token - should fail):**
```bash
curl -X GET http://localhost:3000/api/admin/test
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

**cURL Command (with non-ADMIN token - should fail):**
```bash
# If you have a STUDENT/INSTRUCTOR/OPS token, this should return 403
curl -X GET http://localhost:3000/api/admin/test \
  -H "Authorization: Bearer NON_ADMIN_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "statusCode": 403,
  "message": "Required role: ADMIN"
}
```

---

## 5. Complete Test Flow

### Step 1: Register Tenant + Admin
```bash
curl -X POST http://localhost:3000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Demo Flight Academy",
    "regulatoryFrameworkCode": "DGCA",
    "timezone": "Asia/Kolkata",
    "adminEmail": "admin@demo.com",
    "adminPassword": "SecurePass123!",
    "adminFullName": "Admin User"
  }' | jq
```

**Save the `accessToken` from the response.**

### Step 2: Test Protected Endpoint (GET /api/auth/me)
```bash
# Replace YOUR_ACCESS_TOKEN with the token from Step 1
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" | jq
```

### Step 3: Test Admin-Only Endpoint (GET /api/admin/test)
```bash
# Replace YOUR_ACCESS_TOKEN with the token from Step 1
curl -X GET http://localhost:3000/api/admin/test \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" | jq
```

### Step 4: Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "SecurePass123!"
  }' | jq
```

---

## 6. JWT Payload Verification

To verify the JWT payload contains `sub`, `tenantId`, `role`, and `fullName`, you can:

1. **Use jwt.io:** Copy the accessToken and paste it at https://jwt.io
2. **Use command line (if you have `jq` and `base64`):**
   ```bash
   # Extract payload (middle part of JWT)
   echo "YOUR_ACCESS_TOKEN" | cut -d. -f2 | base64 -d | jq
   ```

The decoded payload should look like:
```json
{
  "sub": "user-uuid",
  "tenantId": "tenant-uuid",
  "role": "ADMIN",
  "fullName": "Admin User",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## 7. Summary

### Files Changed/Added:
- ✅ `apps/skynet-plus-api/src/modules/auth/dto/refresh-token.dto.ts` (new)
- ✅ `apps/skynet-plus-api/src/modules/auth/auth.controller.ts` (added GET /me endpoint)
- ✅ `apps/skynet-plus-api/src/modules/admin/admin.controller.ts` (new)
- ✅ `apps/skynet-plus-api/src/modules/admin/admin.module.ts` (new)
- ✅ `apps/skynet-plus-api/src/app.module.ts` (added AdminModule)

### Endpoints:
- ✅ `POST /api/auth/register-tenant` (existing, verified)
- ✅ `POST /api/auth/login` (existing, verified)
- ✅ `POST /api/auth/refresh` (existing, improved with DTO)
- ✅ `GET /api/auth/me` (new - requires authentication)
- ✅ `GET /api/admin/test` (new - requires ADMIN role)

### Quick Test Commands:

**1. Register tenant + admin:**
```bash
curl -X POST http://localhost:3000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{"tenantName":"Demo Academy","regulatoryFrameworkCode":"DGCA","timezone":"Asia/Kolkata","adminEmail":"admin@demo.com","adminPassword":"SecurePass123!","adminFullName":"Admin User"}'
```

**2. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demo.com","password":"SecurePass123!"}'
```

**3. Call protected endpoint (replace TOKEN):**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

**4. Call admin endpoint (replace TOKEN):**
```bash
curl -X GET http://localhost:3000/api/admin/test \
  -H "Authorization: Bearer TOKEN"
```

