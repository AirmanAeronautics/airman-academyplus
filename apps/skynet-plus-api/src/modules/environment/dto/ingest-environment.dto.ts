import { IsString, IsNotEmpty, IsDateString, IsOptional, IsObject } from 'class-validator';

export class IngestEnvironmentDto {
  @IsString()
  @IsNotEmpty()
  airportIcao: string;

  @IsDateString()
  @IsNotEmpty()
  capturedAt: string;

  @IsObject()
  @IsOptional()
  metarJson?: any;

  @IsObject()
  @IsOptional()
  tafJson?: any;

  @IsObject()
  @IsOptional()
  notamsJson?: any;

  @IsObject()
  @IsOptional()
  trafficJson?: any;
}

