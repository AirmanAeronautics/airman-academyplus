import { IsString, IsNotEmpty, IsOptional, IsIn, IsUUID } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['TECHNICAL', 'SCHEDULING', 'BILLING', 'MAINTENANCE', 'OTHER'])
  category: 'TECHNICAL' | 'SCHEDULING' | 'BILLING' | 'MAINTENANCE' | 'OTHER';

  @IsString()
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;

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

