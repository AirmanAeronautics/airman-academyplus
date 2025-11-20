-- ===========================
-- Finance Fee Plans
-- ===========================
CREATE TABLE IF NOT EXISTS finance_fee_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  program_id UUID NULL REFERENCES training_programs(id) ON DELETE SET NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  amount NUMERIC(12,2) NOT NULL,
  billing_type TEXT NOT NULL
    CHECK (billing_type IN ('ONE_TIME','PER_HOUR','PER_SORTIE','PER_MONTH')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finance_fee_plans_tenant
  ON finance_fee_plans (tenant_id);

CREATE INDEX IF NOT EXISTS idx_finance_fee_plans_tenant_program
  ON finance_fee_plans (tenant_id, program_id);

-- ===========================
-- Finance Invoices
-- ===========================
CREATE TABLE IF NOT EXISTS finance_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  fee_plan_id UUID NULL REFERENCES finance_fee_plans(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','ISSUED','PAID','PARTIAL','VOID')),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_finance_invoices_tenant_invoice_number
  ON finance_invoices (tenant_id, invoice_number);

CREATE INDEX IF NOT EXISTS idx_finance_invoices_tenant_status
  ON finance_invoices (tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_finance_invoices_tenant_student
  ON finance_invoices (tenant_id, student_profile_id);

CREATE INDEX IF NOT EXISTS idx_finance_invoices_tenant_due_date
  ON finance_invoices (tenant_id, due_date);

-- ===========================
-- Finance Payments
-- ===========================
CREATE TABLE IF NOT EXISTS finance_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES finance_invoices(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT NOT NULL
    CHECK (method IN ('CASH','CARD','BANK_TRANSFER','UPI','OTHER')),
  reference TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finance_payments_tenant_invoice
  ON finance_payments (tenant_id, invoice_id);

CREATE INDEX IF NOT EXISTS idx_finance_payments_tenant_date
  ON finance_payments (tenant_id, payment_date DESC);

-- ===========================
-- Finance Expenses
-- ===========================
CREATE TABLE IF NOT EXISTS finance_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
  category TEXT NOT NULL
    CHECK (category IN ('FUEL','MAINTENANCE','SALARY','RENT','OTHER')),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  incurred_on DATE NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finance_expenses_tenant_category
  ON finance_expenses (tenant_id, category);

CREATE INDEX IF NOT EXISTS idx_finance_expenses_tenant_incurred_on
  ON finance_expenses (tenant_id, incurred_on DESC);

-- ===========================
-- Triggers for updated_at
-- ===========================
DROP TRIGGER IF EXISTS trg_finance_fee_plans_updated_at ON finance_fee_plans;
CREATE TRIGGER trg_finance_fee_plans_updated_at
BEFORE UPDATE ON finance_fee_plans
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_finance_invoices_updated_at ON finance_invoices;
CREATE TRIGGER trg_finance_invoices_updated_at
BEFORE UPDATE ON finance_invoices
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

