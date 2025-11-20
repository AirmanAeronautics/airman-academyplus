import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateBlockDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsInt()
  @Min(0)
  @Max(1439)
  @IsOptional()
  startMinutes?: number;

  @IsInt()
  @Min(0)
  @Max(1439)
  @IsOptional()
  endMinutes?: number;
}

