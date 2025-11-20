import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class EnvironmentQueryDto {
  @IsString()
  @IsNotEmpty()
  airportIcao: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}

