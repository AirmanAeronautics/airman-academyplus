import { IsString, IsOptional, IsObject, IsIn } from 'class-validator';

export class UpdateAircraftDto {
  @IsString()
  @IsOptional()
  baseAirportIcao?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVE', 'MAINTENANCE', 'INACTIVE'])
  status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

  @IsObject()
  @IsOptional()
  capabilities?: Record<string, any>;
}

