-- ===========================
-- CRM Leads
-- ===========================
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NULL,
  phone TEXT NULL,
  source TEXT NOT NULL,
  -- e.g. "Website", "Instagram", "Walk-in"
  stage TEXT NOT NULL DEFAULT 'NEW'
    CHECK (stage IN ('NEW','CONTACTED','SCHEDULED_DEMO','APPLIED','ENROLLED','LOST')),
  assigned_to_user_id UUID NULL REFERENCES "user"(id) ON DELETE SET NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one email per tenant (nullable email allowed)
CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_leads_tenant_email
  ON crm_leads (tenant_id, email)
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant_stage
  ON crm_leads (tenant_id, stage);

CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant_source
  ON crm_leads (tenant_id, source);

CREATE INDEX IF NOT EXISTS idx_crm_leads_tenant_assigned
  ON crm_leads (tenant_id, assigned_to_user_id);

-- ===========================
-- CRM Activities
-- ===========================
CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN ('CALL','WHATSAPP','EMAIL','MEETING','VISIT')),
  subject TEXT NULL,
  details TEXT NULL,
  performed_by_user_id UUID NOT NULL REFERENCES "user"(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_tenant_lead
  ON crm_activities (tenant_id, lead_id);

CREATE INDEX IF NOT EXISTS idx_crm_activities_tenant_performed_at
  ON crm_activities (tenant_id, performed_at DESC);

-- ===========================
-- CRM Campaigns
-- ===========================
CREATE TABLE IF NOT EXISTS crm_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT NOT NULL
    CHECK (channel IN ('GOOGLE_ADS','SOCIAL','FAIR','REFERRAL','OTHER')),
  budget NUMERIC(12,2) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  status TEXT NOT NULL DEFAULT 'PLANNED'
    CHECK (status IN ('PLANNED','ACTIVE','PAUSED','COMPLETED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_campaigns_tenant_status
  ON crm_campaigns (tenant_id, status);

-- ===========================
-- CRM Lead Campaigns (Many-to-Many)
-- ===========================
CREATE TABLE IF NOT EXISTS crm_lead_campaigns (
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES crm_campaigns(id) ON DELETE CASCADE,
  PRIMARY KEY (tenant_id, lead_id, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_crm_lead_campaigns_tenant_campaign
  ON crm_lead_campaigns (tenant_id, campaign_id);

-- ===========================
-- Triggers for updated_at
-- ===========================
DROP TRIGGER IF EXISTS trg_crm_leads_updated_at ON crm_leads;
CREATE TRIGGER trg_crm_leads_updated_at
BEFORE UPDATE ON crm_leads
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_crm_campaigns_updated_at ON crm_campaigns;
CREATE TRIGGER trg_crm_campaigns_updated_at
BEFORE UPDATE ON crm_campaigns
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

