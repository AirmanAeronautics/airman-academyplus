import { IsString, IsNotEmpty, IsDateString, IsOptional, IsIn } from 'class-validator';

export class AvailabilitySlotDto {
  @IsDateString()
  @IsNotEmpty()
  startAt: string;

  @IsDateString()
  @IsNotEmpty()
  endAt: string;

  @IsString()
  @IsOptional()
  @IsIn(['AVAILABLE', 'UNAVAILABLE', 'TENTATIVE'])
  status?: 'AVAILABLE' | 'UNAVAILABLE' | 'TENTATIVE';

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpsertAvailabilityDto {
  slots: AvailabilitySlotDto[];
}

