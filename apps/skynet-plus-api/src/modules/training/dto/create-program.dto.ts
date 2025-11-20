import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  regulatoryFrameworkCode: string;

  @IsString()
  @IsNotEmpty()
  category: 'GROUND' | 'FLIGHT' | 'INTEGRATED';

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
