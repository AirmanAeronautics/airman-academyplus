-- ===========================
-- Support Tickets
-- ===========================
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  assigned_to_user_id UUID NULL REFERENCES "user"(id) ON DELETE SET NULL,
  category TEXT NOT NULL
    CHECK (category IN ('TECHNICAL','SCHEDULING','BILLING','MAINTENANCE','OTHER')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM'
    CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status TEXT NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN','IN_PROGRESS','RESOLVED','CLOSED')),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_status
  ON support_tickets (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_category
  ON support_tickets (tenant_id, category);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_created_by
  ON support_tickets (tenant_id, created_by_user_id);

CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant_assigned
  ON support_tickets (tenant_id, assigned_to_user_id);

-- ===========================
-- Support Ticket Messages
-- ===========================
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_tenant_ticket
  ON support_ticket_messages (tenant_id, ticket_id);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_tenant_created_at
  ON support_ticket_messages (tenant_id, created_at DESC);

-- ===========================
-- Triggers for updated_at
-- ===========================
DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at
BEFORE UPDATE ON support_tickets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

