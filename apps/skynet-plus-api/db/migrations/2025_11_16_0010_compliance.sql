-- ===========================
-- Compliance Items
-- ===========================
CREATE TABLE IF NOT EXISTS compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  -- e.g., "DGCA-CFI-001"
  title TEXT NOT NULL,
  description TEXT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('TRAINING','MAINTENANCE','SAFETY','DOCUMENTS')),
  frequency TEXT NOT NULL
    CHECK (frequency IN ('DAILY','WEEKLY','MONTHLY','PER_FLIGHT','ADHOC')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_compliance_items_tenant_code
  ON compliance_items (tenant_id, code);

CREATE INDEX IF NOT EXISTS idx_compliance_items_tenant_category
  ON compliance_items (tenant_id, category);

CREATE INDEX IF NOT EXISTS idx_compliance_items_tenant_active
  ON compliance_items (tenant_id, is_active);

-- ===========================
-- Compliance Records
-- ===========================
CREATE TABLE IF NOT EXISTS compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES compliance_items(id) ON DELETE CASCADE,
  performed_by_user_id UUID NOT NULL REFERENCES "user"(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL
    CHECK (status IN ('PASS','FAIL','N/A')),
  remarks TEXT NULL,
  linked_sortie_id UUID NULL REFERENCES roster_sorties(id) ON DELETE SET NULL,
  linked_aircraft_id UUID NULL REFERENCES aircraft(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_records_tenant_item
  ON compliance_records (tenant_id, item_id);

CREATE INDEX IF NOT EXISTS idx_compliance_records_tenant_performed_at
  ON compliance_records (tenant_id, performed_at DESC);

CREATE INDEX IF NOT EXISTS idx_compliance_records_tenant_sortie
  ON compliance_records (tenant_id, linked_sortie_id)
  WHERE linked_sortie_id IS NOT NULL;

-- ===========================
-- Compliance Incidents
-- ===========================
CREATE TABLE IF NOT EXISTS compliance_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  reported_by_user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  severity TEXT NOT NULL
    CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status TEXT NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN','INVESTIGATING','CLOSED')),
  summary TEXT NOT NULL,
  details TEXT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  linked_sortie_id UUID NULL REFERENCES roster_sorties(id) ON DELETE SET NULL,
  linked_aircraft_id UUID NULL REFERENCES aircraft(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_compliance_incidents_tenant_status
  ON compliance_incidents (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_compliance_incidents_tenant_severity
  ON compliance_incidents (tenant_id, severity);

CREATE INDEX IF NOT EXISTS idx_compliance_incidents_tenant_occurred_at
  ON compliance_incidents (tenant_id, occurred_at DESC);

-- ===========================
-- Triggers for updated_at
-- ===========================
DROP TRIGGER IF EXISTS trg_compliance_items_updated_at ON compliance_items;
CREATE TRIGGER trg_compliance_items_updated_at
BEFORE UPDATE ON compliance_items
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_compliance_incidents_updated_at ON compliance_incidents;
CREATE TRIGGER trg_compliance_incidents_updated_at
BEFORE UPDATE ON compliance_incidents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

