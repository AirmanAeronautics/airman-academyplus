import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn, IsNumber, Min } from 'class-validator';

export class CreateFeePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsOptional()
  programId?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['ONE_TIME', 'PER_HOUR', 'PER_SORTIE', 'PER_MONTH'])
  billingType: 'ONE_TIME' | 'PER_HOUR' | 'PER_SORTIE' | 'PER_MONTH';
}

