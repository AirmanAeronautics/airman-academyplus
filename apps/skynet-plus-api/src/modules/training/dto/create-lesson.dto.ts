import { IsString, IsNotEmpty, IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lessonType: 'GROUND' | 'FLIGHT';

  @IsInt()
  @Min(1)
  sequenceOrder: number;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsObject()
  @IsOptional()
  requirements?: Record<string, any>;
}
