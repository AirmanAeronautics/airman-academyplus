import { IsString, IsNotEmpty, IsDateString, IsNumber, Min, IsIn, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['FUEL', 'MAINTENANCE', 'SALARY', 'RENT', 'OTHER'])
  category: 'FUEL' | 'MAINTENANCE' | 'SALARY' | 'RENT' | 'OTHER';

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsDateString()
  @IsNotEmpty()
  incurredOn: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

