import { IsString, IsOptional } from 'class-validator';

export class UpsertDispatchAnnotationDto {
  @IsString()
  @IsOptional()
  notes?: string;
}

