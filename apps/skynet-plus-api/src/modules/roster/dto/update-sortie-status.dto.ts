import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class UpdateSortieStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['SCHEDULED', 'DISPATCHED', 'IN_FLIGHT', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
  status: 'SCHEDULED' | 'DISPATCHED' | 'IN_FLIGHT' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

  @IsString()
  @IsOptional()
  dispatchNotes?: string;
}

