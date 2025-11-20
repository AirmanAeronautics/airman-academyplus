import { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateStudentProfileDto {
  @IsString()
  @IsOptional()
  regulatoryId?: string;

  @IsDateString()
  @IsOptional()
  enrollmentDate?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'WITHDRAWN'])
  status?: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'WITHDRAWN';

  @IsString()
  @IsOptional()
  notes?: string;
}
