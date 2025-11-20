-- Enable UUID generation (safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================
-- Tenants
-- ===========================
CREATE TABLE IF NOT EXISTS tenant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  regulatory_framework_code TEXT NOT NULL, -- e.g. 'DGCA', 'EASA', 'FAA'
  timezone TEXT NOT NULL,                  -- e.g. 'Asia/Kolkata'
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_regulatory_framework
  ON tenant (regulatory_framework_code);

-- ===========================
-- Users
-- ===========================
CREATE TABLE IF NOT EXISTS "user" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN','OPS','INSTRUCTOR','STUDENT')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One email per tenant
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_tenant_email
  ON "user" (tenant_id, email);

CREATE INDEX IF NOT EXISTS idx_user_tenant_role
  ON "user" (tenant_id, role);

-- ===========================
-- Audit Log
-- ===========================
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  user_id UUID REFERENCES "user"(id),
  action TEXT NOT NULL,                  -- e.g. 'AUTH_LOGIN', 'ROSTER_SOLVE', 'DISPATCH_RELEASE'
  entity_type TEXT,                      -- e.g. 'ROSTER_ASSIGNMENT', 'DISPATCH_RELEASE'
  entity_id TEXT,                        -- typically UUID as text
  meta JSONB,                            -- extra context (ip, userAgent, old/new values)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_created_at
  ON audit_log (tenant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_action
  ON audit_log (tenant_id, action);

-- ===========================
-- Basic trigger to keep updated_at in sync (optional but recommended)
-- ===========================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tenant_updated_at ON tenant;
CREATE TRIGGER trg_tenant_updated_at
BEFORE UPDATE ON tenant
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_updated_at ON "user";
CREATE TRIGGER trg_user_updated_at
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

