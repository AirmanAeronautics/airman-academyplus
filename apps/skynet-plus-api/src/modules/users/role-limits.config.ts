import { UserRole } from '../../core/users/user.types';

export const ORG_ROLE_LIMITS: Record<UserRole, number | null> = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  OPS_MANAGER: 2,
  MAINTENANCE_OFFICER: 2,
  COMPLIANCE_OFFICER: 2,
  ACCOUNTS_OFFICER: 2,
  MARKETING_CRM: 2,
  SUPPORT_STAFF: 2,
  INSTRUCTOR: 2,
  STUDENT: null,
};

