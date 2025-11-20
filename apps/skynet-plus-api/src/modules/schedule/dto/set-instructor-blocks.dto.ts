import { IsString, IsNotEmpty, IsDateString, IsArray, ValidateNested, IsUUID, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class InstructorBlockDto {
  @IsUUID()
  @IsNotEmpty()
  blockId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['AVAILABLE', 'BUSY', 'LEAVE'])
  status: 'AVAILABLE' | 'BUSY' | 'LEAVE';
}

export class SetInstructorBlocksDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructorBlockDto)
  blocks: InstructorBlockDto[];
}

