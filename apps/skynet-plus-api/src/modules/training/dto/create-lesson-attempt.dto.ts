import { IsString, IsNotEmpty, IsUUID, IsOptional, IsDateString, IsIn, IsInt, Min } from 'class-validator';

export class CreateLessonAttemptDto {
  @IsUUID()
  @IsNotEmpty()
  programId: string;

  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['GROUND', 'FLIGHT', 'SIMULATOR'])
  deliveryType: 'GROUND' | 'FLIGHT' | 'SIMULATOR';

  @IsString()
  @IsNotEmpty()
  @IsIn(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED'])
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

  @IsUUID()
  @IsOptional()
  instructorUserId?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  attemptNumber?: number;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsDateString()
  @IsOptional()
  completedAt?: string;
}
