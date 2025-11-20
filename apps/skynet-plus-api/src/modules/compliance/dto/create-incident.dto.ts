import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn, IsDateString } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsOptional()
  details?: string;

  @IsDateString()
  @IsNotEmpty()
  occurredAt: string;

  @IsUUID()
  @IsOptional()
  linkedSortieId?: string;

  @IsUUID()
  @IsOptional()
  linkedAircraftId?: string;
}

