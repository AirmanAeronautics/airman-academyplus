-- ===========================
-- Marketing Sources
-- ===========================
CREATE TABLE IF NOT EXISTS marketing_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- e.g. "Website", "Instagram", "Google Ads", "Referral", "Walk-in"
  description TEXT NULL,
  category TEXT NOT NULL DEFAULT 'OTHER'
    CHECK (category IN ('DIGITAL', 'SOCIAL', 'REFERRAL', 'EVENT', 'DIRECT', 'OTHER')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  cost_per_lead NUMERIC(10,2) NULL,
  -- Track cost efficiency
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, name)
);

CREATE INDEX IF NOT EXISTS idx_marketing_sources_tenant_active
  ON marketing_sources (tenant_id, is_active);

CREATE INDEX IF NOT EXISTS idx_marketing_sources_tenant_category
  ON marketing_sources (tenant_id, category);

-- ===========================
-- Update crm_leads to reference marketing_sources
-- ===========================
-- Add marketing_source_id column (nullable for backward compatibility)
ALTER TABLE crm_leads
  ADD COLUMN IF NOT EXISTS marketing_source_id UUID NULL REFERENCES marketing_sources(id) ON DELETE SET NULL;

-- Create index for marketing_source_id
CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant_marketing_source
  ON crm_leads (tenant_id, marketing_source_id);

-- ===========================
-- Lead Assignment History
-- ===========================
CREATE TABLE IF NOT EXISTS crm_lead_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  assigned_to_user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  assigned_by_user_id UUID NOT NULL REFERENCES "user"(id),
  previous_assigned_to_user_id UUID NULL REFERENCES "user"(id) ON DELETE SET NULL,
  reason TEXT NULL,
  -- Optional reason for assignment/reassignment
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMPTZ NULL,
  -- Track when assignment ended (if reassigned or unassigned)
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_crm_lead_assignments_tenant_lead
  ON crm_lead_assignments (tenant_id, lead_id);

CREATE INDEX IF NOT EXISTS idx_crm_lead_assignments_tenant_assigned_to
  ON crm_lead_assignments (tenant_id, assigned_to_user_id);

CREATE INDEX IF NOT EXISTS idx_crm_lead_assignments_tenant_active
  ON crm_lead_assignments (tenant_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_crm_lead_assignments_tenant_assigned_at
  ON crm_lead_assignments (tenant_id, assigned_at DESC);

-- ===========================
-- Trigger for updated_at on marketing_sources
-- ===========================
DROP TRIGGER IF EXISTS trg_marketing_sources_updated_at ON marketing_sources;
CREATE TRIGGER trg_marketing_sources_updated_at
BEFORE UPDATE ON marketing_sources
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ===========================
-- Function to automatically create assignment record when lead is assigned
-- ===========================
CREATE OR REPLACE FUNCTION create_lead_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- If assigned_to_user_id changed from NULL to a value, or from one value to another
  IF (OLD.assigned_to_user_id IS DISTINCT FROM NEW.assigned_to_user_id) THEN
    -- Deactivate previous active assignment if exists
    IF OLD.assigned_to_user_id IS NOT NULL THEN
      UPDATE crm_lead_assignments
      SET is_active = false, unassigned_at = now()
      WHERE tenant_id = NEW.tenant_id
        AND lead_id = NEW.id
        AND assigned_to_user_id = OLD.assigned_to_user_id
        AND is_active = true;
    END IF;
    
    -- Create new assignment if new assignee is set
    IF NEW.assigned_to_user_id IS NOT NULL THEN
      INSERT INTO crm_lead_assignments (
        tenant_id,
        lead_id,
        assigned_to_user_id,
        assigned_by_user_id,
        previous_assigned_to_user_id,
        is_active
      )
      VALUES (
        NEW.tenant_id,
        NEW.id,
        NEW.assigned_to_user_id,
        COALESCE(current_setting('app.current_user_id', true)::UUID, NEW.assigned_to_user_id),
        OLD.assigned_to_user_id,
        true
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic assignment tracking
DROP TRIGGER IF EXISTS trg_crm_leads_assignment ON crm_leads;
CREATE TRIGGER trg_crm_leads_assignment
AFTER UPDATE OF assigned_to_user_id ON crm_leads
FOR EACH ROW
WHEN (OLD.assigned_to_user_id IS DISTINCT FROM NEW.assigned_to_user_id)
EXECUTE FUNCTION create_lead_assignment();

