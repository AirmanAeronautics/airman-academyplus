import { IsString, IsOptional, IsIn, IsBoolean } from 'class-validator';

export class MarketingSourceFiltersDto {
  @IsString()
  @IsOptional()
  @IsIn(['DIGITAL', 'SOCIAL', 'REFERRAL', 'EVENT', 'DIRECT', 'OTHER'])
  category?: 'DIGITAL' | 'SOCIAL' | 'REFERRAL' | 'EVENT' | 'DIRECT' | 'OTHER';

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

