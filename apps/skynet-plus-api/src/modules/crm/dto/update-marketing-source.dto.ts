import { IsString, IsOptional, IsIn, IsNumber, Min, IsBoolean } from 'class-validator';

export class UpdateMarketingSourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsOptional()
  @IsIn(['DIGITAL', 'SOCIAL', 'REFERRAL', 'EVENT', 'DIRECT', 'OTHER'])
  category?: 'DIGITAL' | 'SOCIAL' | 'REFERRAL' | 'EVENT' | 'DIRECT' | 'OTHER';

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPerLead?: number | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

