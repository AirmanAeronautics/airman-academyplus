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

export function canViewStudentProgress(userRole: string | undefined): boolean {
  return userRole === "instructor" || userRole === "admin" || userRole === "ops_manager" || userRole === "compliance_officer";
}

export function canViewAllStudents(userRole: string | undefined): boolean {
  return userRole === "admin";
}

export function canManageStudentData(userRole: string | undefined): boolean {
  return userRole === "instructor" || userRole === "admin" || userRole === "ops_manager";
}

export function isStudent(userRole: string | undefined): boolean {
  return userRole === "student";
}

export function isInstructor(userRole: string | undefined): boolean {
  return userRole === "instructor";
}

export function isTrainingRole(userRole: string | undefined): boolean {
  return TRAINING_ROLES.includes(userRole as any);
}

export function canAccessPeopleDirectory(userRole: string | undefined): boolean {
  // Training roles, admins, and key operations staff should access People directory
  return isTrainingRole(userRole) || userRole === "admin" || userRole === "ops_manager" || userRole === "compliance_officer";
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

export function getUserPermissions(userRole: string | undefined) {
  return {
    canViewStudentProgress: canViewStudentProgress(userRole),
    canViewAllStudents: canViewAllStudents(userRole),
    canManageStudentData: canManageStudentData(userRole),
    canAccessPeopleDirectory: canAccessPeopleDirectory(userRole),
    isStudent: isStudent(userRole),
    isInstructor: isInstructor(userRole),
    isTrainingRole: isTrainingRole(userRole)
  };
}