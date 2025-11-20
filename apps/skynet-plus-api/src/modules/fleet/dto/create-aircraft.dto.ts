import { IsString, IsNotEmpty, IsObject, IsOptional, IsIn } from 'class-validator';

export class CreateAircraftDto {
  @IsString()
  @IsNotEmpty()
  registration: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  baseAirportIcao: string;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])
  status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

  @IsObject()
  @IsOptional()
  capabilities?: Record<string, any>;
}

