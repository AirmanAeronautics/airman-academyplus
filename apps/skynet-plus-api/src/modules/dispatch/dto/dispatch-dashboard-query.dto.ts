import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class DispatchDashboardQueryDto {
  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;

  @IsString()
  @IsOptional()
  airportIcao?: string;

  @IsString()
  @IsOptional()
  @IsIn(['GREEN', 'AMBER', 'RED'])
  riskLevel?: 'GREEN' | 'AMBER' | 'RED';

  @IsString()
  @IsOptional()
  status?: string;
}

