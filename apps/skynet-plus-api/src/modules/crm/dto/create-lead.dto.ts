import { IsString, IsNotEmpty, IsOptional, IsEmail, IsUUID, IsIn } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsUUID()
  @IsOptional()
  marketingSourceId?: string;

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

