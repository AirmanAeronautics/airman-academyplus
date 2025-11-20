import { IsString, IsNotEmpty, IsOptional, IsIn, IsBoolean } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['TRAINING', 'MAINTENANCE', 'SAFETY', 'DOCUMENTS', 'OTHER'])
  category: 'TRAINING' | 'MAINTENANCE' | 'SAFETY' | 'DOCUMENTS' | 'OTHER';

  @IsString()
  @IsNotEmpty()
  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY', 'PER_FLIGHT', 'ADHOC'])
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PER_FLIGHT' | 'ADHOC';

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

