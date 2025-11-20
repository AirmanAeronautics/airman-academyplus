import { IsString, IsNotEmpty, IsOptional, IsUUID, IsIn } from 'class-validator';

export class CreateThreadDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['GENERAL', 'SORTIE', 'AIRCRAFT', 'STUDENT'])
  type: 'GENERAL' | 'SORTIE' | 'AIRCRAFT' | 'STUDENT';

  @IsString()
  @IsNotEmpty()
  title: string;

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

