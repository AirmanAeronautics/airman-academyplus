-- Phase 8 polish: support, messaging, compliance
-- Date: 2025-11-17

------------------------------------------------------------
-- 1) SUPPORT TICKETS – entity links + better indexes
------------------------------------------------------------

ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS linked_sortie_id UUID NULL REFERENCES roster_sorties(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS linked_aircraft_id UUID NULL REFERENCES aircraft(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS linked_invoice_id UUID NULL REFERENCES finance_invoices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS linked_student_profile_id UUID NULL REFERENCES student_profiles(id) ON DELETE SET NULL;

-- Composite indexes for common filters

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_status_priority_created_at
  ON support_tickets (tenant_id, status, priority, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_assigned_status
  ON support_tickets (tenant_id, assigned_to_user_id, status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_creator_created_at
  ON support_tickets (tenant_id, created_by_user_id, created_at DESC);

------------------------------------------------------------
-- 2) ORG THREADS – canonical threads + listing by type
------------------------------------------------------------

-- One canonical SORTIE thread per tenant/type/sortie
CREATE UNIQUE INDEX IF NOT EXISTS uniq_org_threads_sortie
  ON org_threads (tenant_id, type, sortie_id)
  WHERE type = 'SORTIE' AND sortie_id IS NOT NULL;

-- One canonical AIRCRAFT thread per tenant/type/aircraft
CREATE UNIQUE INDEX IF NOT EXISTS uniq_org_threads_aircraft
  ON org_threads (tenant_id, type, aircraft_id)
  WHERE type = 'AIRCRAFT' AND aircraft_id IS NOT NULL;

-- One canonical STUDENT thread per tenant/type/student
CREATE UNIQUE INDEX IF NOT EXISTS uniq_org_threads_student
  ON org_threads (tenant_id, type, student_profile_id)
  WHERE type = 'STUDENT' AND student_profile_id IS NOT NULL;

-- Recent threads by type (for inbox-style views)
CREATE INDEX IF NOT EXISTS idx_org_threads_tenant_type_created_at
  ON org_threads (tenant_id, type, created_at DESC);

------------------------------------------------------------
-- 3) COMPLIANCE – category OTHER + extra indexes
------------------------------------------------------------

-- Extend category CHECK to include 'OTHER'
ALTER TABLE compliance_items
  DROP CONSTRAINT IF EXISTS compliance_items_category_check;

ALTER TABLE compliance_items
  ADD CONSTRAINT compliance_items_category_check
  CHECK (category IN ('TRAINING','MAINTENANCE','SAFETY','DOCUMENTS','OTHER'));

-- Additional indexes for linked entities

CREATE INDEX IF NOT EXISTS idx_compliance_records_tenant_aircraft
  ON compliance_records (tenant_id, linked_aircraft_id)
  WHERE linked_aircraft_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_compliance_incidents_tenant_sortie
  ON compliance_incidents (tenant_id, linked_sortie_id)
  WHERE linked_sortie_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_compliance_incidents_tenant_aircraft
  ON compliance_incidents (tenant_id, linked_aircraft_id)
  WHERE linked_aircraft_id IS NOT NULL;

