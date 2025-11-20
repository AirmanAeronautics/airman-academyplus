import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface RosterSortieRecord {
  id: string;
  tenantId: string;
  studentProfileId: string;
  instructorUserId: string;
  aircraftId: string;
  programId: string;
  lessonId: string;
  airportIcao: string;
  reportTime: Date;
  blockOffAt: Date | null;
  blockOnAt: Date | null;
  status: 'SCHEDULED' | 'DISPATCHED' | 'IN_FLIGHT' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  dispatchNotes: string | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RosterRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createSortie(
    tenantId: string,
    params: {
      studentProfileId: string;
      instructorUserId: string;
      aircraftId: string;
      programId: string;
      lessonId: string;
      airportIcao: string;
      reportTime: Date;
      dispatchNotes?: string;
    },
    createdByUserId: string,
  ): Promise<RosterSortieRecord> {
    const row = await this.databaseService.queryOne<RosterSortieRecord>(
      `
      INSERT INTO roster_sorties (
        tenant_id, student_profile_id, instructor_user_id, aircraft_id,
        program_id, lesson_id, airport_icao, report_time, status, dispatch_notes, created_by_user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        instructor_user_id AS "instructorUserId",
        aircraft_id AS "aircraftId",
        program_id AS "programId",
        lesson_id AS "lessonId",
        airport_icao AS "airportIcao",
        report_time AS "reportTime",
        block_off_at AS "blockOffAt",
        block_on_at AS "blockOnAt",
        status,
        dispatch_notes AS "dispatchNotes",
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.studentProfileId,
        params.instructorUserId,
        params.aircraftId,
        params.programId,
        params.lessonId,
        params.airportIcao,
        params.reportTime,
        'SCHEDULED',
        params.dispatchNotes ?? null,
        createdByUserId,
      ],
    );

    if (!row) {
      throw new Error('Failed to create sortie');
    }

    return row;
  }

  async getSortieById(tenantId: string, sortieId: string): Promise<RosterSortieRecord | null> {
    return this.databaseService.queryOne<RosterSortieRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        instructor_user_id AS "instructorUserId",
        aircraft_id AS "aircraftId",
        program_id AS "programId",
        lesson_id AS "lessonId",
        airport_icao AS "airportIcao",
        report_time AS "reportTime",
        block_off_at AS "blockOffAt",
        block_on_at AS "blockOnAt",
        status,
        dispatch_notes AS "dispatchNotes",
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM roster_sorties
      WHERE id = $1 AND tenant_id = $2
      `,
      [sortieId, tenantId],
    );
  }

  async updateSortieStatus(
    tenantId: string,
    sortieId: string,
    status: 'SCHEDULED' | 'DISPATCHED' | 'IN_FLIGHT' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW',
    dispatchNotes?: string,
  ): Promise<RosterSortieRecord> {
    const row = await this.databaseService.queryOne<RosterSortieRecord>(
      `
      UPDATE roster_sorties
      SET status = $3, dispatch_notes = COALESCE($4, dispatch_notes)
      WHERE id = $1 AND tenant_id = $2
      RETURNING
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        instructor_user_id AS "instructorUserId",
        aircraft_id AS "aircraftId",
        program_id AS "programId",
        lesson_id AS "lessonId",
        airport_icao AS "airportIcao",
        report_time AS "reportTime",
        block_off_at AS "blockOffAt",
        block_on_at AS "blockOnAt",
        status,
        dispatch_notes AS "dispatchNotes",
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [sortieId, tenantId, status, dispatchNotes ?? null],
    );

    if (!row) {
      throw new Error('Sortie not found or update failed');
    }

    return row;
  }

  async listSortiesForInstructor(
    tenantId: string,
    instructorUserId: string,
    from?: Date,
    to?: Date,
  ): Promise<RosterSortieRecord[]> {
    if (from && to) {
      return this.databaseService.query<RosterSortieRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          student_profile_id AS "studentProfileId",
          instructor_user_id AS "instructorUserId",
          aircraft_id AS "aircraftId",
          program_id AS "programId",
          lesson_id AS "lessonId",
          airport_icao AS "airportIcao",
          report_time AS "reportTime",
          block_off_at AS "blockOffAt",
          block_on_at AS "blockOnAt",
          status,
          dispatch_notes AS "dispatchNotes",
          created_by_user_id AS "createdByUserId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM roster_sorties
        WHERE tenant_id = $1 AND instructor_user_id = $2
          AND report_time >= $3 AND report_time <= $4
        ORDER BY report_time
        `,
        [tenantId, instructorUserId, from, to],
      );
    }

    return this.databaseService.query<RosterSortieRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        instructor_user_id AS "instructorUserId",
        aircraft_id AS "aircraftId",
        program_id AS "programId",
        lesson_id AS "lessonId",
        airport_icao AS "airportIcao",
        report_time AS "reportTime",
        block_off_at AS "blockOffAt",
        block_on_at AS "blockOnAt",
        status,
        dispatch_notes AS "dispatchNotes",
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM roster_sorties
      WHERE tenant_id = $1 AND instructor_user_id = $2
      ORDER BY report_time
      `,
      [tenantId, instructorUserId],
    );
  }

  async listSortiesForStudent(
    tenantId: string,
    studentProfileId: string,
    from?: Date,
    to?: Date,
  ): Promise<RosterSortieRecord[]> {
    if (from && to) {
      return this.databaseService.query<RosterSortieRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          student_profile_id AS "studentProfileId",
          instructor_user_id AS "instructorUserId",
          aircraft_id AS "aircraftId",
          program_id AS "programId",
          lesson_id AS "lessonId",
          airport_icao AS "airportIcao",
          report_time AS "reportTime",
          block_off_at AS "blockOffAt",
          block_on_at AS "blockOnAt",
          status,
          dispatch_notes AS "dispatchNotes",
          created_by_user_id AS "createdByUserId",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM roster_sorties
        WHERE tenant_id = $1 AND student_profile_id = $2
          AND report_time >= $3 AND report_time <= $4
        ORDER BY report_time
        `,
        [tenantId, studentProfileId, from, to],
      );
    }

    return this.databaseService.query<RosterSortieRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        instructor_user_id AS "instructorUserId",
        aircraft_id AS "aircraftId",
        program_id AS "programId",
        lesson_id AS "lessonId",
        airport_icao AS "airportIcao",
        report_time AS "reportTime",
        block_off_at AS "blockOffAt",
        block_on_at AS "blockOnAt",
        status,
        dispatch_notes AS "dispatchNotes",
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM roster_sorties
      WHERE tenant_id = $1 AND student_profile_id = $2
      ORDER BY report_time
      `,
      [tenantId, studentProfileId],
    );
  }

  async listSortiesForOps(
    tenantId: string,
    filters: {
      from?: Date;
      to?: Date;
      status?: string;
      aircraftId?: string;
      instructorUserId?: string;
    },
  ): Promise<RosterSortieRecord[]> {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.from) {
      conditions.push(`report_time >= $${paramIndex++}`);
      values.push(filters.from);
    }

    if (filters.to) {
      conditions.push(`report_time <= $${paramIndex++}`);
      values.push(filters.to);
    }

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }

    if (filters.aircraftId) {
      conditions.push(`aircraft_id = $${paramIndex++}`);
      values.push(filters.aircraftId);
    }

    if (filters.instructorUserId) {
      conditions.push(`instructor_user_id = $${paramIndex++}`);
      values.push(filters.instructorUserId);
    }

    return this.databaseService.query<RosterSortieRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        student_profile_id AS "studentProfileId",
        instructor_user_id AS "instructorUserId",
        aircraft_id AS "aircraftId",
        program_id AS "programId",
        lesson_id AS "lessonId",
        airport_icao AS "airportIcao",
        report_time AS "reportTime",
        block_off_at AS "blockOffAt",
        block_on_at AS "blockOnAt",
        status,
        dispatch_notes AS "dispatchNotes",
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM roster_sorties
      WHERE ${conditions.join(' AND ')}
      ORDER BY report_time
      `,
      values,
    );
  }
}

