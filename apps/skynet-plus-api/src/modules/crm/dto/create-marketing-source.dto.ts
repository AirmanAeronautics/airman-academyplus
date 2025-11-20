import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber, Min, IsBoolean } from 'class-validator';

export class CreateMarketingSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['DIGITAL', 'SOCIAL', 'REFERRAL', 'EVENT', 'DIRECT', 'OTHER'])
  category?: 'DIGITAL' | 'SOCIAL' | 'REFERRAL' | 'EVENT' | 'DIRECT' | 'OTHER';

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPerLead?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

