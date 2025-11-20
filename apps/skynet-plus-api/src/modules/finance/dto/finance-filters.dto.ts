import { IsString, IsOptional, IsIn, IsUUID, IsDateString } from 'class-validator';

export class FinanceFiltersDto {
  @IsString()
  @IsOptional()
  @IsIn(['DRAFT', 'ISSUED', 'PAID', 'PARTIAL', 'VOID'])
  status?: 'DRAFT' | 'ISSUED' | 'PAID' | 'PARTIAL' | 'VOID';

  @IsUUID()
  @IsOptional()
  studentProfileId?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}

