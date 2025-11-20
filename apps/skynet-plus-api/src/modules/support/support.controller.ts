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
} from '@nestjs/common';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { TicketFiltersDto } from './dto/ticket-filters.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SUPPORT_MANAGEMENT_ROLES } from '../../common/auth/role-groups';

@Controller('support')
@UseGuards(RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  @HttpCode(HttpStatus.CREATED)
  async createTicket(
    @TenantId() tenantId: string,
    @Body() dto: CreateTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.supportService.createTicket(tenantId, dto, user.id);
  }

  @Get('tickets')
  @Roles(...SUPPORT_MANAGEMENT_ROLES)
  async listTickets(
    @TenantId() tenantId: string,
    @Query() filters: TicketFiltersDto,
    @CurrentUser() user: any,
  ) {
    return this.supportService.listTickets(tenantId, filters, user.role, user.id);
  }

  @Get('tickets/mine')
  async getMyTickets(@TenantId() tenantId: string, @CurrentUser() user: any) {
    return this.supportService.getMyTickets(tenantId, user.id);
  }

  @Patch('tickets/:id')
  @Roles(...SUPPORT_MANAGEMENT_ROLES)
  async updateTicket(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: any,
  ) {
    return this.supportService.updateTicket(tenantId, id, dto, user.role);
  }

  @Post('tickets/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  async createMessage(
    @TenantId() tenantId: string,
    @Param('id') ticketId: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.supportService.createMessage(tenantId, ticketId, dto, user.id);
  }

  @Get('tickets/:id/messages')
  async listMessages(
    @TenantId() tenantId: string,
    @Param('id') ticketId: string,
    @CurrentUser() user: any,
  ) {
    return this.supportService.listMessages(tenantId, ticketId, user.id);
  }
}

