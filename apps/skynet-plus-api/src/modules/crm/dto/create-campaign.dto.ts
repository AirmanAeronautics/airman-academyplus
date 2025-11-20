import { IsString, IsNotEmpty, IsOptional, IsIn, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['GOOGLE_ADS', 'SOCIAL', 'FAIR', 'REFERRAL', 'OTHER'])
  channel: 'GOOGLE_ADS' | 'SOCIAL' | 'FAIR' | 'REFERRAL' | 'OTHER';

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

