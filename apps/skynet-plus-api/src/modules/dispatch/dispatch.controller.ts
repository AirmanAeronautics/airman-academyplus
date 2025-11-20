import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { UpsertDispatchAnnotationDto } from './dto/upsert-dispatch-annotation.dto';
import { DispatchDashboardQueryDto } from './dto/dispatch-dashboard-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OPS_FULL_ROLES } from '../../common/auth/role-groups';

@Controller('dispatch')
@UseGuards(RolesGuard)
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('sorties/:sortieId/annotate')
  @Roles(...OPS_FULL_ROLES)
  @HttpCode(HttpStatus.OK)
  async annotateSortie(
    @TenantId() tenantId: string,
    @Param('sortieId') sortieId: string,
    @Body() dto: UpsertDispatchAnnotationDto,
    @CurrentUser() user: any,
  ) {
    return this.dispatchService.upsertDispatchAnnotation(
      tenantId,
      sortieId,
      dto,
      user.id,
    );
  }

  @Get('sorties/:sortieId')
  @Roles(...OPS_FULL_ROLES, 'INSTRUCTOR', 'STUDENT')
  async getSortieWithDispatch(
    @TenantId() tenantId: string,
    @Param('sortieId') sortieId: string,
    @CurrentUser() user: any,
  ) {
    return this.dispatchService.getSortieWithDispatch(
      tenantId,
      sortieId,
      user.id,
      user.role,
    );
  }

  @Get('dashboard')
  @Roles(...OPS_FULL_ROLES)
  async getDispatchDashboard(
    @TenantId() tenantId: string,
    @Query() query: DispatchDashboardQueryDto,
  ) {
    const filters: {
      from?: Date;
      to?: Date;
      airportIcao?: string;
      riskLevel?: 'GREEN' | 'AMBER' | 'RED';
      status?: string;
    } = {};

    if (query.from) {
      filters.from = new Date(query.from);
    }

    if (query.to) {
      filters.to = new Date(query.to);
    }

    if (query.airportIcao) {
      filters.airportIcao = query.airportIcao;
    }

    if (query.riskLevel) {
      filters.riskLevel = query.riskLevel;
    }

    if (query.status) {
      filters.status = query.status;
    }

    return this.dispatchService.getDispatchDashboard(tenantId, filters);
  }
}
