import { Injectable, NotFoundException } from '@nestjs/common';
import { AvailabilityRepository } from './availability.repository';
import { UpsertAvailabilityDto } from './dto/availability-slot.dto';
import { UserRepository } from '../../core/users/user.repository';
import { FleetRepository } from '../fleet/fleet.repository';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly repository: AvailabilityRepository,
    private readonly userRepository: UserRepository,
    private readonly fleetRepository: FleetRepository,
  ) {}

  // ==================== Instructor Availability ====================

  async upsertInstructorAvailability(
    tenantId: string,
    instructorUserId: string,
    dto: UpsertAvailabilityDto,
  ) {
    // Verify instructor exists
    const user = await this.userRepository.findById(tenantId, instructorUserId);
    if (!user) {
      throw new NotFoundException(`Instructor with id '${instructorUserId}' not found`);
    }

    const slots = dto.slots.map((slot) => ({
      startAt: new Date(slot.startAt),
      endAt: new Date(slot.endAt),
      status: slot.status,
      notes: slot.notes,
    }));

    return this.repository.upsertInstructorAvailability(tenantId, instructorUserId, slots);
  }

  async listInstructorAvailability(
    tenantId: string,
    instructorUserId: string,
    from?: string,
    to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return this.repository.listInstructorAvailability(tenantId, instructorUserId, fromDate, toDate);
  }

  // ==================== Aircraft Availability ====================

  async upsertAircraftAvailability(
    tenantId: string,
    aircraftId: string,
    dto: UpsertAvailabilityDto,
  ) {
    // Verify aircraft exists
    const aircraft = await this.fleetRepository.getAircraftById(tenantId, aircraftId);
    if (!aircraft) {
      throw new NotFoundException(`Aircraft with id '${aircraftId}' not found`);
    }

    // Map slots and validate aircraft availability status types
    // Aircraft availability only accepts: 'AVAILABLE' | 'MAINTENANCE' | 'RESERVED'
    // The DTO allows 'AVAILABLE' | 'UNAVAILABLE' | 'TENTATIVE' (for instructors)
    // We need to map/validate for aircraft
    const slots = dto.slots.map((slot) => {
      let status: 'AVAILABLE' | 'MAINTENANCE' | 'RESERVED' | undefined = undefined;
      
      if (slot.status) {
        // Check if it's already a valid aircraft status
        if (slot.status === 'AVAILABLE') {
          status = 'AVAILABLE';
        } else if (slot.status === 'UNAVAILABLE') {
          // Map UNAVAILABLE -> MAINTENANCE for aircraft
          status = 'MAINTENANCE';
        } else if (slot.status === 'TENTATIVE') {
          // Map TENTATIVE -> RESERVED for aircraft
          status = 'RESERVED';
        }
        // Note: 'MAINTENANCE' and 'RESERVED' are not in the DTO type,
        // but if they were passed somehow, they would be handled above
      }

      return {
        startAt: new Date(slot.startAt),
        endAt: new Date(slot.endAt),
        status,
        notes: slot.notes,
      };
    });

    return this.repository.upsertAircraftAvailability(tenantId, aircraftId, slots);
  }

  async listAircraftAvailability(
    tenantId: string,
    aircraftId: string,
    from?: string,
    to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return this.repository.listAircraftAvailability(tenantId, aircraftId, fromDate, toDate);
  }
}
