import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { MaverickSyncService } from './maverick-sync.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { IsString, IsOptional, IsIn } from 'class-validator';
import { OPS_FULL_ROLES } from '../../common/auth/role-groups';

class MaverickEventsQueryDto {
  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'SENT', 'FAILED'])
  status?: 'PENDING' | 'SENT' | 'FAILED';

  @IsString()
  @IsOptional()
  since?: string; // ISO date string
}

@Controller('maverick')
@UseGuards(RolesGuard)
export class MaverickSyncController {
  constructor(private readonly maverickSyncService: MaverickSyncService) {}

  @Get('events')
  @Roles(...OPS_FULL_ROLES)
  async listEvents(
    @TenantId() tenantId: string,
    @Query() query: MaverickEventsQueryDto,
  ) {
    return this.maverickSyncService.listEvents(tenantId, query.status, query.since);
  }

  @Post('events/:id/ack')
  @Roles(...OPS_FULL_ROLES)
  async acknowledgeEvent(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.maverickSyncService.acknowledgeEvent(tenantId, id);
  }
}

