import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { OpsOverviewService } from './ops-overview.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';
import { OPS_FULL_ROLES } from '../../common/auth/role-groups';

class OpsSummaryQueryDto {
  @IsDateString()
  @IsNotEmpty()
  date: string;
}

class OpsSummaryRangeQueryDto {
  @IsDateString()
  @IsNotEmpty()
  from: string;

  @IsDateString()
  @IsNotEmpty()
  to: string;
}

class OpsUtilizationQueryDto {
  @IsString()
  @IsNotEmpty()
  airportIcao: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}

@Controller('ops')
@UseGuards(RolesGuard)
export class OpsOverviewController {
  constructor(private readonly opsOverviewService: OpsOverviewService) {}

  @Get('summary')
  @Roles(...OPS_FULL_ROLES)
  async getDailySummary(
    @TenantId() tenantId: string,
    @Query() query: OpsSummaryQueryDto,
  ) {
    return this.opsOverviewService.getDailySummary(tenantId, query.date);
  }

  @Get('summary/range')
  @Roles(...OPS_FULL_ROLES)
  async getSummaryRange(
    @TenantId() tenantId: string,
    @Query() query: OpsSummaryRangeQueryDto,
  ) {
    return this.opsOverviewService.getSummaryRange(tenantId, query.from, query.to);
  }

  @Get('utilization')
  @Roles(...OPS_FULL_ROLES)
  async getUtilization(
    @TenantId() tenantId: string,
    @Query() query: OpsUtilizationQueryDto,
  ) {
    return this.opsOverviewService.getUtilizationByAirport(
      tenantId,
      query.airportIcao,
      query.date,
    );
  }
}

