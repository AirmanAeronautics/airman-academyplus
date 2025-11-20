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
import { ComplianceService } from './compliance.service';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { ComplianceFiltersDto } from './dto/compliance-filters.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';
import {
  COMPLIANCE_FULL_ROLES,
  COMPLIANCE_RECORD_LIST_ROLES,
  COMPLIANCE_RECORD_ROLES,
  COMPLIANCE_READ_ROLES,
} from '../../common/auth/role-groups';

class IncidentFiltersDto {
  @IsString()
  @IsOptional()
  @IsIn(['OPEN', 'INVESTIGATING', 'CLOSED'])
  status?: 'OPEN' | 'INVESTIGATING' | 'CLOSED';

  @IsString()
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsUUID()
  @IsOptional()
  linkedSortieId?: string;

  @IsUUID()
  @IsOptional()
  linkedAircraftId?: string;
}

@Controller('compliance')
@UseGuards(RolesGuard)
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Post('items')
  @Roles(...COMPLIANCE_FULL_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createItem(@TenantId() tenantId: string, @Body() dto: CreateItemDto) {
    return this.complianceService.createItem(tenantId, dto);
  }

  @Get('items')
  @Roles(...COMPLIANCE_READ_ROLES)
  async listItems(
    @TenantId() tenantId: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.complianceService.listItems(tenantId, activeOnly === 'true');
  }

  @Post('records')
  @Roles(...COMPLIANCE_RECORD_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createRecord(
    @TenantId() tenantId: string,
    @Body() dto: CreateRecordDto,
    @CurrentUser() user: any,
  ) {
    return this.complianceService.createRecord(tenantId, dto, user.id);
  }

  @Get('records')
  @Roles(...COMPLIANCE_RECORD_LIST_ROLES)
  async listRecords(@TenantId() tenantId: string, @Query() filters: ComplianceFiltersDto) {
    return this.complianceService.listRecords(tenantId, filters);
  }

  @Post('incidents')
  @Roles(...COMPLIANCE_RECORD_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createIncident(
    @TenantId() tenantId: string,
    @Body() dto: CreateIncidentDto,
    @CurrentUser() user: any,
  ) {
    return this.complianceService.createIncident(tenantId, dto, user.id);
  }

  @Get('incidents')
  @Roles(...COMPLIANCE_RECORD_LIST_ROLES)
  async listIncidents(
    @TenantId() tenantId: string,
    @Query() filters: IncidentFiltersDto,
  ) {
    return this.complianceService.listIncidents(tenantId, {
      status: filters.status,
      severity: filters.severity,
      linkedSortieId: filters.linkedSortieId,
      linkedAircraftId: filters.linkedAircraftId,
    });
  }

  @Patch('incidents/:id/status')
  @Roles(...COMPLIANCE_FULL_ROLES)
  async updateIncidentStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIncidentStatusDto,
  ) {
    return this.complianceService.updateIncidentStatus(tenantId, id, dto);
  }
}

