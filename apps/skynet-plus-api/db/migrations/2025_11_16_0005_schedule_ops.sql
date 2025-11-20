-- ===========================
-- Schedule Blocks
-- ===========================
CREATE TABLE IF NOT EXISTS schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  -- e.g., "Block A", "Morning Block", "06:00-08:00"
  start_minutes INTEGER NOT NULL,
  -- Minutes from midnight (e.g., 360 for 06:00, 480 for 08:00)
  end_minutes INTEGER NOT NULL,
  -- Minutes from midnight (e.g., 480 for 08:00, 600 for 10:00)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_schedule_blocks_tenant_label
  ON schedule_blocks (tenant_id, label);

CREATE INDEX IF NOT EXISTS idx_schedule_blocks_tenant
  ON schedule_blocks (tenant_id);

-- ===========================
-- Instructor Daily Schedule
-- ===========================
CREATE TABLE IF NOT EXISTS instructor_daily_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  instructor_user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  block_id UUID NOT NULL REFERENCES schedule_blocks(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'AVAILABLE'
    CHECK (status IN ('AVAILABLE','BUSY','LEAVE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_instructor_daily_schedule_tenant_instructor_date_block
  ON instructor_daily_schedule (tenant_id, instructor_user_id, date, block_id);

CREATE INDEX IF NOT EXISTS idx_instructor_daily_schedule_tenant_instructor_date
  ON instructor_daily_schedule (tenant_id, instructor_user_id, date);

CREATE INDEX IF NOT EXISTS idx_instructor_daily_schedule_tenant_date
  ON instructor_daily_schedule (tenant_id, date);

-- ===========================
-- Ops Daily Summary
-- ===========================
CREATE TABLE IF NOT EXISTS ops_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_sorties INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  cancelled INTEGER NOT NULL DEFAULT 0,
  no_show INTEGER NOT NULL DEFAULT 0,
  utilization_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  -- Utilization percentage (0.00 to 100.00)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ops_daily_summary_tenant_date
  ON ops_daily_summary (tenant_id, date);

CREATE INDEX IF NOT EXISTS idx_ops_daily_summary_tenant_date
  ON ops_daily_summary (tenant_id, date DESC);

-- ===========================
-- Triggers for updated_at
-- ===========================
DROP TRIGGER IF EXISTS trg_instructor_daily_schedule_updated_at ON instructor_daily_schedule;
CREATE TRIGGER trg_instructor_daily_schedule_updated_at
BEFORE UPDATE ON instructor_daily_schedule
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_ops_daily_summary_updated_at ON ops_daily_summary;
CREATE TRIGGER trg_ops_daily_summary_updated_at
BEFORE UPDATE ON ops_daily_summary
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

