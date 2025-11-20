# Phase 2: Training Domain Testing Guide

## Overview

This guide covers testing the Training Module endpoints for:
- Training Programs (PPL, CPL, IR, etc.)
- Training Lessons (syllabus items)
- Student Profiles
- Student Progress / Lesson Attempts

All endpoints are multi-tenant and role-aware.

---

## Prerequisites

1. **Database Migration**: Ensure the training tables are created:
   ```bash
   cd apps/skynet-plus-api
   psql "$DATABASE_URL" -f db/migrations/2025_11_16_0002_training_core.sql
   ```

2. **Auth Token**: You'll need valid JWT tokens for:
   - ADMIN user (for creating programs/lessons)
   - INSTRUCTOR user (for recording lesson attempts)
   - STUDENT user (for viewing own progress)

---

## 1. Training Programs

### 1.1 Create a Training Program

**Endpoint:** `POST /api/training/programs`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "code": "DGCA-PPL-2025",
  "name": "DGCA PPL Integrated",
  "regulatoryFrameworkCode": "DGCA",
  "category": "INTEGRATED",
  "isActive": true
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:3000/api/training/programs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code": "DGCA-PPL-2025",
    "name": "DGCA PPL Integrated",
    "regulatoryFrameworkCode": "DGCA",
    "category": "INTEGRATED",
    "isActive": true
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "uuid-here",
  "tenantId": "tenant-uuid",
  "code": "DGCA-PPL-2025",
  "name": "DGCA PPL Integrated",
  "regulatoryFrameworkCode": "DGCA",
  "category": "INTEGRATED",
  "isActive": true,
  "createdAt": "2025-01-14T10:00:00.000Z",
  "updatedAt": "2025-01-14T10:00:00.000Z"
}
```

**Error Cases:**
- **409 Conflict**: Program code already exists in tenant
- **403 Forbidden**: User doesn't have ADMIN/OPS role
- **401 Unauthorized**: Missing or invalid token

---

### 1.2 List All Programs

**Endpoint:** `GET /api/training/programs`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/training/programs \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "uuid-here",
    "tenantId": "tenant-uuid",
    "code": "DGCA-PPL-2025",
    "name": "DGCA PPL Integrated",
    "regulatoryFrameworkCode": "DGCA",
    "category": "INTEGRATED",
    "isActive": true,
    "createdAt": "2025-01-14T10:00:00.000Z",
    "updatedAt": "2025-01-14T10:00:00.000Z"
  }
]
```

---

## 2. Training Lessons

### 2.1 Create a Lesson

**Endpoint:** `POST /api/training/programs/:programId/lessons`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "code": "PPL-01",
  "name": "Principles of Flight",
  "lessonType": "GROUND",
  "sequenceOrder": 1,
  "durationMinutes": 90,
  "requirements": {
    "prerequisites": [],
    "weatherMinima": null
  }
}
```

**cURL Command:**
```bash
# Replace PROGRAM_ID with the program ID from step 1.1
curl -X POST http://localhost:3000/api/training/programs/PROGRAM_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code": "PPL-01",
    "name": "Principles of Flight",
    "lessonType": "GROUND",
    "sequenceOrder": 1,
    "durationMinutes": 90,
    "requirements": {
      "prerequisites": [],
      "weatherMinima": null
    }
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "lesson-uuid",
  "tenantId": "tenant-uuid",
  "programId": "program-uuid",
  "code": "PPL-01",
  "name": "Principles of Flight",
  "lessonType": "GROUND",
  "sequenceOrder": 1,
  "durationMinutes": 90,
  "requirements": {
    "prerequisites": [],
    "weatherMinima": null
  },
  "isActive": true,
  "createdAt": "2025-01-14T10:05:00.000Z",
  "updatedAt": "2025-01-14T10:05:00.000Z"
}
```

**Example: Flight Lesson:**
```json
{
  "code": "PPL-02",
  "name": "First Solo Flight",
  "lessonType": "FLIGHT",
  "sequenceOrder": 2,
  "durationMinutes": 60,
  "requirements": {
    "aircraftType": "C172",
    "weatherMinima": {
      "visibility": "5km",
      "cloudBase": "1000ft"
    },
    "prerequisites": ["PPL-01"]
  }
}
```

---

### 2.2 List Lessons for a Program

**Endpoint:** `GET /api/training/programs/:programId/lessons`  
**Roles:** ADMIN, OPS, INSTRUCTOR, STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/training/programs/PROGRAM_ID/lessons \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "lesson-uuid-1",
    "code": "PPL-01",
    "name": "Principles of Flight",
    "lessonType": "GROUND",
    "sequenceOrder": 1,
    "durationMinutes": 90,
    "requirements": {}
  },
  {
    "id": "lesson-uuid-2",
    "code": "PPL-02",
    "name": "First Solo Flight",
    "lessonType": "FLIGHT",
    "sequenceOrder": 2,
    "durationMinutes": 60,
    "requirements": {}
  }
]
```

---

## 3. Student Profiles

### 3.1 Create or Update Student Profile

**Endpoint:** `POST /api/training/students/:userId/profile`  
**Roles:** ADMIN, OPS

**Request Body:**
```json
{
  "regulatoryId": "DGCA-FILE-12345",
  "enrollmentDate": "2025-01-01",
  "status": "ACTIVE",
  "notes": "Enrolled in PPL program"
}
```

**cURL Command:**
```bash
# Replace USER_ID with the student user's ID
curl -X POST http://localhost:3000/api/training/students/USER_ID/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "regulatoryId": "DGCA-FILE-12345",
    "enrollmentDate": "2025-01-01",
    "status": "ACTIVE",
    "notes": "Enrolled in PPL program"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "profile-uuid",
  "tenantId": "tenant-uuid",
  "userId": "user-uuid",
  "regulatoryId": "DGCA-FILE-12345",
  "enrollmentDate": "2025-01-01",
  "status": "ACTIVE",
  "notes": "Enrolled in PPL program",
  "createdAt": "2025-01-14T10:10:00.000Z",
  "updatedAt": "2025-01-14T10:10:00.000Z"
}
```

**Note:** This endpoint creates a profile if it doesn't exist, or updates it if it does.

---

### 3.2 Get My Profile (Student)

**Endpoint:** `GET /api/training/students/me/profile`  
**Roles:** STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/training/students/me/profile \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "id": "profile-uuid",
  "tenantId": "tenant-uuid",
  "userId": "user-uuid",
  "regulatoryId": "DGCA-FILE-12345",
  "enrollmentDate": "2025-01-01",
  "status": "ACTIVE",
  "notes": "Enrolled in PPL program",
  "createdAt": "2025-01-14T10:10:00.000Z",
  "updatedAt": "2025-01-14T10:10:00.000Z"
}
```

---

## 4. Student Progress / Lesson Attempts

### 4.1 Record a Lesson Attempt

**Endpoint:** `POST /api/training/students/:studentProfileId/lesson-attempts`  
**Roles:** INSTRUCTOR, ADMIN, OPS

**Request Body:**
```json
{
  "programId": "program-uuid",
  "lessonId": "lesson-uuid",
  "deliveryType": "FLIGHT",
  "status": "COMPLETED",
  "grade": "SAT",
  "remarks": "Student performed well. Good understanding of principles.",
  "scheduledAt": "2025-01-15T09:00:00.000Z",
  "completedAt": "2025-01-15T10:00:00.000Z"
}
```

**cURL Command:**
```bash
# Replace STUDENT_PROFILE_ID with the student profile ID
curl -X POST http://localhost:3000/api/training/students/STUDENT_PROFILE_ID/lesson-attempts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -d '{
    "programId": "program-uuid",
    "lessonId": "lesson-uuid",
    "deliveryType": "FLIGHT",
    "status": "COMPLETED",
    "grade": "SAT",
    "remarks": "Student performed well.",
    "scheduledAt": "2025-01-15T09:00:00.000Z",
    "completedAt": "2025-01-15T10:00:00.000Z"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "attempt-uuid",
  "tenantId": "tenant-uuid",
  "studentProfileId": "profile-uuid",
  "programId": "program-uuid",
  "lessonId": "lesson-uuid",
  "instructorUserId": "instructor-uuid",
  "attemptNumber": 1,
  "deliveryType": "FLIGHT",
  "status": "COMPLETED",
  "grade": "SAT",
  "remarks": "Student performed well.",
  "scheduledAt": "2025-01-15T09:00:00.000Z",
  "completedAt": "2025-01-15T10:00:00.000Z",
  "createdAt": "2025-01-14T10:15:00.000Z",
  "updatedAt": "2025-01-14T10:15:00.000Z"
}
```

**Note:** If the user is an INSTRUCTOR, their user ID is automatically set as `instructorUserId`. Otherwise, you can specify it in the request body.

---

### 4.2 List Student Progress

**Endpoint:** `GET /api/training/students/:studentProfileId/progress`  
**Roles:** INSTRUCTOR, ADMIN, OPS

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/training/students/STUDENT_PROFILE_ID/progress \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "attempt-uuid-1",
    "studentProfileId": "profile-uuid",
    "programId": "program-uuid",
    "lessonId": "lesson-uuid-1",
    "instructorUserId": "instructor-uuid",
    "attemptNumber": 1,
    "deliveryType": "FLIGHT",
    "status": "COMPLETED",
    "grade": "SAT",
    "remarks": "Good performance",
    "scheduledAt": "2025-01-15T09:00:00.000Z",
    "completedAt": "2025-01-15T10:00:00.000Z"
  },
  {
    "id": "attempt-uuid-2",
    "studentProfileId": "profile-uuid",
    "programId": "program-uuid",
    "lessonId": "lesson-uuid-2",
    "attemptNumber": 1,
    "deliveryType": "GROUND",
    "status": "SCHEDULED",
    "scheduledAt": "2025-01-20T14:00:00.000Z"
  }
]
```

---

### 4.3 Get My Progress (Student)

**Endpoint:** `GET /api/training/students/me/progress`  
**Roles:** STUDENT

**cURL Command:**
```bash
curl -X GET http://localhost:3000/api/training/students/me/progress \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "attempt-uuid",
    "studentProfileId": "profile-uuid",
    "programId": "program-uuid",
    "lessonId": "lesson-uuid",
    "instructorUserId": "instructor-uuid",
    "attemptNumber": 1,
    "deliveryType": "FLIGHT",
    "status": "COMPLETED",
    "grade": "SAT",
    "remarks": "Good performance",
    "scheduledAt": "2025-01-15T09:00:00.000Z",
    "completedAt": "2025-01-15T10:00:00.000Z"
  }
]
```

---

## Complete Test Flow

### Step 1: Create a DGCA PPL Program

```bash
curl -X POST http://localhost:3000/api/training/programs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code": "DGCA-PPL-2025",
    "name": "DGCA PPL Integrated",
    "regulatoryFrameworkCode": "DGCA",
    "category": "INTEGRATED"
  }' | jq
```

**Save the `id` from the response as `PROGRAM_ID`.**

---

### Step 2: Add 2-3 Lessons to the Program

**Lesson 1 (Ground):**
```bash
curl -X POST http://localhost:3000/api/training/programs/PROGRAM_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code": "PPL-01",
    "name": "Principles of Flight",
    "lessonType": "GROUND",
    "sequenceOrder": 1,
    "durationMinutes": 90,
    "requirements": {}
  }' | jq
```

**Lesson 2 (Flight):**
```bash
curl -X POST http://localhost:3000/api/training/programs/PROGRAM_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code": "PPL-02",
    "name": "First Solo Flight",
    "lessonType": "FLIGHT",
    "sequenceOrder": 2,
    "durationMinutes": 60,
    "requirements": {
      "aircraftType": "C172",
      "weatherMinima": {
        "visibility": "5km",
        "cloudBase": "1000ft"
      }
    }
  }' | jq
```

**Lesson 3 (Ground):**
```bash
curl -X POST http://localhost:3000/api/training/programs/PROGRAM_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code": "PPL-03",
    "name": "Navigation Basics",
    "lessonType": "GROUND",
    "sequenceOrder": 3,
    "durationMinutes": 120,
    "requirements": {
      "prerequisites": ["PPL-01"]
    }
  }' | jq
```

**Save the lesson IDs from responses.**

---

### Step 3: Create a Student Profile

**First, create a STUDENT user (if not exists):**
```bash
# This would typically be done via a user management endpoint
# For now, assume you have a STUDENT user ID
```

**Then create the profile:**
```bash
curl -X POST http://localhost:3000/api/training/students/STUDENT_USER_ID/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "regulatoryId": "DGCA-FILE-12345",
    "enrollmentDate": "2025-01-01",
    "status": "ACTIVE",
    "notes": "Enrolled in PPL program"
  }' | jq
```

**Save the `id` from the response as `STUDENT_PROFILE_ID`.**

---

### Step 4: Record a Completed Lesson Attempt

```bash
curl -X POST http://localhost:3000/api/training/students/STUDENT_PROFILE_ID/lesson-attempts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -d '{
    "programId": "PROGRAM_ID",
    "lessonId": "LESSON_ID_1",
    "deliveryType": "GROUND",
    "status": "COMPLETED",
    "grade": "SAT",
    "remarks": "Student demonstrated good understanding of flight principles.",
    "completedAt": "2025-01-15T10:00:00.000Z"
  }' | jq
```

---

### Step 5: Fetch "My Progress" as a STUDENT

```bash
curl -X GET http://localhost:3000/api/training/students/me/progress \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" | jq
```

---

## Error Scenarios

### 1. Unauthorized (401)
```bash
# Missing token
curl -X GET http://localhost:3000/api/training/programs
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
# STUDENT trying to create a program
curl -X POST http://localhost:3000/api/training/programs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_TOKEN" \
  -d '{"code":"TEST","name":"Test","regulatoryFrameworkCode":"DGCA","category":"INTEGRATED"}'
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
# Non-existent program
curl -X GET http://localhost:3000/api/training/programs/00000000-0000-0000-0000-000000000000/lessons \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "statusCode": 404,
  "message": "Program with id '00000000-0000-0000-0000-000000000000' not found"
}
```

---

### 4. Conflict - Duplicate Code (409)
```bash
# Creating program with existing code
curl -X POST http://localhost:3000/api/training/programs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "code": "DGCA-PPL-2025",
    "name": "Duplicate",
    "regulatoryFrameworkCode": "DGCA",
    "category": "INTEGRATED"
  }'
```

**Response:**
```json
{
  "statusCode": 409,
  "message": "Program with code 'DGCA-PPL-2025' already exists"
}
```

---

## Summary

### Files Created/Modified:
- ✅ `db/migrations/2025_11_16_0002_training_core.sql` (migration)
- ✅ `src/modules/training/training.repository.ts` (repository)
- ✅ `src/modules/training/training.service.ts` (service)
- ✅ `src/modules/training/training.controller.ts` (controller)
- ✅ `src/modules/training/training.module.ts` (module)
- ✅ `src/modules/training/dto/create-program.dto.ts` (DTO)
- ✅ `src/modules/training/dto/create-lesson.dto.ts` (DTO)
- ✅ `src/modules/training/dto/create-student-profile.dto.ts` (DTO)
- ✅ `src/modules/training/dto/create-lesson-attempt.dto.ts` (DTO)

### New Tables:
- `training_programs` - Training programs (PPL, CPL, IR, etc.)
- `training_lessons` - Syllabus items within programs
- `student_profiles` - Student enrollment information
- `student_lesson_attempts` - Progress tracking for lesson attempts

### New Endpoints:
1. `POST /api/training/programs` - Create program (ADMIN, OPS)
2. `GET /api/training/programs` - List programs (all roles)
3. `POST /api/training/programs/:programId/lessons` - Create lesson (ADMIN, OPS)
4. `GET /api/training/programs/:programId/lessons` - List lessons (all roles)
5. `POST /api/training/students/:userId/profile` - Create/update student profile (ADMIN, OPS)
6. `GET /api/training/students/me/profile` - Get my profile (STUDENT)
7. `POST /api/training/students/:studentProfileId/lesson-attempts` - Record attempt (INSTRUCTOR, ADMIN, OPS)
8. `GET /api/training/students/:studentProfileId/progress` - List progress (INSTRUCTOR, ADMIN, OPS)
9. `GET /api/training/students/me/progress` - Get my progress (STUDENT)

### Quick Test Commands:

**1. Create DGCA PPL program with 2-3 lessons:**
```bash
# Create program
PROGRAM_ID=$(curl -s -X POST http://localhost:3000/api/training/programs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"code":"DGCA-PPL-2025","name":"DGCA PPL","regulatoryFrameworkCode":"DGCA","category":"INTEGRATED"}' \
  | jq -r '.id')

# Add lessons
curl -X POST http://localhost:3000/api/training/programs/$PROGRAM_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"code":"PPL-01","name":"Principles of Flight","lessonType":"GROUND","sequenceOrder":1,"durationMinutes":90}'

curl -X POST http://localhost:3000/api/training/programs/$PROGRAM_ID/lessons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"code":"PPL-02","name":"First Solo","lessonType":"FLIGHT","sequenceOrder":2,"durationMinutes":60}'
```

**2. Create student profile:**
```bash
curl -X POST http://localhost:3000/api/training/students/STUDENT_USER_ID/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"regulatoryId":"DGCA-12345","status":"ACTIVE"}'
```

**3. Record completed lesson attempt:**
```bash
curl -X POST http://localhost:3000/api/training/students/STUDENT_PROFILE_ID/lesson-attempts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer INSTRUCTOR_TOKEN" \
  -d '{"programId":"PROGRAM_ID","lessonId":"LESSON_ID","deliveryType":"FLIGHT","status":"COMPLETED","grade":"SAT"}'
```

**4. Fetch "my progress" as STUDENT:**
```bash
curl -X GET http://localhost:3000/api/training/students/me/progress \
  -H "Authorization: Bearer STUDENT_TOKEN"
```

