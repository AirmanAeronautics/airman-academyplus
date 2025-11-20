import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { IngestEnvironmentDto } from './dto/ingest-environment.dto';
import { EnvironmentQueryDto } from './dto/environment-query.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { OPS_FULL_ROLES } from '../../common/auth/role-groups';

@Controller('environment')
@UseGuards(RolesGuard)
export class EnvironmentController {
  constructor(private readonly environmentService: EnvironmentService) {}

  @Post('ingest')
  @Roles(...OPS_FULL_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async ingestEnvironment(
    @TenantId() tenantId: string,
    @Body() dto: IngestEnvironmentDto,
  ) {
    // For now, ingest with tenantId = null (global WX data)
    // In the future, we might allow tenant-specific enrichments
    return this.environmentService.upsertSnapshot(null, dto);
  }

  @Get('latest')
  @Roles(...OPS_FULL_ROLES, 'INSTRUCTOR', 'STUDENT')
  async getLatestSnapshot(
    @TenantId() tenantId: string,
    @Query() query: EnvironmentQueryDto,
  ) {
    return this.environmentService.getLatestSnapshot(query.airportIcao, tenantId);
  }

  @Get('history')
  @Roles(...OPS_FULL_ROLES, 'INSTRUCTOR', 'STUDENT')
  async getHistory(
    @TenantId() tenantId: string,
    @Query() query: EnvironmentQueryDto,
  ) {
    const from = query.from ? new Date(query.from) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days
    const to = query.to ? new Date(query.to) : new Date();

    return this.environmentService.getSnapshotsInRange(query.airportIcao, from, to, tenantId);
  }
}
