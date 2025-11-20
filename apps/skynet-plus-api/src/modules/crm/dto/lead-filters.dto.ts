import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class LeadFiltersDto {
  @IsString()
  @IsOptional()
  @IsIn(['NEW', 'CONTACTED', 'SCHEDULED_DEMO', 'APPLIED', 'ENROLLED', 'LOST'])
  stage?: 'NEW' | 'CONTACTED' | 'SCHEDULED_DEMO' | 'APPLIED' | 'ENROLLED' | 'LOST';

  @IsString()
  @IsOptional()
  source?: string;

  @IsUUID()
  @IsOptional()
  assignedToUserId?: string;

  @IsString()
  @IsOptional()
  search?: string; // Search in full_name, email, phone
}

