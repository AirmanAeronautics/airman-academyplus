-- Extend user.role constraint to new RBAC model

ALTER TABLE "user"
  DROP CONSTRAINT IF EXISTS user_role_check;

ALTER TABLE "user"
  ADD CONSTRAINT user_role_check
  CHECK (
    role IN (
      'SUPER_ADMIN',
      'ADMIN',
      'OPS_MANAGER',
      'MAINTENANCE_OFFICER',
      'COMPLIANCE_OFFICER',
      'ACCOUNTS_OFFICER',
      'MARKETING_CRM',
      'SUPPORT_STAFF',
      'INSTRUCTOR',
      'STUDENT'
    )
  );

