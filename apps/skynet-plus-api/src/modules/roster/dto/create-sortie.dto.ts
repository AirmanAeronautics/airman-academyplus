import { IsString, IsNotEmpty, IsUUID, IsDateString, IsOptional } from 'class-validator';

export class CreateSortieDto {
  @IsUUID()
  @IsNotEmpty()
  studentProfileId: string;

  @IsUUID()
  @IsNotEmpty()
  instructorUserId: string;

  @IsUUID()
  @IsNotEmpty()
  aircraftId: string;

  @IsUUID()
  @IsNotEmpty()
  programId: string;

  @IsUUID()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  airportIcao: string;

  @IsDateString()
  @IsNotEmpty()
  reportTime: string;

  @IsString()
  @IsOptional()
  dispatchNotes?: string;
}

