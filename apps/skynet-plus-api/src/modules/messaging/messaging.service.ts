import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MessagingRepository, OrgThreadRecord } from './messaging.repository';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ThreadFiltersDto } from './dto/thread-filters.dto';
import { RosterRepository, RosterSortieRecord } from '../roster/roster.repository';
import { FleetRepository } from '../fleet/fleet.repository';
import { TrainingRepository } from '../training/training.repository';
import { MaverickSyncRepository } from '../maverick-sync/maverick-sync.repository';
import { UserRole } from '../../core/users/user.types';
import { OPS_FULL_ROLES, THREAD_CREATOR_ROLES } from '../../common/auth/role-groups';

interface CurrentUserContext {
  id: string;
  role: UserRole;
}

@Injectable()
export class MessagingService {
  private readonly defaultMessageHistoryLimit = 50;

  constructor(
    private readonly repository: MessagingRepository,
    private readonly rosterRepository: RosterRepository,
    private readonly fleetRepository: FleetRepository,
    private readonly trainingRepository: TrainingRepository,
    private readonly maverickSyncRepository: MaverickSyncRepository,
  ) {}

  async createThread(
    tenantId: string,
    dto: CreateThreadDto,
    createdByUser: CurrentUserContext,
  ) {
    // Validate linked entities exist
    if (dto.sortieId) {
      await this.assertSortieAccess(tenantId, dto.sortieId, createdByUser);
    }

    if (dto.aircraftId) {
      const aircraft = await this.fleetRepository.getAircraftById(tenantId, dto.aircraftId);
      if (!aircraft) {
        throw new NotFoundException(`Aircraft with id '${dto.aircraftId}' not found`);
      }
    }

    if (dto.studentProfileId) {
      const student = await this.trainingRepository.getStudentProfileById(
        tenantId,
        dto.studentProfileId,
      );
      if (!student) {
        throw new NotFoundException(`Student profile with id '${dto.studentProfileId}' not found`);
      }
      if (
        createdByUser.role === 'STUDENT' &&
        student.userId !== createdByUser.id
      ) {
        throw new ForbiddenException('You can only create threads for your own student profile');
      }
    }

    const thread = await this.repository.createThread(tenantId, {
      type: dto.type,
      title: dto.title,
      sortieId: dto.sortieId ?? null,
      aircraftId: dto.aircraftId ?? null,
      studentProfileId: dto.studentProfileId ?? null,
      createdByUserId: createdByUser.id,
    });

    return thread;
  }

  async getThreadById(tenantId: string, threadId: string, currentUser: CurrentUserContext) {
    const thread = await this.repository.getThreadById(tenantId, threadId);
    if (!thread) {
      throw new NotFoundException(`Thread with id '${threadId}' not found`);
    }
    await this.assertThreadAccess(tenantId, thread, currentUser);
    return thread;
  }

  async listThreads(
    tenantId: string,
    filters: ThreadFiltersDto,
    currentUser: CurrentUserContext,
  ) {
    const threads = await this.repository.listThreads(tenantId, {
      type: filters.type,
      sortieId: filters.sortieId,
      aircraftId: filters.aircraftId,
      studentProfileId: filters.studentProfileId,
    });

    if (THREAD_CREATOR_ROLES.includes(currentUser.role)) {
      return threads;
    }

    const studentProfileId =
      currentUser.role === 'STUDENT'
        ? await this.tryGetStudentProfileId(tenantId, currentUser.id)
        : null;

    const visibleThreads = [];
    for (const thread of threads) {
      if (
        await this.canAccessThread(tenantId, thread, currentUser, studentProfileId)
      ) {
        visibleThreads.push(thread);
      }
    }
    return visibleThreads;
  }

  async openOrCreateSortieThread(
    tenantId: string,
    sortieId: string,
    user: CurrentUserContext,
  ) {
    await this.assertSortieAccess(tenantId, sortieId, user);
    const { thread, messages } = await this.getOrCreateSortieThread(tenantId, sortieId, user.id);
    await this.assertThreadAccess(tenantId, thread, user);
    const latestMessages = messages.slice(
      Math.max(messages.length - this.defaultMessageHistoryLimit, 0),
    );
    return { thread, messages: latestMessages };
  }

  async createMessage(
    tenantId: string,
    threadId: string,
    dto: CreateMessageDto,
    sender: CurrentUserContext,
  ) {
    // Verify thread exists
    const thread = await this.repository.getThreadById(tenantId, threadId);
    if (!thread) {
      throw new NotFoundException(`Thread with id '${threadId}' not found`);
    }
    await this.assertThreadAccess(tenantId, thread, sender);

    const message = await this.repository.createMessage(tenantId, threadId, {
      senderUserId: sender.id,
      body: dto.body,
    });

    // Create Maverick sync event if thread is linked to a sortie and student has Maverick
    if (thread.type === 'SORTIE' && thread.sortieId) {
      await this.maverickSyncRepository.createEvent(tenantId, {
        eventType: 'MESSAGE_CREATED',
        entityType: 'MESSAGE',
        entityId: message.id,
        payload: {
          messageId: message.id,
          threadId: thread.id,
          threadType: thread.type,
          sortieId: thread.sortieId,
          studentProfileId: thread.studentProfileId,
          aircraftId: thread.aircraftId,
          senderUserId: sender.id,
          createdAt: message.createdAt,
          bodyPreview: message.body.substring(0, 120),
        },
      });
    }

    return message;
  }

  async listMessages(tenantId: string, threadId: string, currentUser: CurrentUserContext) {
    // Verify thread exists
    const thread = await this.repository.getThreadById(tenantId, threadId);
    if (!thread) {
      throw new NotFoundException(`Thread with id '${threadId}' not found`);
    }
    await this.assertThreadAccess(tenantId, thread, currentUser);

    return this.repository.listMessages(tenantId, threadId);
  }

  private async getOrCreateSortieThread(
    tenantId: string,
    sortieId: string,
    createdByUserId: string,
  ) {
    const sortie = await this.rosterRepository.getSortieById(tenantId, sortieId);
    if (!sortie) {
      throw new NotFoundException(`Sortie with id '${sortieId}' not found`);
    }

    let thread = await this.repository.findThreadBySortie(tenantId, sortieId);

    if (!thread) {
      try {
        thread = await this.repository.createThread(tenantId, {
          type: 'SORTIE',
          title: `Sortie ${sortie.id}`,
          sortieId,
          aircraftId: sortie.aircraftId,
          studentProfileId: sortie.studentProfileId,
          createdByUserId,
        });
      } catch (error) {
        if (this.isUniqueViolation(error)) {
          thread = await this.repository.findThreadBySortie(tenantId, sortieId);
        } else {
          throw error;
        }
      }
    }

    const messages = await this.repository.listMessages(tenantId, thread.id);
    return { thread, messages };
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && (error as any).code === '23505';
  }

  private async tryGetStudentProfileId(tenantId: string, userId: string): Promise<string | null> {
    const profile = await this.trainingRepository.getStudentProfileByUserId(tenantId, userId);
    return profile ? profile.id : null;
  }

  private async assertThreadAccess(
    tenantId: string,
    thread: OrgThreadRecord,
    user: CurrentUserContext,
  ): Promise<void> {
    const allowed = await this.canAccessThread(tenantId, thread, user);
    if (!allowed) {
      throw new ForbiddenException('You are not allowed to access this thread');
    }
  }

  private async canAccessThread(
    tenantId: string,
    thread: OrgThreadRecord,
    user: CurrentUserContext,
    cachedStudentProfileId?: string | null,
  ): Promise<boolean> {
    if (THREAD_CREATOR_ROLES.includes(user.role)) {
      return true;
    }

    if (thread.createdByUserId === user.id) {
      return true;
    }

    if (thread.type === 'GENERAL') {
      // General threads restricted to ADMIN/OPS/creator
      return false;
    }

    if (user.role === 'INSTRUCTOR') {
      if (thread.type === 'SORTIE' && thread.sortieId) {
        const sortie = await this.rosterRepository.getSortieById(tenantId, thread.sortieId);
        if (sortie && sortie.instructorUserId === user.id) {
          return true;
        }
      }
      if (thread.type === 'AIRCRAFT' && thread.aircraftId) {
        // Allow instructors to see aircraft threads to facilitate mx discussions
        return true;
      }
      if (thread.type === 'STUDENT' && thread.studentProfileId) {
        // Instructors can see student threads only if they created them (already handled)
        return false;
      }
      return false;
    }

    if (user.role === 'STUDENT') {
      const studentProfileId =
        cachedStudentProfileId !== undefined
          ? cachedStudentProfileId
          : await this.tryGetStudentProfileId(tenantId, user.id);

      if (!studentProfileId) {
        return false;
      }

      if (thread.studentProfileId && thread.studentProfileId === studentProfileId) {
        return true;
      }

      if (thread.type === 'SORTIE' && thread.sortieId) {
        const sortie = await this.rosterRepository.getSortieById(tenantId, thread.sortieId);
        if (sortie && sortie.studentProfileId === studentProfileId) {
          return true;
        }
      }

      return false;
    }

    return false;
  }

  private async assertSortieAccess(
    tenantId: string,
    sortieId: string,
    user: CurrentUserContext,
  ): Promise<RosterSortieRecord> {
    const sortie = await this.rosterRepository.getSortieById(tenantId, sortieId);
    if (!sortie) {
      throw new NotFoundException(`Sortie with id '${sortieId}' not found`);
    }

    if (OPS_FULL_ROLES.includes(user.role) || user.role === 'SUPPORT_STAFF') {
      return sortie;
    }

    if (user.role === 'INSTRUCTOR' && sortie.instructorUserId === user.id) {
      return sortie;
    }

    if (user.role === 'STUDENT') {
      const profile = await this.trainingRepository.getStudentProfileByUserId(tenantId, user.id);
      if (!profile) {
        throw new NotFoundException(`Student profile for user '${user.id}' not found`);
      }
      if (sortie.studentProfileId === profile.id) {
        return sortie;
      }
    }

    throw new ForbiddenException('You are not allowed to access this sortie');
  }
}

