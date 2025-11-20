import { IsString, IsNotEmpty, IsInt, Min, Max } from 'class-validator';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsInt()
  @Min(0)
  @Max(1439)
  // Minutes from midnight (0-1439, where 0 = 00:00, 1439 = 23:59)
  startMinutes: number;

  @IsInt()
  @Min(0)
  @Max(1439)
  endMinutes: number;
}

