import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class TicketFiltersDto {
  @IsString()
  @IsOptional()
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

  @IsString()
  @IsOptional()
  @IsIn(['TECHNICAL', 'SCHEDULING', 'BILLING', 'MAINTENANCE', 'OTHER'])
  category?: 'TECHNICAL' | 'SCHEDULING' | 'BILLING' | 'MAINTENANCE' | 'OTHER';

  @IsUUID()
  @IsOptional()
  linkedSortieId?: string;

  @IsUUID()
  @IsOptional()
  linkedAircraftId?: string;

  @IsUUID()
  @IsOptional()
  linkedInvoiceId?: string;

  @IsUUID()
  @IsOptional()
  linkedStudentProfileId?: string;
}

