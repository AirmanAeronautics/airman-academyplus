export type UserRole = 
  | "student" 
  | "instructor" 
  | "admin"
  | "super_admin"
  | "ops_manager" 
  | "maintenance_officer" 
  | "compliance_officer" 
  | "accounts_officer" 
  | "marketing_crm" 
  | "support"
  | "pending";

export const TRAINING_ROLES = ["student", "instructor"] as const;
export const STAFF_ROLES = ["admin", "super_admin", "ops_manager", "maintenance_officer", "compliance_officer", "accounts_officer", "marketing_crm", "support"] as const;

// Helper to extract roles from profile (supports both legacy and new system)
function getUserRoles(profile: any): string[] {
  const roles: string[] = [];
  
  // New system: user_roles array
  if (profile?.user_roles && Array.isArray(profile.user_roles)) {
    profile.user_roles
      .filter((ur: any) => ur.is_active)
      .forEach((ur: any) => roles.push(ur.role));
  }
  
  // Legacy system: single role field (fallback during transition)
  if (profile?.role && !roles.includes(profile.role)) {
    roles.push(profile.role);
  }
  
  return roles;
}

// Helper to check if user has a specific role
export function hasRole(profile: any, role: UserRole): boolean {
  const roles = getUserRoles(profile);
  return roles.includes(role);
}

// Helper to check if user has any of the specified roles
export function hasAnyRole(profile: any, roles: UserRole[]): boolean {
  const userRoles = getUserRoles(profile);
  return roles.some(role => userRoles.includes(role));
}

export function canViewStudentProgress(profile: any): boolean {
  return hasAnyRole(profile, ["instructor", "admin", "super_admin", "ops_manager", "compliance_officer"]);
}

export function canViewAllStudents(profile: any): boolean {
  return hasAnyRole(profile, ["admin", "super_admin"]);
}

export function canManageStudentData(profile: any): boolean {
  return hasAnyRole(profile, ["instructor", "admin", "super_admin", "ops_manager"]);
}

export function isStudent(profile: any): boolean {
  return hasRole(profile, "student");
}

export function isInstructor(profile: any): boolean {
  return hasRole(profile, "instructor");
}

export function isTrainingRole(profile: any): boolean {
  return hasAnyRole(profile, [...TRAINING_ROLES]);
}

export function canAccessPeopleDirectory(profile: any): boolean {
  return isTrainingRole(profile) || hasAnyRole(profile, ["admin", "super_admin", "ops_manager", "compliance_officer"]);
}

export function getRoleDisplayName(role: string | undefined): string {
  if (!role) return "Unknown Role";
  
  const roleMap: Record<string, string> = {
    student: "Student",
    instructor: "Instructor (External)",
    admin: "Administrator",
    super_admin: "Super Administrator",
    ops_manager: "Operations Manager",
    maintenance_officer: "Maintenance Officer",
    compliance_officer: "Compliance Officer",
    accounts_officer: "Accounts Officer",
    marketing_crm: "Marketing & CRM",
    support: "Customer Support",
    pending: "Pending Approval"
  };
  
  return roleMap[role] || role;
}

export function getUserPermissions(profile: any) {
  return {
    canViewStudentProgress: canViewStudentProgress(profile),
    canViewAllStudents: canViewAllStudents(profile),
    canManageStudentData: canManageStudentData(profile),
    canAccessPeopleDirectory: canAccessPeopleDirectory(profile),
    isStudent: isStudent(profile),
    isInstructor: isInstructor(profile),
    isTrainingRole: isTrainingRole(profile),
    roles: getUserRoles(profile)
  };
}