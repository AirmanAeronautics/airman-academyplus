import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

  @IsUUID()
  @IsOptional()
  assignedToUserId?: string;

  @IsString()
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsUUID()
  @IsOptional()
  linkedSortieId?: string | null;

  @IsUUID()
  @IsOptional()
  linkedAircraftId?: string | null;

  @IsUUID()
  @IsOptional()
  linkedInvoiceId?: string | null;

  @IsUUID()
  @IsOptional()
  linkedStudentProfileId?: string | null;
}

