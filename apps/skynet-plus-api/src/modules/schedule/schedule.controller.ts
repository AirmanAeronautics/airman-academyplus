import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { SetInstructorBlocksDto } from './dto/set-instructor-blocks.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OPS_FULL_ROLES } from '../../common/auth/role-groups';

@Controller('schedule')
@UseGuards(RolesGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post('blocks')
  @Roles(...OPS_FULL_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createBlock(@TenantId() tenantId: string, @Body() dto: CreateBlockDto) {
    return this.scheduleService.createBlock(tenantId, dto);
  }

  @Get('blocks')
  @Roles(...OPS_FULL_ROLES, 'INSTRUCTOR', 'STUDENT')
  async listBlocks(@TenantId() tenantId: string) {
    return this.scheduleService.listBlocks(tenantId);
  }

  @Get('blocks/:id')
  @Roles(...OPS_FULL_ROLES, 'INSTRUCTOR', 'STUDENT')
  async getBlock(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.scheduleService.getBlockById(tenantId, id);
  }

  @Put('blocks/:id')
  @Roles(...OPS_FULL_ROLES)
  async updateBlock(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBlockDto,
  ) {
    return this.scheduleService.updateBlock(tenantId, id, dto);
  }

  @Delete('blocks/:id')
  @Roles(...OPS_FULL_ROLES)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlock(@TenantId() tenantId: string, @Param('id') id: string) {
    await this.scheduleService.deleteBlock(tenantId, id);
  }

  @Post('instructors/:instructorUserId/daily')
  @Roles(...OPS_FULL_ROLES, 'INSTRUCTOR')
  @HttpCode(HttpStatus.OK)
  async setInstructorDailySchedule(
    @TenantId() tenantId: string,
    @Param('instructorUserId') instructorUserId: string,
    @Body() dto: SetInstructorBlocksDto,
    @CurrentUser() user: any,
  ) {
    return this.scheduleService.setInstructorDailySchedule(
      tenantId,
      instructorUserId,
      dto,
      user.id,
      user.role,
    );
  }

  @Get('instructors/:instructorUserId/daily')
  @Roles(...OPS_FULL_ROLES, 'INSTRUCTOR', 'STUDENT')
  async getInstructorDailySchedule(
    @TenantId() tenantId: string,
    @Param('instructorUserId') instructorUserId: string,
    @Query('date') date: string,
  ) {
    return this.scheduleService.getInstructorDailySchedule(tenantId, instructorUserId, date);
  }
}

