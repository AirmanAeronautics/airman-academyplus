import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { TrainingRepository } from './training.repository';
import { CreateProgramDto } from './dto/create-program.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { CreateLessonAttemptDto } from './dto/create-lesson-attempt.dto';

@Injectable()
export class TrainingService {
  constructor(private readonly repository: TrainingRepository) {}

  // ==================== Programs ====================

  async createProgram(tenantId: string, dto: CreateProgramDto) {
    // Check if program with same code already exists
    const existing = await this.repository.listPrograms(tenantId, false);
    const codeExists = existing.some((p) => p.code === dto.code);
    if (codeExists) {
      throw new ConflictException(`Program with code '${dto.code}' already exists`);
    }

    return this.repository.createProgram(tenantId, {
      code: dto.code,
      name: dto.name,
      regulatoryFrameworkCode: dto.regulatoryFrameworkCode,
      category: dto.category,
      isActive: dto.isActive ?? true,
    });
  }

  async listPrograms(tenantId: string) {
    return this.repository.listPrograms(tenantId, true);
  }

  async getProgramById(tenantId: string, programId: string) {
    const program = await this.repository.getProgramById(tenantId, programId);
    if (!program) {
      throw new NotFoundException(`Program with id '${programId}' not found`);
    }
    return program;
  }

  // ==================== Lessons ====================

  async createLesson(tenantId: string, programId: string, dto: CreateLessonDto) {
    // Verify program exists
    await this.getProgramById(tenantId, programId);

    // Check if lesson with same code already exists in this program
    const existing = await this.repository.listLessonsForProgram(tenantId, programId, false);
    const codeExists = existing.some((l) => l.code === dto.code);
    if (codeExists) {
      throw new ConflictException(
        `Lesson with code '${dto.code}' already exists in this program`,
      );
    }

    return this.repository.createLesson(tenantId, {
      programId,
      code: dto.code,
      name: dto.name,
      lessonType: dto.lessonType,
      sequenceOrder: dto.sequenceOrder,
      durationMinutes: dto.durationMinutes,
      requirements: dto.requirements,
    });
  }

  async listLessonsForProgram(tenantId: string, programId: string) {
    // Verify program exists
    await this.getProgramById(tenantId, programId);

    return this.repository.listLessonsForProgram(tenantId, programId, true);
  }

  // ==================== Student Profiles ====================

  async createOrUpdateStudentProfile(
    tenantId: string,
    userId: string,
    dto: CreateStudentProfileDto,
  ) {
    return this.repository.createOrUpdateStudentProfile(tenantId, userId, {
      regulatoryId: dto.regulatoryId,
      enrollmentDate: dto.enrollmentDate ? new Date(dto.enrollmentDate) : undefined,
      status: dto.status,
      notes: dto.notes,
    });
  }

  async getStudentProfileByUserId(tenantId: string, userId: string) {
    const profile = await this.repository.getStudentProfileByUserId(tenantId, userId);
    if (!profile) {
      throw new NotFoundException(`Student profile for user '${userId}' not found`);
    }
    return profile;
  }

  async getStudentProfileById(tenantId: string, profileId: string) {
    const profile = await this.repository.getStudentProfileById(tenantId, profileId);
    if (!profile) {
      throw new NotFoundException(`Student profile with id '${profileId}' not found`);
    }
    return profile;
  }

  // ==================== Lesson Attempts ====================

  async recordLessonAttempt(
    tenantId: string,
    studentProfileId: string,
    dto: CreateLessonAttemptDto & { instructorUserId?: string },
  ) {
    // Verify student profile exists
    await this.getStudentProfileById(tenantId, studentProfileId);

    // Verify program and lesson exist
    await this.getProgramById(tenantId, dto.programId);
    const lesson = await this.repository.getLessonById(tenantId, dto.lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson with id '${dto.lessonId}' not found`);
    }

    return this.repository.recordLessonAttempt(tenantId, {
      studentProfileId,
      programId: dto.programId,
      lessonId: dto.lessonId,
      instructorUserId: dto.instructorUserId,
      attemptNumber: dto.attemptNumber,
      deliveryType: dto.deliveryType,
      status: dto.status,
      grade: dto.grade,
      remarks: dto.remarks,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
    });
  }

  async listStudentProgress(tenantId: string, studentProfileId: string, programId?: string) {
    // Verify student profile exists
    await this.getStudentProfileById(tenantId, studentProfileId);

    return this.repository.listStudentProgress(tenantId, studentProfileId, programId);
  }

  async listMyProgress(tenantId: string, userId: string) {
    // Get student profile for this user
    const profile = await this.getStudentProfileByUserId(tenantId, userId);

    return this.repository.listStudentProgress(tenantId, profile.id);
  }
}
