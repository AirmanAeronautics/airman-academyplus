import { DatabaseService } from '../../common/db/database.service';

export interface TrainingProgramRecord {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  regulatoryFrameworkCode: string;
  category: 'GROUND' | 'FLIGHT' | 'INTEGRATED';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingLessonRecord {
  id: string;
  tenantId: string;
  programId: string;
  code: string;
  name: string;
  lessonType: 'GROUND' | 'FLIGHT';
  sequenceOrder: number;
  durationMinutes: number;
  requirements: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfileRecord {
  id: string;
  tenantId: string;
  userId: string;
  regulatoryId: string | null;
  enrollmentDate: Date;
  status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'WITHDRAWN';
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentLessonAttemptRecord {
  id: string;
  tenantId: string;
  studentProfileId: string;
  programId: string;
  lessonId: string;
  instructorUserId: string | null;
  attemptNumber: number;
  deliveryType: 'GROUND' | 'FLIGHT' | 'SIMULATOR';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  grade: string | null;
  remarks: string | null;
  scheduledAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class TrainingRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  // ==================== Programs ====================

  async createProgram(
    tenantId: string,
    params: {
      code: string;
      name: string;
      regulatoryFrameworkCode: string;
      category: 'GROUND' | 'FLIGHT' | 'INTEGRATED';
      isActive?: boolean;
    },
  ): Promise<TrainingProgramRecord> {
    const row = await this.databaseService.queryOne<TrainingProgramRecord>(
      `
      INSERT INTO training_programs (tenant_id, code, name, regulatory_framework_code, category, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        tenant_id AS "tenantId",
        code,
        name,
        regulatory_framework_code AS "regulatoryFrameworkCode",
        category,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.code,
        params.name,
        params.regulatoryFrameworkCode,
        params.category,
        params.isActive ?? true,
      ],
    );

    if (!row) {
      throw new Error('Failed to create training program');
    }
    return row;
  }

  async listPrograms(tenantId: string, includeInactive = false): Promise<TrainingProgramRecord[]> {
    if (includeInactive) {
      return this.databaseService.query<TrainingProgramRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          code,
          name,
          regulatory_framework_code AS "regulatoryFrameworkCode",
          category,
          is_active AS "isActive",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM training_programs
        WHERE tenant_id = $1
        ORDER BY name ASC
        `,
        [tenantId],
      );
    }

    return this.databaseService.query<TrainingProgramRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        code,
        name,
        regulatory_framework_code AS "regulatoryFrameworkCode",
        category,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM training_programs
      WHERE tenant_id = $1 AND is_active = TRUE
      ORDER BY name ASC
      `,
      [tenantId],
    );
  }

  async getProgramById(tenantId: string, programId: string): Promise<TrainingProgramRecord | null> {
    return this.databaseService.queryOne<TrainingProgramRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        code,
        name,
        regulatory_framework_code AS "regulatoryFrameworkCode",
        category,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM training_programs
      WHERE id = $1 AND tenant_id = $2
      LIMIT 1
      `,
      [programId, tenantId],
    );
  }

  // ==================== Lessons ====================

  async createLesson(
    tenantId: string,
    params: {
      programId: string;
      code: string;
      name: string;
      lessonType: 'GROUND' | 'FLIGHT';
      sequenceOrder: number;
      durationMinutes: number;
      requirements?: Record<string, any>;
      isActive?: boolean;
    },
  ): Promise<TrainingLessonRecord> {
    const row = await this.databaseService.queryOne<TrainingLessonRecord>(
      `
      INSERT INTO training_lessons (tenant_id, program_id, code, name, lesson_type, sequence_order, duration_minutes, requirements, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        tenant_id AS "tenantId",
        program_id AS "programId",
        code,
        name,
        lesson_type AS "lessonType",
        sequence_order AS "sequenceOrder",
        duration_minutes AS "durationMinutes",
        requirements,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.programId,
        params.code,
        params.name,
        params.lessonType,
        params.sequenceOrder,
        params.durationMinutes,
        JSON.stringify(params.requirements || {}),
        params.isActive ?? true,
      ],
    );

    if (!row) {
      throw new Error('Failed to create training lesson');
    }
    return row;
  }

  async listLessonsForProgram(
    tenantId: string,
    programId: string,
    includeInactive = false,
  ): Promise<TrainingLessonRecord[]> {
    if (includeInactive) {
      return this.databaseService.query<TrainingLessonRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          program_id AS "programId",
          code,
          name,
          lesson_type AS "lessonType",
          sequence_order AS "sequenceOrder",
          duration_minutes AS "durationMinutes",
          requirements,
          is_active AS "isActive",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM training_lessons
        WHERE tenant_id = $1 AND program_id = $2
        ORDER BY sequence_order ASC
        `,
        [tenantId, programId],
      );
    }

    return this.databaseService.query<TrainingLessonRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        program_id AS "programId",
        code,
        name,
        lesson_type AS "lessonType",
        sequence_order AS "sequenceOrder",
        duration_minutes AS "durationMinutes",
        requirements,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM training_lessons
      WHERE tenant_id = $1 AND program_id = $2 AND is_active = TRUE
      ORDER BY sequence_order ASC
      `,
      [tenantId, programId],
    );
  }

  async getLessonById(tenantId: string, lessonId: string): Promise<TrainingLessonRecord | null> {
    return this.databaseService.queryOne<TrainingLessonRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        program_id AS "programId",
        code,
        name,
        lesson_type AS "lessonType",
        sequence_order AS "sequenceOrder",
        duration_minutes AS "durationMinutes",
        requirements,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM training_lessons
      WHERE id = $1 AND tenant_id = $2
      LIMIT 1
      `,
      [lessonId, tenantId],
    );
  }

  // ==================== Student Profiles ====================

  async createOrUpdateStudentProfile(
    tenantId: string,
    userId: string,
    params: {
      regulatoryId?: string | null;
      enrollmentDate?: Date;
      status?: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'WITHDRAWN';
      notes?: string | null;
    },
  ): Promise<StudentProfileRecord> {
    // Check if profile exists
    const existing = await this.databaseService.queryOne<StudentProfileRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        user_id AS "userId",
        regulatory_id AS "regulatoryId",
        enrollment_date AS "enrollmentDate",
        status,
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM student_profiles
      WHERE tenant_id = $1 AND user_id = $2
      LIMIT 1
      `,
      [tenantId, userId],
    );

    if (existing) {
      // Update existing profile
      const row = await this.databaseService.queryOne<StudentProfileRecord>(
        `
        UPDATE student_profiles
        SET
          regulatory_id = COALESCE($3, regulatory_id),
          enrollment_date = COALESCE($4, enrollment_date),
          status = COALESCE($5, status),
          notes = COALESCE($6, notes)
        WHERE tenant_id = $1 AND user_id = $2
        RETURNING
          id,
          tenant_id AS "tenantId",
          user_id AS "userId",
          regulatory_id AS "regulatoryId",
          enrollment_date AS "enrollmentDate",
          status,
          notes,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        `,
        [
          tenantId,
          userId,
          params.regulatoryId,
          params.enrollmentDate,
          params.status,
          params.notes,
        ],
      );

      if (!row) {
        throw new Error('Failed to update student profile');
      }
      return row;
    } else {
      // Create new profile
      const row = await this.databaseService.queryOne<StudentProfileRecord>(
        `
        INSERT INTO student_profiles (tenant_id, user_id, regulatory_id, enrollment_date, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          tenant_id AS "tenantId",
          user_id AS "userId",
          regulatory_id AS "regulatoryId",
          enrollment_date AS "enrollmentDate",
          status,
          notes,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        `,
        [
          tenantId,
          userId,
          params.regulatoryId ?? null,
          params.enrollmentDate ?? new Date(),
          params.status ?? 'ACTIVE',
          params.notes ?? null,
        ],
      );

      if (!row) {
        throw new Error('Failed to create student profile');
      }
      return row;
    }
  }

  async getStudentProfileByUserId(
    tenantId: string,
    userId: string,
  ): Promise<StudentProfileRecord | null> {
    return this.databaseService.queryOne<StudentProfileRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        user_id AS "userId",
        regulatory_id AS "regulatoryId",
        enrollment_date AS "enrollmentDate",
        status,
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM student_profiles
      WHERE tenant_id = $1 AND user_id = $2
      LIMIT 1
      `,
      [tenantId, userId],
    );
  }

  async getStudentProfileById(
    tenantId: string,
    studentProfileId: string,
  ): Promise<StudentProfileRecord | null> {
    return this.databaseService.queryOne<StudentProfileRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        user_id AS "userId",
        regulatory_id AS "regulatoryId",
        enrollment_date AS "enrollmentDate",
        status,
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM student_profiles
      WHERE id = $1 AND tenant_id = $2
      LIMIT 1
      `,
      [studentProfileId, tenantId],
    );
  }

  // ==================== Student Lesson Attempts ====================

  async recordLessonAttempt(
    tenantId: string,
    params: {
      studentProfileId: string;
      programId: string;
      lessonId: string;
      instructorUserId?: string | null;
      attemptNumber?: number;
      deliveryType: 'GROUND' | 'FLIGHT' | 'SIMULATOR';
      status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
      grade?: string | null;
      remarks?: string | null;
      scheduledAt?: Date | null;
      completedAt?: Date | null;
    },
  ): Promise<StudentLessonAttemptRecord> {
    // Determine attempt number if not provided
    let attemptNumber = params.attemptNumber;
    if (!attemptNumber) {
      const maxAttempt = await this.databaseService.queryOne<{ max: number }>(
        `
        SELECT COALESCE(MAX(attempt_number), 0) + 1 AS max
        FROM student_lesson_attempts
        WHERE tenant_id = $1 AND student_profile_id = $2 AND lesson_id = $3
        `,
        [tenantId, params.studentProfileId, params.lessonId],
      );
      attemptNumber = maxAttempt?.max || 1;
    }

    const row = await this.databaseService.queryOne<StudentLessonAttemptRecord>(
      `
      INSERT INTO student_lesson_attempts (
        tenant_id, student_profile_id, program_id, lesson_id, instructor_user_id,
        attempt_number, delivery_type, status, grade, remarks, scheduled_at, completed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        program_id AS "programId",
        lesson_id AS "lessonId",
        instructor_user_id AS "instructorUserId",
        attempt_number AS "attemptNumber",
        delivery_type AS "deliveryType",
        status,
        grade,
        remarks,
        scheduled_at AS "scheduledAt",
        completed_at AS "completedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.studentProfileId,
        params.programId,
        params.lessonId,
        params.instructorUserId ?? null,
        attemptNumber,
        params.deliveryType,
        params.status,
        params.grade ?? null,
        params.remarks ?? null,
        params.scheduledAt ?? null,
        params.completedAt ?? null,
      ],
    );

    if (!row) {
      throw new Error('Failed to record lesson attempt');
    }
    return row;
  }

  async listStudentProgress(
    tenantId: string,
    studentProfileId: string,
    programId?: string,
  ): Promise<StudentLessonAttemptRecord[]> {
    if (programId) {
      return this.databaseService.query<StudentLessonAttemptRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          student_profile_id AS "studentProfileId",
          program_id AS "programId",
          lesson_id AS "lessonId",
          instructor_user_id AS "instructorUserId",
          attempt_number AS "attemptNumber",
          delivery_type AS "deliveryType",
          status,
          grade,
          remarks,
          scheduled_at AS "scheduledAt",
          completed_at AS "completedAt",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM student_lesson_attempts
        WHERE tenant_id = $1 AND student_profile_id = $2 AND program_id = $3
        ORDER BY created_at DESC
        `,
        [tenantId, studentProfileId, programId],
      );
    }

    return this.databaseService.query<StudentLessonAttemptRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        program_id AS "programId",
        lesson_id AS "lessonId",
        instructor_user_id AS "instructorUserId",
        attempt_number AS "attemptNumber",
        delivery_type AS "deliveryType",
        status,
        grade,
        remarks,
        scheduled_at AS "scheduledAt",
        completed_at AS "completedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM student_lesson_attempts
      WHERE tenant_id = $1 AND student_profile_id = $2
      ORDER BY created_at DESC
      `,
      [tenantId, studentProfileId],
    );
  }
}

