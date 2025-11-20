import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface FeePlanRecord {
  id: string;
  tenantId: string;
  name: string;
  programId: string | null;
  currency: string;
  amount: number;
  billingType: 'ONE_TIME' | 'PER_HOUR' | 'PER_SORTIE' | 'PER_MONTH';
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceRecord {
  id: string;
  tenantId: string;
  studentProfileId: string;
  feePlanId: string | null;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  currency: string;
  amount: number;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'PARTIAL' | 'VOID';
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentRecord {
  id: string;
  tenantId: string;
  invoiceId: string;
  paymentDate: Date;
  amount: number;
  method: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'UPI' | 'OTHER';
  reference: string | null;
  createdAt: Date;
}

export interface ExpenseRecord {
  id: string;
  tenantId: string;
  category: 'FUEL' | 'MAINTENANCE' | 'SALARY' | 'RENT' | 'OTHER';
  amount: number;
  currency: string;
  incurredOn: Date;
  notes: string | null;
  createdAt: Date;
}

export interface FinanceSummary {
  totalRevenue: number;
  totalOutstanding: number;
  totalPaid: number;
  totalExpenses: number;
  netProfit: number;
  expensesByCategory: Record<string, number>;
}

@Injectable()
export class FinanceRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createFeePlan(
    tenantId: string,
    params: {
      name: string;
      programId?: string | null;
      currency?: string;
      amount: number;
      billingType: string;
    },
  ): Promise<FeePlanRecord> {
    const row = await this.databaseService.queryOne<FeePlanRecord>(
      `
      INSERT INTO finance_fee_plans (
        tenant_id,
        name,
        program_id,
        currency,
        amount,
        billing_type
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        tenant_id AS "tenantId",
        name,
        program_id AS "programId",
        currency,
        amount,
        billing_type AS "billingType",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.name,
        params.programId ?? null,
        params.currency ?? 'INR',
        params.amount,
        params.billingType,
      ],
    );

    if (!row) {
      throw new Error('Failed to create fee plan');
    }

    return row;
  }

  async listFeePlans(tenantId: string): Promise<FeePlanRecord[]> {
    return this.databaseService.query<FeePlanRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        name,
        program_id AS "programId",
        currency,
        amount,
        billing_type AS "billingType",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM finance_fee_plans
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      `,
      [tenantId],
    );
  }

  async generateInvoiceNumber(tenantId: string, year: number): Promise<string> {
    // Get the highest sequence number for this year
    const result = await this.databaseService.queryOne<{ maxSeq: number }>(
      `
      SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-\\d{4}-(\\d+)') AS INTEGER)), 0) as "maxSeq"
      FROM finance_invoices
      WHERE tenant_id = $1
        AND invoice_number LIKE $2
      `,
      [tenantId, `INV-${year}-%`],
    );

    const nextSeq = (result?.maxSeq ?? 0) + 1;
    return `INV-${year}-${String(nextSeq).padStart(3, '0')}`;
  }

  async createInvoice(
    tenantId: string,
    params: {
      studentProfileId: string;
      feePlanId?: string | null;
      invoiceNumber?: string;
      issueDate: Date;
      dueDate: Date;
      currency?: string;
      amount: number;
      notes?: string | null;
    },
  ): Promise<InvoiceRecord> {
    let invoiceNumber = params.invoiceNumber;
    if (!invoiceNumber) {
      const year = new Date(params.issueDate).getFullYear();
      invoiceNumber = await this.generateInvoiceNumber(tenantId, year);
    }

    const row = await this.databaseService.queryOne<InvoiceRecord>(
      `
      INSERT INTO finance_invoices (
        tenant_id,
        student_profile_id,
        fee_plan_id,
        invoice_number,
        issue_date,
        due_date,
        currency,
        amount,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        fee_plan_id AS "feePlanId",
        invoice_number AS "invoiceNumber",
        issue_date AS "issueDate",
        due_date AS "dueDate",
        currency,
        amount,
        status,
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.studentProfileId,
        params.feePlanId ?? null,
        invoiceNumber,
        params.issueDate,
        params.dueDate,
        params.currency ?? 'INR',
        params.amount,
        params.notes ?? null,
      ],
    );

    if (!row) {
      throw new Error('Failed to create invoice');
    }

    return row;
  }

  async updateInvoiceStatus(
    tenantId: string,
    invoiceId: string,
    status: string,
  ): Promise<InvoiceRecord> {
    const row = await this.databaseService.queryOne<InvoiceRecord>(
      `
      UPDATE finance_invoices
      SET status = $3
      WHERE id = $1 AND tenant_id = $2
      RETURNING
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        fee_plan_id AS "feePlanId",
        invoice_number AS "invoiceNumber",
        issue_date AS "issueDate",
        due_date AS "dueDate",
        currency,
        amount,
        status,
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [invoiceId, tenantId, status],
    );

    if (!row) {
      throw new Error('Invoice not found or update failed');
    }

    return row;
  }

  async getInvoiceById(tenantId: string, invoiceId: string): Promise<InvoiceRecord | null> {
    return this.databaseService.queryOne<InvoiceRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        fee_plan_id AS "feePlanId",
        invoice_number AS "invoiceNumber",
        issue_date AS "issueDate",
        due_date AS "dueDate",
        currency,
        amount,
        status,
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM finance_invoices
      WHERE id = $1 AND tenant_id = $2
      `,
      [invoiceId, tenantId],
    );
  }

  async listInvoices(
    tenantId: string,
    filters: {
      status?: string;
      studentProfileId?: string;
      from?: Date;
      to?: Date;
    },
  ): Promise<InvoiceRecord[]> {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }

    if (filters.studentProfileId) {
      conditions.push(`student_profile_id = $${paramIndex++}`);
      values.push(filters.studentProfileId);
    }

    if (filters.from) {
      conditions.push(`issue_date >= $${paramIndex++}`);
      values.push(filters.from);
    }

    if (filters.to) {
      conditions.push(`issue_date <= $${paramIndex++}`);
      values.push(filters.to);
    }

    return this.databaseService.query<InvoiceRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        fee_plan_id AS "feePlanId",
        invoice_number AS "invoiceNumber",
        issue_date AS "issueDate",
        due_date AS "dueDate",
        currency,
        amount,
        status,
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM finance_invoices
      WHERE ${conditions.join(' AND ')}
      ORDER BY issue_date DESC
      `,
      values,
    );
  }

  async recordPayment(
    tenantId: string,
    invoiceId: string,
    params: {
      paymentDate: Date;
      amount: number;
      method: string;
      reference?: string | null;
    },
  ): Promise<PaymentRecord> {
    const row = await this.databaseService.queryOne<PaymentRecord>(
      `
      INSERT INTO finance_payments (
        tenant_id,
        invoice_id,
        payment_date,
        amount,
        method,
        reference
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        tenant_id AS "tenantId",
        invoice_id AS "invoiceId",
        payment_date AS "paymentDate",
        amount,
        method,
        reference,
        created_at AS "createdAt"
      `,
      [
        tenantId,
        invoiceId,
        params.paymentDate,
        params.amount,
        params.method,
        params.reference ?? null,
      ],
    );

    if (!row) {
      throw new Error('Failed to record payment');
    }

    // Update invoice status based on total payments
    const totalPayments = await this.getTotalPayments(tenantId, invoiceId);
    const invoice = await this.getInvoiceById(tenantId, invoiceId);
    if (invoice) {
      if (totalPayments >= invoice.amount) {
        await this.updateInvoiceStatus(tenantId, invoiceId, 'PAID');
      } else if (totalPayments > 0) {
        await this.updateInvoiceStatus(tenantId, invoiceId, 'PARTIAL');
      }
    }

    return row;
  }

  async getTotalPayments(tenantId: string, invoiceId: string): Promise<number> {
    const result = await this.databaseService.queryOne<{ total: number }>(
      `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM finance_payments
      WHERE tenant_id = $1 AND invoice_id = $2
      `,
      [tenantId, invoiceId],
    );

    return result?.total ?? 0;
  }

  async listPayments(tenantId: string, invoiceId: string): Promise<PaymentRecord[]> {
    return this.databaseService.query<PaymentRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        invoice_id AS "invoiceId",
        payment_date AS "paymentDate",
        amount,
        method,
        reference,
        created_at AS "createdAt"
      FROM finance_payments
      WHERE tenant_id = $1 AND invoice_id = $2
      ORDER BY payment_date DESC
      `,
      [tenantId, invoiceId],
    );
  }

  async createExpense(
    tenantId: string,
    params: {
      category: string;
      amount: number;
      currency?: string;
      incurredOn: Date;
      notes?: string | null;
    },
  ): Promise<ExpenseRecord> {
    const row = await this.databaseService.queryOne<ExpenseRecord>(
      `
      INSERT INTO finance_expenses (
        tenant_id,
        category,
        amount,
        currency,
        incurred_on,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        tenant_id AS "tenantId",
        category,
        amount,
        currency,
        incurred_on AS "incurredOn",
        notes,
        created_at AS "createdAt"
      `,
      [
        tenantId,
        params.category,
        params.amount,
        params.currency ?? 'INR',
        params.incurredOn,
        params.notes ?? null,
      ],
    );

    if (!row) {
      throw new Error('Failed to create expense');
    }

    return row;
  }

  async listExpenses(
    tenantId: string,
    filters: {
      category?: string;
      from?: Date;
      to?: Date;
    },
  ): Promise<ExpenseRecord[]> {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(filters.category);
    }

    if (filters.from) {
      conditions.push(`incurred_on >= $${paramIndex++}`);
      values.push(filters.from);
    }

    if (filters.to) {
      conditions.push(`incurred_on <= $${paramIndex++}`);
      values.push(filters.to);
    }

    return this.databaseService.query<ExpenseRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        category,
        amount,
        currency,
        incurred_on AS "incurredOn",
        notes,
        created_at AS "createdAt"
      FROM finance_expenses
      WHERE ${conditions.join(' AND ')}
      ORDER BY incurred_on DESC
      `,
      values,
    );
  }

  async computeSummary(
    tenantId: string,
    from: Date,
    to: Date,
  ): Promise<FinanceSummary> {
    // Total revenue (paid invoices)
    const revenueResult = await this.databaseService.queryOne<{ total: number }>(
      `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM finance_invoices
      WHERE tenant_id = $1
        AND issue_date >= $2
        AND issue_date <= $3
        AND status IN ('PAID', 'PARTIAL')
      `,
      [tenantId, from, to],
    );

    // Total paid (sum of all payments in date range)
    const paidResult = await this.databaseService.queryOne<{ total: number }>(
      `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM finance_payments
      WHERE tenant_id = $1
        AND payment_date >= $2
        AND payment_date <= $3
      `,
      [tenantId, from, to],
    );

    // Total outstanding (issued invoices minus payments)
    const outstandingResult = await this.databaseService.queryOne<{ total: number }>(
      `
      SELECT COALESCE(SUM(i.amount - COALESCE(p.total_paid, 0)), 0) as total
      FROM finance_invoices i
      LEFT JOIN (
        SELECT invoice_id, SUM(amount) as total_paid
        FROM finance_payments
        WHERE tenant_id = $1
        GROUP BY invoice_id
      ) p ON i.id = p.invoice_id
      WHERE i.tenant_id = $1
        AND i.issue_date >= $2
        AND i.issue_date <= $3
        AND i.status IN ('ISSUED', 'PARTIAL')
      `,
      [tenantId, from, to],
    );

    // Total expenses
    const expensesResult = await this.databaseService.queryOne<{ total: number }>(
      `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM finance_expenses
      WHERE tenant_id = $1
        AND incurred_on >= $2
        AND incurred_on <= $3
      `,
      [tenantId, from, to],
    );

    // Expenses by category
    const expensesByCategory = await this.databaseService.query<{ category: string; total: number }>(
      `
      SELECT category, COALESCE(SUM(amount), 0) as total
      FROM finance_expenses
      WHERE tenant_id = $1
        AND incurred_on >= $2
        AND incurred_on <= $3
      GROUP BY category
      `,
      [tenantId, from, to],
    );

    const expensesByCategoryMap: Record<string, number> = {};
    expensesByCategory.forEach((e) => {
      expensesByCategoryMap[e.category] = e.total;
    });

    const totalRevenue = revenueResult?.total ?? 0;
    const totalPaid = paidResult?.total ?? 0;
    const totalOutstanding = outstandingResult?.total ?? 0;
    const totalExpenses = expensesResult?.total ?? 0;
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalOutstanding,
      totalPaid,
      totalExpenses,
      netProfit,
      expensesByCategory: expensesByCategoryMap,
    };
  }
}

