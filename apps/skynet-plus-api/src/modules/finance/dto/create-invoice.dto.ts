import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateInvoiceDto {
  @IsUUID()
  @IsNotEmpty()
  studentProfileId: string;

  @IsUUID()
  @IsOptional()
  feePlanId?: string;

  @IsString()
  @IsOptional()
  invoiceNumber?: string; // Auto-generated if not provided

  @IsDateString()
  @IsNotEmpty()
  issueDate: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

