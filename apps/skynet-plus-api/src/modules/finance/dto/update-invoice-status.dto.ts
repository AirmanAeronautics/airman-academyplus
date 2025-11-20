import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateInvoiceStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['DRAFT', 'ISSUED', 'PAID', 'PARTIAL', 'VOID'])
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'PARTIAL' | 'VOID';
}

