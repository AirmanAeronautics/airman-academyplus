import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FinanceRepository } from './finance.repository';
import { CreateFeePlanDto } from './dto/create-fee-plan.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { FinanceFiltersDto } from './dto/finance-filters.dto';
import { TrainingRepository } from '../training/training.repository';

@Injectable()
export class FinanceService {
  constructor(
    private readonly repository: FinanceRepository,
    private readonly trainingRepository: TrainingRepository,
  ) {}

  async createFeePlan(tenantId: string, dto: CreateFeePlanDto) {
    // Validate program exists if provided
    if (dto.programId) {
      const program = await this.trainingRepository.getProgramById(tenantId, dto.programId);
      if (!program) {
        throw new NotFoundException(`Program with id '${dto.programId}' not found`);
      }
    }

    return this.repository.createFeePlan(tenantId, {
      name: dto.name,
      programId: dto.programId ?? null,
      currency: dto.currency ?? 'INR',
      amount: dto.amount,
      billingType: dto.billingType,
    });
  }

  async listFeePlans(tenantId: string) {
    return this.repository.listFeePlans(tenantId);
  }

  async createInvoice(tenantId: string, dto: CreateInvoiceDto) {
    // Validate student profile exists
    const student = await this.trainingRepository.getStudentProfileById(
      tenantId,
      dto.studentProfileId,
    );
    if (!student) {
      throw new NotFoundException(`Student profile with id '${dto.studentProfileId}' not found`);
    }

    // Validate fee plan exists if provided
    if (dto.feePlanId) {
      const feePlans = await this.repository.listFeePlans(tenantId);
      const feePlan = feePlans.find((fp) => fp.id === dto.feePlanId);
      if (!feePlan) {
        throw new NotFoundException(`Fee plan with id '${dto.feePlanId}' not found`);
      }
    }

    return this.repository.createInvoice(tenantId, {
      studentProfileId: dto.studentProfileId,
      feePlanId: dto.feePlanId ?? null,
      invoiceNumber: dto.invoiceNumber,
      issueDate: new Date(dto.issueDate),
      dueDate: new Date(dto.dueDate),
      currency: dto.currency ?? 'INR',
      amount: dto.amount,
      notes: dto.notes ?? null,
    });
  }

  async updateInvoiceStatus(tenantId: string, invoiceId: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.repository.getInvoiceById(tenantId, invoiceId);
    if (!invoice) {
      throw new NotFoundException(`Invoice with id '${invoiceId}' not found`);
    }

    return this.repository.updateInvoiceStatus(tenantId, invoiceId, dto.status);
  }

  async getInvoiceById(tenantId: string, invoiceId: string) {
    const invoice = await this.repository.getInvoiceById(tenantId, invoiceId);
    if (!invoice) {
      throw new NotFoundException(`Invoice with id '${invoiceId}' not found`);
    }
    return invoice;
  }

  async listInvoices(tenantId: string, filters: FinanceFiltersDto) {
    return this.repository.listInvoices(tenantId, {
      status: filters.status,
      studentProfileId: filters.studentProfileId,
      from: filters.from ? new Date(filters.from) : undefined,
      to: filters.to ? new Date(filters.to) : undefined,
    });
  }

  async recordPayment(
    tenantId: string,
    invoiceId: string,
    dto: RecordPaymentDto,
  ) {
    const invoice = await this.repository.getInvoiceById(tenantId, invoiceId);
    if (!invoice) {
      throw new NotFoundException(`Invoice with id '${invoiceId}' not found`);
    }

    if (invoice.status === 'VOID') {
      throw new ForbiddenException('Cannot record payment for voided invoice');
    }

    return this.repository.recordPayment(tenantId, invoiceId, {
      paymentDate: new Date(dto.paymentDate),
      amount: dto.amount,
      method: dto.method,
      reference: dto.reference ?? null,
    });
  }

  async listPayments(tenantId: string, invoiceId: string) {
    const invoice = await this.repository.getInvoiceById(tenantId, invoiceId);
    if (!invoice) {
      throw new NotFoundException(`Invoice with id '${invoiceId}' not found`);
    }

    return this.repository.listPayments(tenantId, invoiceId);
  }

  async createExpense(tenantId: string, dto: CreateExpenseDto) {
    return this.repository.createExpense(tenantId, {
      category: dto.category,
      amount: dto.amount,
      currency: dto.currency ?? 'INR',
      incurredOn: new Date(dto.incurredOn),
      notes: dto.notes ?? null,
    });
  }

  async listExpenses(tenantId: string, filters: { category?: string; from?: string; to?: string }) {
    return this.repository.listExpenses(tenantId, {
      category: filters.category,
      from: filters.from ? new Date(filters.from) : undefined,
      to: filters.to ? new Date(filters.to) : undefined,
    });
  }

  async getSummary(tenantId: string, from: string, to: string) {
    return this.repository.computeSummary(tenantId, new Date(from), new Date(to));
  }
}

