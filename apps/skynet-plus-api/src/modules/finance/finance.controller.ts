import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateFeePlanDto } from './dto/create-fee-plan.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceStatusDto } from './dto/update-invoice-status.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { FinanceFiltersDto } from './dto/finance-filters.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TrainingService } from '../training/training.service';
import { FINANCE_ROLES } from '../../common/auth/role-groups';

@Controller('finance')
@UseGuards(RolesGuard)
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly trainingService: TrainingService,
  ) {}

  @Post('fee-plans')
  @Roles(...FINANCE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createFeePlan(@TenantId() tenantId: string, @Body() dto: CreateFeePlanDto) {
    return this.financeService.createFeePlan(tenantId, dto);
  }

  @Get('fee-plans')
  @Roles(...FINANCE_ROLES)
  async listFeePlans(@TenantId() tenantId: string) {
    return this.financeService.listFeePlans(tenantId);
  }

  @Post('invoices')
  @Roles(...FINANCE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createInvoice(@TenantId() tenantId: string, @Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(tenantId, dto);
  }

  @Get('invoices')
  @Roles(...FINANCE_ROLES, 'STUDENT')
  async listInvoices(
    @TenantId() tenantId: string,
    @Query() filters: FinanceFiltersDto,
    @CurrentUser() user: any,
  ) {
    // Students can only see their own invoices
    if (user.role === 'STUDENT') {
      const profile = await this.trainingService.getStudentProfileByUserId(tenantId, user.id);
      return this.financeService.listInvoices(tenantId, {
        ...filters,
        studentProfileId: profile.id,
      });
    }

    return this.financeService.listInvoices(tenantId, filters);
  }

  @Get('invoices/:id')
  @Roles(...FINANCE_ROLES, 'STUDENT')
  async getInvoice(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const invoice = await this.financeService.getInvoiceById(tenantId, id);

    // Students can only access their own invoices
    if (user.role === 'STUDENT') {
      const profile = await this.trainingService.getStudentProfileByUserId(tenantId, user.id);
      if (invoice.studentProfileId !== profile.id) {
        throw new ForbiddenException('You can only access your own invoices');
      }
    }

    return invoice;
  }

  @Patch('invoices/:id/status')
  @Roles(...FINANCE_ROLES)
  async updateInvoiceStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    return this.financeService.updateInvoiceStatus(tenantId, id, dto);
  }

  @Post('invoices/:id/payments')
  @Roles(...FINANCE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async recordPayment(
    @TenantId() tenantId: string,
    @Param('id') invoiceId: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.financeService.recordPayment(tenantId, invoiceId, dto);
  }

  @Get('invoices/:id/payments')
  @Roles(...FINANCE_ROLES, 'STUDENT')
  async listPayments(
    @TenantId() tenantId: string,
    @Param('id') invoiceId: string,
    @CurrentUser() user: any,
  ) {
    // Students can only see payments for their own invoices
    if (user.role === 'STUDENT') {
      const invoice = await this.financeService.getInvoiceById(tenantId, invoiceId);
      const profile = await this.trainingService.getStudentProfileByUserId(tenantId, user.id);
      if (invoice.studentProfileId !== profile.id) {
        throw new ForbiddenException('You can only access payments for your own invoices');
      }
    }

    return this.financeService.listPayments(tenantId, invoiceId);
  }

  @Post('expenses')
  @Roles(...FINANCE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createExpense(@TenantId() tenantId: string, @Body() dto: CreateExpenseDto) {
    return this.financeService.createExpense(tenantId, dto);
  }

  @Get('expenses')
  @Roles(...FINANCE_ROLES)
  async listExpenses(
    @TenantId() tenantId: string,
    @Query('category') category?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.financeService.listExpenses(tenantId, { category, from, to });
  }

  @Get('summary')
  @Roles(...FINANCE_ROLES)
  async getSummary(
    @TenantId() tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.financeService.getSummary(tenantId, from, to);
  }
}

