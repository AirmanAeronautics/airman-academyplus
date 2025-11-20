// Use UserRole from @/types/auth as single source of truth
import type { UserRole } from '@/types/auth';

export const TRAINING_ROLES: readonly UserRole[] = ['STUDENT', 'INSTRUCTOR'] as const;
export const STAFF_ROLES: readonly UserRole[] = [
  'ADMIN',
  'SUPER_ADMIN',
  'OPS_MANAGER',
  'MAINTENANCE_OFFICER',
  'COMPLIANCE_OFFICER',
  'ACCOUNTS_OFFICER',
  'MARKETING_CRM',
  'SUPPORT_STAFF',
] as const;

// Helper to extract roles from user object (JWT-based auth)
export function getUserRoles(user: any): UserRole[] {
  if (!user) return [];
  
  // Backend JWT provides single role
  if (user.role) {
    return [user.role as UserRole];
  }
  
  return [];
}

// Helper to check if user has a specific role
export function hasRole(user: any, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

// Helper to check if user has any of the specified roles
export function hasAnyRole(user: any, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role as UserRole);
}

export function canViewStudentProgress(user: any): boolean {
  return hasAnyRole(user, ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN', 'OPS_MANAGER', 'COMPLIANCE_OFFICER']);
}

export function canViewAllStudents(user: any): boolean {
  return hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN']);
}

export function canManageStudentData(user: any): boolean {
  return hasAnyRole(user, ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN', 'OPS_MANAGER']);
}

export function isStudent(user: any): boolean {
  return hasRole(user, 'STUDENT');
}

export function isInstructor(user: any): boolean {
  return hasRole(user, 'INSTRUCTOR');
}

export function isTrainingRole(user: any): boolean {
  return hasAnyRole(user, [...TRAINING_ROLES]);
}

export function canAccessPeopleDirectory(user: any): boolean {
  return isTrainingRole(user) || hasAnyRole(user, ['ADMIN', 'SUPER_ADMIN', 'OPS_MANAGER', 'COMPLIANCE_OFFICER']);
}

export function getRoleDisplayName(role: string | undefined): string {
  if (!role) return "Unknown Role";
  
  const roleMap: Record<UserRole, string> = {
    STUDENT: "Student",
    INSTRUCTOR: "Instructor",
    ADMIN: "Administrator",
    SUPER_ADMIN: "Super Administrator",
    OPS_MANAGER: "Operations Manager",
    MAINTENANCE_OFFICER: "Maintenance Officer",
    COMPLIANCE_OFFICER: "Compliance Officer",
    ACCOUNTS_OFFICER: "Accounts Officer",
    MARKETING_CRM: "Marketing & CRM",
    SUPPORT_STAFF: "Support Staff",
  };
  
  return roleMap[role as UserRole] || role;
}

export function getUserPermissions(user: any) {
  return {
    canViewStudentProgress: canViewStudentProgress(user),
    canViewAllStudents: canViewAllStudents(user),
    canManageStudentData: canManageStudentData(user),
    canAccessPeopleDirectory: canAccessPeopleDirectory(user),
    isStudent: isStudent(user),
    isInstructor: isInstructor(user),
    isTrainingRole: isTrainingRole(user),
    roles: getUserRoles(user)
  };
}