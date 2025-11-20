-- ===========================
-- Aircraft (Fleet)
-- ===========================
CREATE TABLE IF NOT EXISTS aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  registration TEXT NOT NULL,        -- e.g. VT-ABC
  type TEXT NOT NULL,                -- e.g. C172, DA40
  base_airport_icao TEXT NOT NULL,   -- e.g. VOMM
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','MAINTENANCE','INACTIVE')),
  capabilities JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- e.g. { "IFR": true, "Night": true, "Spins": false }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_aircraft_tenant_registration
  ON aircraft (tenant_id, registration);

CREATE INDEX IF NOT EXISTS idx_aircraft_tenant_base_airport
  ON aircraft (tenant_id, base_airport_icao);

-- ===========================
-- Instructor Availability
-- ===========================
CREATE TABLE IF NOT EXISTS instructor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  instructor_user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE'
    CHECK (status IN ('AVAILABLE','UNAVAILABLE','TENTATIVE')),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instructor_availability_tenant_instructor_time
  ON instructor_availability (tenant_id, instructor_user_id, start_at, end_at);

-- ===========================
-- Aircraft Availability
-- ===========================
CREATE TABLE IF NOT EXISTS aircraft_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'AVAILABLE'
    CHECK (status IN ('AVAILABLE','MAINTENANCE','RESERVED')),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aircraft_availability_tenant_aircraft_time
  ON aircraft_availability (tenant_id, aircraft_id, start_at, end_at);

-- ===========================
-- Roster Sorties (Manual Scheduling)
-- ===========================
CREATE TABLE IF NOT EXISTS roster_sorties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  instructor_user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  aircraft_id UUID NOT NULL REFERENCES aircraft(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES training_lessons(id) ON DELETE CASCADE,
  airport_icao TEXT NOT NULL,
  report_time TIMESTAMPTZ NOT NULL,
  block_off_at TIMESTAMPTZ NULL,
  block_on_at TIMESTAMPTZ NULL,
  status TEXT NOT NULL DEFAULT 'SCHEDULED'
    CHECK (status IN ('SCHEDULED','DISPATCHED','IN_FLIGHT','COMPLETED','CANCELLED','NO_SHOW')),
  dispatch_notes TEXT NULL,
  created_by_user_id UUID NOT NULL REFERENCES "user"(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roster_sorties_tenant_instructor_time
  ON roster_sorties (tenant_id, instructor_user_id, report_time);

CREATE INDEX IF NOT EXISTS idx_roster_sorties_tenant_student_time
  ON roster_sorties (tenant_id, student_profile_id, report_time);

CREATE INDEX IF NOT EXISTS idx_roster_sorties_tenant_aircraft_time
  ON roster_sorties (tenant_id, aircraft_id, report_time);

CREATE INDEX IF NOT EXISTS idx_roster_sorties_tenant_status_time
  ON roster_sorties (tenant_id, status, report_time);

-- ===========================
-- Triggers for updated_at
-- ===========================
DROP TRIGGER IF EXISTS trg_aircraft_updated_at ON aircraft;
CREATE TRIGGER trg_aircraft_updated_at
BEFORE UPDATE ON aircraft
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_instructor_availability_updated_at ON instructor_availability;
CREATE TRIGGER trg_instructor_availability_updated_at
BEFORE UPDATE ON instructor_availability
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_aircraft_availability_updated_at ON aircraft_availability;
CREATE TRIGGER trg_aircraft_availability_updated_at
BEFORE UPDATE ON aircraft_availability
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_roster_sorties_updated_at ON roster_sorties;
CREATE TRIGGER trg_roster_sorties_updated_at
BEFORE UPDATE ON roster_sorties
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

