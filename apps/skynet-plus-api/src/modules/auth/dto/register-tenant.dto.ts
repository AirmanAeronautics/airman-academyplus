import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterTenantDto {
  @IsString()
  @IsNotEmpty()
  tenantName: string;

  @IsString()
  @IsNotEmpty()
  regulatoryFrameworkCode: string; // e.g. "DGCA"

  @IsString()
  @IsNotEmpty()
  timezone: string; // e.g. "Asia/Kolkata"

  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @IsString()
  @IsNotEmpty()
  adminFullName: string;

  @IsString()
  @MinLength(8)
  adminPassword: string;
}


