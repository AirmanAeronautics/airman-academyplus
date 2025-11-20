import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RosterRepository } from './roster.repository';
import { CreateSortieDto } from './dto/create-sortie.dto';
import { UpdateSortieStatusDto } from './dto/update-sortie-status.dto';
import { TrainingRepository } from '../training/training.repository';
import { FleetRepository } from '../fleet/fleet.repository';
import { UserRepository } from '../../core/users/user.repository';
import { MaverickSyncRepository } from '../maverick-sync/maverick-sync.repository';

@Injectable()
export class RosterService {
  constructor(
    private readonly repository: RosterRepository,
    private readonly trainingRepository: TrainingRepository,
    private readonly fleetRepository: FleetRepository,
    private readonly userRepository: UserRepository,
    private readonly maverickSyncRepository: MaverickSyncRepository,
  ) {}

  async createSortie(tenantId: string, dto: CreateSortieDto, createdByUserId: string) {
    // Validate all entities exist and belong to tenant
    const studentProfile = await this.trainingRepository.getStudentProfileById(
      tenantId,
      dto.studentProfileId,
    );
    if (!studentProfile) {
      throw new NotFoundException(`Student profile with id '${dto.studentProfileId}' not found`);
    }

    const instructor = await this.userRepository.findById(tenantId, dto.instructorUserId);
    if (!instructor) {
      throw new NotFoundException(`Instructor with id '${dto.instructorUserId}' not found`);
    }

    const aircraft = await this.fleetRepository.getAircraftById(tenantId, dto.aircraftId);
    if (!aircraft) {
      throw new NotFoundException(`Aircraft with id '${dto.aircraftId}' not found`);
    }

    const program = await this.trainingRepository.getProgramById(tenantId, dto.programId);
    if (!program) {
      throw new NotFoundException(`Program with id '${dto.programId}' not found`);
    }

    const lesson = await this.trainingRepository.getLessonById(tenantId, dto.lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson with id '${dto.lessonId}' not found`);
    }

    // Verify lesson belongs to program
    if (lesson.programId !== dto.programId) {
      throw new ForbiddenException('Lesson does not belong to the specified program');
    }

    const sortie = await this.repository.createSortie(
      tenantId,
      {
        studentProfileId: dto.studentProfileId,
        instructorUserId: dto.instructorUserId,
        aircraftId: dto.aircraftId,
        programId: dto.programId,
        lessonId: dto.lessonId,
        airportIcao: dto.airportIcao,
        reportTime: new Date(dto.reportTime),
        dispatchNotes: dto.dispatchNotes,
      },
      createdByUserId,
    );

    // Create Maverick sync event
    await this.maverickSyncRepository.createEvent(tenantId, {
      eventType: 'SORTIE_SCHEDULED',
      entityType: 'SORTIE',
      entityId: sortie.id,
      payload: {
        sortieId: sortie.id,
        studentProfileId: sortie.studentProfileId,
        instructorUserId: sortie.instructorUserId,
        aircraftId: sortie.aircraftId,
        airportIcao: sortie.airportIcao,
        reportTime: sortie.reportTime,
        status: sortie.status,
        dispatchNotes: sortie.dispatchNotes ?? null,
      },
    });

    return sortie;
  }

  async updateSortieStatus(
    tenantId: string,
    sortieId: string,
    dto: UpdateSortieStatusDto,
    currentUser: any,
  ) {
    // Get existing sortie
    const sorties = await this.repository.listSortiesForOps(tenantId, {});
    const sortie = sorties.find((s) => s.id === sortieId);

    if (!sortie) {
      throw new NotFoundException(`Sortie with id '${sortieId}' not found`);
    }

    // Role-based status transition rules
    if (currentUser.role === 'INSTRUCTOR') {
      // Instructors can only update their own sorties
      if (sortie.instructorUserId !== currentUser.id) {
        throw new ForbiddenException('You can only update your own sorties');
      }

      // Instructors can only move through: SCHEDULED → DISPATCHED → IN_FLIGHT → COMPLETED
      const allowedTransitions: Record<string, string[]> = {
        SCHEDULED: ['DISPATCHED', 'CANCELLED'],
        DISPATCHED: ['IN_FLIGHT', 'CANCELLED'],
        IN_FLIGHT: ['COMPLETED'],
        COMPLETED: [],
        CANCELLED: [],
        NO_SHOW: [],
      };

      const allowed = allowedTransitions[sortie.status] || [];
      if (!allowed.includes(dto.status)) {
        throw new ForbiddenException(
          `Cannot transition from ${sortie.status} to ${dto.status}. Allowed: ${allowed.join(', ')}`,
        );
      }
    }
    // ADMIN and OPS can set any status

    const updatedSortie = await this.repository.updateSortieStatus(
      tenantId,
      sortieId,
      dto.status,
      dto.dispatchNotes,
    );

    // Create Maverick sync event for status changes
    const eventPayload = {
      sortieId,
      studentProfileId: sortie.studentProfileId,
      instructorUserId: sortie.instructorUserId,
      aircraftId: sortie.aircraftId,
      previousStatus: sortie.status,
      newStatus: dto.status,
      reportTime: updatedSortie.reportTime,
      dispatchNotes: updatedSortie.dispatchNotes ?? null,
    };

    if (dto.status === 'CANCELLED') {
      await this.maverickSyncRepository.createEvent(tenantId, {
        eventType: 'SORTIE_CANCELLED',
        entityType: 'SORTIE',
        entityId: sortieId,
        payload: eventPayload,
      });
    } else {
      await this.maverickSyncRepository.createEvent(tenantId, {
        eventType: 'SORTIE_UPDATED',
        entityType: 'SORTIE',
        entityId: sortieId,
        payload: eventPayload,
      });
    }

    return updatedSortie;
  }

  async listSortiesForInstructor(
    tenantId: string,
    instructorUserId: string,
    from?: string,
    to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return this.repository.listSortiesForInstructor(tenantId, instructorUserId, fromDate, toDate);
  }

  async listSortiesForStudent(
    tenantId: string,
    studentProfileId: string,
    from?: string,
    to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return this.repository.listSortiesForStudent(tenantId, studentProfileId, fromDate, toDate);
  }

  async listSortiesForOps(
    tenantId: string,
    filters: {
      from?: string;
      to?: string;
      status?: string;
      aircraftId?: string;
      instructorUserId?: string;
    },
  ) {
    return this.repository.listSortiesForOps(tenantId, {
      from: filters.from ? new Date(filters.from) : undefined,
      to: filters.to ? new Date(filters.to) : undefined,
      status: filters.status,
      aircraftId: filters.aircraftId,
      instructorUserId: filters.instructorUserId,
    });
  }
}
