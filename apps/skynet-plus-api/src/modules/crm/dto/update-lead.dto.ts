import { IsString, IsOptional, IsEmail, IsUUID, IsIn } from 'class-validator';

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsUUID()
  @IsOptional()
  marketingSourceId?: string | null;

  @IsString()
  @IsOptional()
  @IsIn(['NEW', 'CONTACTED', 'SCHEDULED_DEMO', 'APPLIED', 'ENROLLED', 'LOST'])
  stage?: 'NEW' | 'CONTACTED' | 'SCHEDULED_DEMO' | 'APPLIED' | 'ENROLLED' | 'LOST';

  @IsUUID()
  @IsOptional()
  assignedToUserId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

