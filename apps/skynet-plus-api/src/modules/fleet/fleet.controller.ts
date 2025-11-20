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
import { FleetService } from './fleet.service';
import { CreateAircraftDto } from './dto/create-aircraft.dto';
import { UpdateAircraftDto } from './dto/update-aircraft.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { FLEET_MAINTENANCE_ROLES, FLEET_READ_ROLES } from '../../common/auth/role-groups';

@Controller('fleet')
@UseGuards(RolesGuard)
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Post('aircraft')
  @Roles(...FLEET_MAINTENANCE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createAircraft(@TenantId() tenantId: string, @Body() dto: CreateAircraftDto) {
    return this.fleetService.createAircraft(tenantId, dto);
  }

  @Get('aircraft')
  @Roles(...FLEET_READ_ROLES)
  async listAircraft(
    @TenantId() tenantId: string,
    @Query('status') status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE',
  ) {
    return this.fleetService.listAircraft(tenantId, status);
  }

  @Get('aircraft/:id')
  @Roles(...FLEET_READ_ROLES)
  async getAircraftById(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.fleetService.getAircraftById(tenantId, id);
  }

  @Patch('aircraft/:id')
  @Roles(...FLEET_MAINTENANCE_ROLES)
  async updateAircraft(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateAircraftDto,
  ) {
    return this.fleetService.updateAircraft(tenantId, id, dto);
  }
}
