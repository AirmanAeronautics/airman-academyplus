import { IsString, IsNotEmpty, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['CALL', 'WHATSAPP', 'EMAIL', 'MEETING', 'VISIT'])
  type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'VISIT';

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  details?: string;

  @IsDateString()
  @IsOptional()
  performedAt?: string;
}

