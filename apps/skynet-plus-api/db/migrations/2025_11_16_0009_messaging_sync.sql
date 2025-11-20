-- ===========================
-- Organization Threads
-- ===========================
CREATE TABLE IF NOT EXISTS org_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  type TEXT NOT NULL
    CHECK (type IN ('GENERAL','SORTIE','AIRCRAFT','STUDENT')),
  title TEXT NOT NULL,
  sortie_id UUID NULL REFERENCES roster_sorties(id) ON DELETE CASCADE,
  aircraft_id UUID NULL REFERENCES aircraft(id) ON DELETE SET NULL,
  student_profile_id UUID NULL REFERENCES student_profiles(id) ON DELETE SET NULL,
  created_by_user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_threads_tenant_type
  ON org_threads (tenant_id, type);

CREATE INDEX IF NOT EXISTS idx_org_threads_tenant_sortie
  ON org_threads (tenant_id, sortie_id)
  WHERE sortie_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_org_threads_tenant_aircraft
  ON org_threads (tenant_id, aircraft_id)
  WHERE aircraft_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_org_threads_tenant_student
  ON org_threads (tenant_id, student_profile_id)
  WHERE student_profile_id IS NOT NULL;

-- ===========================
-- Organization Messages
-- ===========================
CREATE TABLE IF NOT EXISTS org_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES org_threads(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_messages_tenant_thread
  ON org_messages (tenant_id, thread_id);

CREATE INDEX IF NOT EXISTS idx_org_messages_tenant_created_at
  ON org_messages (tenant_id, created_at DESC);

-- ===========================
-- Maverick Sync Events
-- ===========================
CREATE TABLE IF NOT EXISTS maverick_sync_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  -- e.g., SORTIE_SCHEDULED, SORTIE_UPDATED, SORTIE_CANCELLED, MESSAGE_CREATED
  entity_type TEXT NOT NULL,
  -- e.g., SORTIE, MESSAGE, STUDENT, INVOICE
  entity_id UUID NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','SENT','FAILED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maverick_sync_events_tenant_status
  ON maverick_sync_events (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_maverick_sync_events_tenant_entity
  ON maverick_sync_events (tenant_id, entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_maverick_sync_events_tenant_created_at
  ON maverick_sync_events (tenant_id, created_at DESC);

-- ===========================
-- Triggers for updated_at
-- ===========================
DROP TRIGGER IF EXISTS trg_org_threads_updated_at ON org_threads;
CREATE TRIGGER trg_org_threads_updated_at
BEFORE UPDATE ON org_threads
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_maverick_sync_events_updated_at ON maverick_sync_events;
CREATE TRIGGER trg_maverick_sync_events_updated_at
BEFORE UPDATE ON maverick_sync_events
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

