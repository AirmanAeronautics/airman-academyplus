// Auth types matching NestJS backend DTOs

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'OPS_MANAGER'
  | 'MAINTENANCE_OFFICER'
  | 'COMPLIANCE_OFFICER'
  | 'ACCOUNTS_OFFICER'
  | 'MARKETING_CRM'
  | 'SUPPORT_STAFF'
  | 'INSTRUCTOR'
  | 'STUDENT';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterTenantDto {
  tenantName: string;
  regulatoryFrameworkCode: string; // e.g. "DGCA"
  timezone: string; // e.g. "Asia/Kolkata"
  adminEmail: string;
  adminFullName: string;
  adminPassword: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

