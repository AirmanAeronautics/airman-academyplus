import { IsString, IsOptional, IsIn, IsDateString, IsUUID } from 'class-validator';

export class ComplianceFiltersDto {
  @IsString()
  @IsOptional()
  @IsIn(['TRAINING', 'MAINTENANCE', 'SAFETY', 'DOCUMENTS', 'OTHER'])
  category?: 'TRAINING' | 'MAINTENANCE' | 'SAFETY' | 'DOCUMENTS' | 'OTHER';

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;

  @IsUUID()
  @IsOptional()
  linkedSortieId?: string;

  @IsUUID()
  @IsOptional()
  linkedAircraftId?: string;
}

