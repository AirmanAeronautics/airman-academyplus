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
import { MessagingService } from './messaging.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ThreadFiltersDto } from './dto/thread-filters.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { USER_ROLES } from '../../core/users/user.types';
import { SORTIE_THREAD_ROLES, THREAD_CREATOR_ROLES } from '../../common/auth/role-groups';

@Controller('messaging')
@UseGuards(RolesGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('threads')
  @Roles(...THREAD_CREATOR_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createThread(
    @TenantId() tenantId: string,
    @Body() dto: CreateThreadDto,
    @CurrentUser() user: any,
  ) {
    return this.messagingService.createThread(tenantId, dto, user);
  }

  @Post('threads/sortie/:sortieId/open-or-create')
  @Roles(...SORTIE_THREAD_ROLES)
  async openOrCreateSortieThread(
    @TenantId() tenantId: string,
    @Param('sortieId') sortieId: string,
    @CurrentUser() user: any,
  ) {
    return this.messagingService.openOrCreateSortieThread(tenantId, sortieId, user);
  }

  @Get('threads')
  @Roles(...USER_ROLES)
  async listThreads(
    @TenantId() tenantId: string,
    @Query() filters: ThreadFiltersDto,
    @CurrentUser() user: any,
  ) {
    return this.messagingService.listThreads(tenantId, filters, user);
  }

  @Get('threads/:id')
  @Roles(...USER_ROLES)
  async getThread(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.messagingService.getThreadById(tenantId, id, user);
  }

  @Post('threads/:id/messages')
  @Roles(...USER_ROLES)
  @HttpCode(HttpStatus.CREATED)
  async createMessage(
    @TenantId() tenantId: string,
    @Param('id') threadId: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: any,
  ) {
    return this.messagingService.createMessage(tenantId, threadId, dto, user);
  }

  @Get('threads/:id/messages')
  @Roles(...USER_ROLES)
  async listMessages(
    @TenantId() tenantId: string,
    @Param('id') threadId: string,
    @CurrentUser() user: any,
  ) {
    return this.messagingService.listMessages(tenantId, threadId, user);
  }
}

