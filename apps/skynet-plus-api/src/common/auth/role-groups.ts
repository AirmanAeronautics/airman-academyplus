import { UserRole } from '../../core/users/user.types';

export const CORE_ADMIN_ROLES: readonly UserRole[] = ['SUPER_ADMIN', 'ADMIN'];

export const OPS_FULL_ROLES: readonly UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'OPS_MANAGER'];

export const FLEET_MAINTENANCE_ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'MAINTENANCE_OFFICER',
];

export const FLEET_READ_ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'OPS_MANAGER',
  'MAINTENANCE_OFFICER',
  'INSTRUCTOR',
];

export const FINANCE_ROLES: readonly UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTS_OFFICER'];

export const CRM_ROLES: readonly UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MARKETING_CRM'];

export const COMPLIANCE_FULL_ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'COMPLIANCE_OFFICER',
];

export const COMPLIANCE_RECORD_ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'COMPLIANCE_OFFICER',
  'INSTRUCTOR',
  'MAINTENANCE_OFFICER',
];

export const COMPLIANCE_READ_ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'COMPLIANCE_OFFICER',
  'OPS_MANAGER',
];

export const COMPLIANCE_RECORD_LIST_ROLES: readonly UserRole[] = [
  ...COMPLIANCE_RECORD_ROLES,
  'OPS_MANAGER',
];

export const SUPPORT_MANAGEMENT_ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'SUPPORT_STAFF',
];

export const THREAD_CREATOR_ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'OPS_MANAGER',
  'SUPPORT_STAFF',
];

export const SORTIE_THREAD_ROLES: readonly UserRole[] = ['OPS_MANAGER', 'INSTRUCTOR', 'SUPPORT_STAFF'];

export const TRAINING_MANAGEMENT_ROLES: readonly UserRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'OPS_MANAGER',
  'INSTRUCTOR',
];

export const TRAINING_VIEW_ROLES: readonly UserRole[] = [
  ...TRAINING_MANAGEMENT_ROLES,
  'STUDENT',
];

