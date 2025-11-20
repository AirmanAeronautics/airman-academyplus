import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn, IsDateString } from 'class-validator';

export class CreateRecordDto {
  @IsUUID()
  @IsNotEmpty()
  itemId: string;

  @IsDateString()
  @IsOptional()
  performedAt?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PASS', 'FAIL', 'N/A'])
  status: 'PASS' | 'FAIL' | 'N/A';

  @IsString()
  @IsOptional()
  remarks?: string;

  @IsUUID()
  @IsOptional()
  linkedSortieId?: string;

  @IsUUID()
  @IsOptional()
  linkedAircraftId?: string;
}

