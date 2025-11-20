import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateLeadAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  assignedToUserId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

