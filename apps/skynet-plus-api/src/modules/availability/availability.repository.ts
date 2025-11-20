import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface InstructorAvailabilityRecord {
  id: string;
  tenantId: string;
  instructorUserId: string;
  startAt: Date;
  endAt: Date;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'TENTATIVE';
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AircraftAvailabilityRecord {
  id: string;
  tenantId: string;
  aircraftId: string;
  startAt: Date;
  endAt: Date;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'RESERVED';
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AvailabilityRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  // ==================== Instructor Availability ====================

  async upsertInstructorAvailability(
    tenantId: string,
    instructorUserId: string,
    slots: Array<{
      startAt: Date;
      endAt: Date;
      status?: 'AVAILABLE' | 'UNAVAILABLE' | 'TENTATIVE';
      notes?: string;
    }>,
  ): Promise<InstructorAvailabilityRecord[]> {
    // For simplicity, delete existing slots in the time range and insert new ones
    // In production, you might want more sophisticated merge logic
    const results: InstructorAvailabilityRecord[] = [];

    for (const slot of slots) {
      const row = await this.databaseService.queryOne<InstructorAvailabilityRecord>(
        `
        INSERT INTO instructor_availability (tenant_id, instructor_user_id, start_at, end_at, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          tenant_id AS "tenantId",
          instructor_user_id AS "instructorUserId",
          start_at AS "startAt",
          end_at AS "endAt",
          status,
          notes,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        `,
        [
          tenantId,
          instructorUserId,
          slot.startAt,
          slot.endAt,
          slot.status ?? 'AVAILABLE',
          slot.notes ?? null,
        ],
      );

      if (row) {
        results.push(row);
      }
    }

    return results;
  }

  async listInstructorAvailability(
    tenantId: string,
    instructorUserId: string,
    from?: Date,
    to?: Date,
  ): Promise<InstructorAvailabilityRecord[]> {
    if (from && to) {
      return this.databaseService.query<InstructorAvailabilityRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          instructor_user_id AS "instructorUserId",
          start_at AS "startAt",
          end_at AS "endAt",
          status,
          notes,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM instructor_availability
        WHERE tenant_id = $1 AND instructor_user_id = $2
          AND start_at >= $3 AND end_at <= $4
        ORDER BY start_at
        `,
        [tenantId, instructorUserId, from, to],
      );
    }

    return this.databaseService.query<InstructorAvailabilityRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        instructor_user_id AS "instructorUserId",
        start_at AS "startAt",
        end_at AS "endAt",
        status,
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM instructor_availability
      WHERE tenant_id = $1 AND instructor_user_id = $2
      ORDER BY start_at
      `,
      [tenantId, instructorUserId],
    );
  }

  // ==================== Aircraft Availability ====================

  async upsertAircraftAvailability(
    tenantId: string,
    aircraftId: string,
    slots: Array<{
      startAt: Date;
      endAt: Date;
      status?: 'AVAILABLE' | 'MAINTENANCE' | 'RESERVED';
      notes?: string;
    }>,
  ): Promise<AircraftAvailabilityRecord[]> {
    const results: AircraftAvailabilityRecord[] = [];

    for (const slot of slots) {
      const row = await this.databaseService.queryOne<AircraftAvailabilityRecord>(
        `
        INSERT INTO aircraft_availability (tenant_id, aircraft_id, start_at, end_at, status, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id,
          tenant_id AS "tenantId",
          aircraft_id AS "aircraftId",
          start_at AS "startAt",
          end_at AS "endAt",
          status,
          notes,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        `,
        [
          tenantId,
          aircraftId,
          slot.startAt,
          slot.endAt,
          slot.status ?? 'AVAILABLE',
          slot.notes ?? null,
        ],
      );

      if (row) {
        results.push(row);
      }
    }

    return results;
  }

  async listAircraftAvailability(
    tenantId: string,
    aircraftId: string,
    from?: Date,
    to?: Date,
  ): Promise<AircraftAvailabilityRecord[]> {
    if (from && to) {
      return this.databaseService.query<AircraftAvailabilityRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          aircraft_id AS "aircraftId",
          start_at AS "startAt",
          end_at AS "endAt",
          status,
          notes,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM aircraft_availability
        WHERE tenant_id = $1 AND aircraft_id = $2
          AND start_at >= $3 AND end_at <= $4
        ORDER BY start_at
        `,
        [tenantId, aircraftId, from, to],
      );
    }

    return this.databaseService.query<AircraftAvailabilityRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        aircraft_id AS "aircraftId",
        start_at AS "startAt",
        end_at AS "endAt",
        status,
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM aircraft_availability
      WHERE tenant_id = $1 AND aircraft_id = $2
      ORDER BY start_at
      `,
      [tenantId, aircraftId],
    );
  }
}

