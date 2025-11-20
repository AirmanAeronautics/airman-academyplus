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
import { RosterService } from './roster.service';
import { CreateSortieDto } from './dto/create-sortie.dto';
import { UpdateSortieStatusDto } from './dto/update-sortie-status.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TrainingService } from '../training/training.service';
import { OPS_FULL_ROLES } from '../../common/auth/role-groups';

@Controller('roster')
@UseGuards(RolesGuard)
export class RosterController {
  constructor(
    private readonly rosterService: RosterService,
    private readonly trainingService: TrainingService,
  ) {}

  @Post('sorties')
  @Roles(...OPS_FULL_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createSortie(
    @TenantId() tenantId: string,
    @Body() dto: CreateSortieDto,
    @CurrentUser() user: any,
  ) {
    return this.rosterService.createSortie(tenantId, dto, user.id);
  }

  @Patch('sorties/:id/status')
  @Roles(...OPS_FULL_ROLES, 'INSTRUCTOR')
  async updateSortieStatus(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateSortieStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.rosterService.updateSortieStatus(tenantId, id, dto, user);
  }

  @Get('sorties/me/instructor')
  @Roles('INSTRUCTOR')
  async getMySortiesAsInstructor(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.rosterService.listSortiesForInstructor(tenantId, user.id, from, to);
  }

  @Get('sorties/me/student')
  @Roles('STUDENT')
  async getMySortiesAsStudent(
    @TenantId() tenantId: string,
    @CurrentUser() user: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    // Resolve student profile ID for current user
    const profile = await this.trainingService.getStudentProfileByUserId(tenantId, user.id);
    return this.rosterService.listSortiesForStudent(tenantId, profile.id, from, to);
  }

  @Get('sorties/ops')
  @Roles(...OPS_FULL_ROLES)
  async getSortiesForOps(
    @TenantId() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: string,
    @Query('aircraftId') aircraftId?: string,
    @Query('instructorUserId') instructorUserId?: string,
  ) {
    return this.rosterService.listSortiesForOps(tenantId, {
      from,
      to,
      status,
      aircraftId,
      instructorUserId,
    });
  }
}
