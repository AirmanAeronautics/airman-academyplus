import { IsString, IsOptional, IsIn, IsDateString, IsNumber, Min } from 'class-validator';

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['GOOGLE_ADS', 'SOCIAL', 'FAIR', 'REFERRAL', 'OTHER'])
  channel?: 'GOOGLE_ADS' | 'SOCIAL' | 'FAIR' | 'REFERRAL' | 'OTHER';

  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  @IsIn(['PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED'])
  status?: 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
}

