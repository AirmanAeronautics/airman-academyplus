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
import { AvailabilityService } from './availability.service';
import { UpsertAvailabilityDto } from './dto/availability-slot.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FLEET_MAINTENANCE_ROLES, FLEET_READ_ROLES, OPS_FULL_ROLES } from '../../common/auth/role-groups';

@Controller('availability')
@UseGuards(RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // ==================== Instructor Availability ====================

  @Post('instructors/me')
  @Roles('INSTRUCTOR')
  @HttpCode(HttpStatus.CREATED)
  async upsertMyAvailability(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Body() dto: UpsertAvailabilityDto,
  ) {
    return this.availabilityService.upsertInstructorAvailability(tenantId, user.id, dto);
  }

  @Get('instructors/me')
  @Roles('INSTRUCTOR')
  async getMyAvailability(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.availabilityService.listInstructorAvailability(tenantId, user.id, from, to);
  }

  @Get('instructors/:instructorUserId')
  @Roles(...OPS_FULL_ROLES)
  async getInstructorAvailability(
    @TenantId() tenantId: string,
    @Param('instructorUserId') instructorUserId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.availabilityService.listInstructorAvailability(
      tenantId,
      instructorUserId,
      from,
      to,
    );
  }

  // ==================== Aircraft Availability ====================

  @Post('aircraft/:aircraftId')
  @Roles(...FLEET_MAINTENANCE_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async upsertAircraftAvailability(
    @TenantId() tenantId: string,
    @Param('aircraftId') aircraftId: string,
    @Body() dto: UpsertAvailabilityDto,
  ) {
    return this.availabilityService.upsertAircraftAvailability(tenantId, aircraftId, dto);
  }

  @Get('aircraft/:aircraftId')
  @Roles(...FLEET_READ_ROLES)
  async getAircraftAvailability(
    @TenantId() tenantId: string,
    @Param('aircraftId') aircraftId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.availabilityService.listAircraftAvailability(tenantId, aircraftId, from, to);
  }
}
