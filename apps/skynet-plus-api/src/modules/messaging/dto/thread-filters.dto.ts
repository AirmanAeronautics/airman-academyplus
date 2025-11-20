import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class ThreadFiltersDto {
  @IsString()
  @IsOptional()
  @IsIn(['GENERAL', 'SORTIE', 'AIRCRAFT', 'STUDENT'])
  type?: 'GENERAL' | 'SORTIE' | 'AIRCRAFT' | 'STUDENT';

  @IsUUID()
  @IsOptional()
  sortieId?: string;

  @IsUUID()
  @IsOptional()
  aircraftId?: string;

  @IsUUID()
  @IsOptional()
  studentProfileId?: string;
}

