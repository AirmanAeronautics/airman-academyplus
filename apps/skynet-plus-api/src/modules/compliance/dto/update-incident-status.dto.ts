import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateIncidentStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['OPEN', 'INVESTIGATING', 'CLOSED'])
  status: 'OPEN' | 'INVESTIGATING' | 'CLOSED';
}

