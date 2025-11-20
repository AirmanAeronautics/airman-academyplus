import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { CreateLessonAttemptDto } from './dto/create-lesson-attempt.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TRAINING_MANAGEMENT_ROLES, TRAINING_VIEW_ROLES } from '../../common/auth/role-groups';

@Controller('training')
@UseGuards(RolesGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  // ==================== Programs ====================

  @Post('programs')
  @Roles(...TRAINING_MANAGEMENT_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createProgram(
    @TenantId() tenantId: string,
    @Body() dto: CreateProgramDto,
  ) {
    return this.trainingService.createProgram(tenantId, dto);
  }

  @Get('programs')
  @Roles(...TRAINING_VIEW_ROLES)
  async listPrograms(@TenantId() tenantId: string) {
    return this.trainingService.listPrograms(tenantId);
  }

  // ==================== Lessons ====================

  @Post('programs/:programId/lessons')
  @Roles(...TRAINING_MANAGEMENT_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createLesson(
    @TenantId() tenantId: string,
    @Param('programId') programId: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.trainingService.createLesson(tenantId, programId, dto);
  }

  @Get('programs/:programId/lessons')
  @Roles(...TRAINING_VIEW_ROLES)
  async listLessonsForProgram(
    @TenantId() tenantId: string,
    @Param('programId') programId: string,
  ) {
    return this.trainingService.listLessonsForProgram(tenantId, programId);
  }

  // ==================== Student Profiles ====================

  @Post('students/:userId/profile')
  @Roles(...TRAINING_MANAGEMENT_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createOrUpdateStudentProfile(
    @TenantId() tenantId: string,
    @Param('userId') userId: string,
    @Body() dto: CreateStudentProfileDto,
  ) {
    return this.trainingService.createOrUpdateStudentProfile(tenantId, userId, dto);
  }

  @Get('students/me/profile')
  @Roles('STUDENT')
  async getMyProfile(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.trainingService.getStudentProfileByUserId(tenantId, user.id);
  }

  // ==================== Student Progress / Lesson Attempts ====================

  @Post('students/:studentProfileId/lesson-attempts')
  @Roles(...TRAINING_MANAGEMENT_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async recordLessonAttempt(
    @TenantId() tenantId: string,
    @Param('studentProfileId') studentProfileId: string,
    @Body() dto: CreateLessonAttemptDto,
    @CurrentUser() user: any,
  ) {
    // If user is INSTRUCTOR, automatically set their ID as instructorUserId
    const instructorUserId = user.role === 'INSTRUCTOR' ? user.id : dto.instructorUserId;
    return this.trainingService.recordLessonAttempt(tenantId, studentProfileId, {
      ...dto,
      instructorUserId,
    });
  }

  @Get('students/:studentProfileId/progress')
  @Roles(...TRAINING_MANAGEMENT_ROLES)
  async listStudentProgress(
    @TenantId() tenantId: string,
    @Param('studentProfileId') studentProfileId: string,
  ) {
    return this.trainingService.listStudentProgress(tenantId, studentProfileId);
  }

  @Get('students/me/progress')
  @Roles('STUDENT')
  async listMyProgress(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
  ) {
    return this.trainingService.listMyProgress(tenantId, user.id);
  }
}
