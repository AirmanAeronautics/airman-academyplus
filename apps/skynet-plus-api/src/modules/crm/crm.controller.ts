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
import { CrmService } from './crm.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { LeadFiltersDto } from './dto/lead-filters.dto';
import { CreateMarketingSourceDto } from './dto/create-marketing-source.dto';
import { UpdateMarketingSourceDto } from './dto/update-marketing-source.dto';
import { MarketingSourceFiltersDto } from './dto/marketing-source-filters.dto';
import { CreateLeadAssignmentDto } from './dto/create-lead-assignment.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CRM_ROLES } from '../../common/auth/role-groups';

@Controller('crm')
@UseGuards(RolesGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('leads')
  @Roles(...CRM_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createLead(@TenantId() tenantId: string, @Body() dto: CreateLeadDto) {
    return this.crmService.createLead(tenantId, dto);
  }

  @Get('leads')
  @Roles(...CRM_ROLES)
  async listLeads(@TenantId() tenantId: string, @Query() filters: LeadFiltersDto) {
    return this.crmService.listLeads(tenantId, filters);
  }

  @Get('leads/:id')
  @Roles(...CRM_ROLES)
  async getLead(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.crmService.getLeadById(tenantId, id);
  }

  @Patch('leads/:id')
  @Roles(...CRM_ROLES)
  async updateLead(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
  ) {
    return this.crmService.updateLead(tenantId, id, dto);
  }

  @Post('leads/:id/activities')
  @Roles(...CRM_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createActivity(
    @TenantId() tenantId: string,
    @Param('id') leadId: string,
    @Body() dto: CreateActivityDto,
    @CurrentUser() user: any,
  ) {
    return this.crmService.createActivity(tenantId, leadId, dto, user.id);
  }

  @Get('leads/:id/activities')
  @Roles(...CRM_ROLES)
  async listActivities(@TenantId() tenantId: string, @Param('id') leadId: string) {
    return this.crmService.listActivities(tenantId, leadId);
  }

  @Post('campaigns')
  @Roles(...CRM_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createCampaign(@TenantId() tenantId: string, @Body() dto: CreateCampaignDto) {
    return this.crmService.createCampaign(tenantId, dto);
  }

  @Get('campaigns')
  @Roles(...CRM_ROLES)
  async listCampaigns(@TenantId() tenantId: string) {
    return this.crmService.listCampaigns(tenantId);
  }

  @Patch('campaigns/:id')
  @Roles(...CRM_ROLES)
  async updateCampaign(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.crmService.updateCampaign(tenantId, id, dto);
  }

  @Post('campaigns/:id/attach-lead/:leadId')
  @Roles(...CRM_ROLES)
  @HttpCode(HttpStatus.OK)
  async attachLeadToCampaign(
    @TenantId() tenantId: string,
    @Param('id') campaignId: string,
    @Param('leadId') leadId: string,
  ) {
    await this.crmService.attachLeadToCampaign(tenantId, campaignId, leadId);
    return { message: 'Lead attached to campaign successfully' };
  }

  // ===========================
  // Marketing Sources
  // ===========================

  @Post('marketing-sources')
  @Roles(...CRM_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createMarketingSource(
    @TenantId() tenantId: string,
    @Body() dto: CreateMarketingSourceDto,
  ) {
    return this.crmService.createMarketingSource(tenantId, dto);
  }

  @Get('marketing-sources')
  @Roles(...CRM_ROLES)
  async listMarketingSources(
    @TenantId() tenantId: string,
    @Query() filters: MarketingSourceFiltersDto,
  ) {
    return this.crmService.listMarketingSources(tenantId, filters);
  }

  @Get('marketing-sources/:id')
  @Roles(...CRM_ROLES)
  async getMarketingSource(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.crmService.getMarketingSourceById(tenantId, id);
  }

  @Patch('marketing-sources/:id')
  @Roles(...CRM_ROLES)
  async updateMarketingSource(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMarketingSourceDto,
  ) {
    return this.crmService.updateMarketingSource(tenantId, id, dto);
  }

  // ===========================
  // Lead Assignments
  // ===========================

  @Post('leads/:id/assignments')
  @Roles(...CRM_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createLeadAssignment(
    @TenantId() tenantId: string,
    @Param('id') leadId: string,
    @Body() dto: CreateLeadAssignmentDto,
    @CurrentUser() user: any,
  ) {
    return this.crmService.createLeadAssignment(tenantId, leadId, dto, user.id);
  }

  @Get('leads/:id/assignments')
  @Roles(...CRM_ROLES)
  async listLeadAssignments(
    @TenantId() tenantId: string,
    @Param('id') leadId: string,
    @Query('isActive') isActive?: string,
  ) {
    const filters = isActive !== undefined ? { isActive: isActive === 'true' } : undefined;
    return this.crmService.listLeadAssignments(tenantId, leadId, filters);
  }

  @Get('leads/:id/assignments/active')
  @Roles(...CRM_ROLES)
  async getActiveAssignment(@TenantId() tenantId: string, @Param('id') leadId: string) {
    return this.crmService.getActiveAssignment(tenantId, leadId);
  }

  @Post('leads/:id/assignments/:assignmentId/unassign')
  @Roles(...CRM_ROLES)
  @HttpCode(HttpStatus.OK)
  async unassignLead(
    @TenantId() tenantId: string,
    @Param('id') leadId: string,
    @Param('assignmentId') assignmentId: string,
  ) {
    await this.crmService.unassignLead(tenantId, leadId, assignmentId);
    return { message: 'Lead unassigned successfully' };
  }
}

