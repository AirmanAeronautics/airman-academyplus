-- ===========================
-- Environment Snapshots (WX/NOTAM/Traffic)
-- ===========================
CREATE TABLE IF NOT EXISTS environment_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NULL REFERENCES tenant(id) ON DELETE CASCADE,
  -- NULL means "global/shared data"; non-null means tenant-specific enrichments if ever needed
  airport_icao TEXT NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL,
  metar_json JSONB NULL,
  -- Parsed METAR fields (ceiling, vis, wind, etc.)
  taf_json JSONB NULL,
  -- Parsed TAF segments for trend
  notams_json JSONB NULL,
  -- Array of NOTAMs relevant to that airport (runway closure, taxiway, etc.)
  traffic_json JSONB NULL,
  -- Simple structure like:
  -- { "densityIndex": 0.3, "nearbyAircraft": 12 }
  derived_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example:
  -- {
  --   "wxBelowVfrMinima": false,
  --   "strongCrosswind": true,
  --   "runwayClosed": false,
  --   "highTraffic": true
  -- }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_environment_snapshots_airport_time
  ON environment_snapshots (airport_icao, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_environment_snapshots_tenant_airport_time
  ON environment_snapshots (tenant_id, airport_icao, captured_at DESC);

-- ===========================
-- Dispatch Annotations
-- ===========================
CREATE TABLE IF NOT EXISTS dispatch_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  roster_sortie_id UUID NOT NULL REFERENCES roster_sorties(id) ON DELETE CASCADE,
  snapshot_id UUID NULL REFERENCES environment_snapshots(id) ON DELETE SET NULL,
  risk_level TEXT NOT NULL DEFAULT 'GREEN'
    CHECK (risk_level IN ('GREEN','AMBER','RED')),
  flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- { "wxNearMinima": true, "notamRunwayClosed": false, "highTraffic": true }
  notes TEXT NULL,
  created_by_user_id UUID NOT NULL REFERENCES "user"(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_dispatch_annotations_tenant_sortie
  ON dispatch_annotations (tenant_id, roster_sortie_id);

CREATE INDEX IF NOT EXISTS idx_dispatch_annotations_tenant_risk
  ON dispatch_annotations (tenant_id, risk_level);

CREATE INDEX IF NOT EXISTS idx_dispatch_annotations_tenant_sortie
  ON dispatch_annotations (tenant_id, roster_sortie_id);

