import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsIn, IsOptional } from 'class-validator';

export class RecordPaymentDto {
  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['CASH', 'CARD', 'BANK_TRANSFER', 'UPI', 'OTHER'])
  method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'UPI' | 'OTHER';

  @IsString()
  @IsOptional()
  reference?: string;
}

