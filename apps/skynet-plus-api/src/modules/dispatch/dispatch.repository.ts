import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface DispatchAnnotationRecord {
  id: string;
  tenantId: string;
  rosterSortieId: string;
  snapshotId: string | null;
  riskLevel: 'GREEN' | 'AMBER' | 'RED';
  flags: Record<string, any>;
  notes: string | null;
  createdByUserId: string;
  createdAt: Date;
}

export interface DispatchDashboardItem {
  sortieId: string;
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
  status: string;
  dispatchNotes: string | null;
  riskLevel: 'GREEN' | 'AMBER' | 'RED';
  flags: Record<string, any> | null;
  annotationId: string | null;
  snapshotId: string | null;
}

@Injectable()
export class DispatchRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async upsertDispatchAnnotation(
    tenantId: string,
    rosterSortieId: string,
    snapshotId: string | null,
    riskLevel: 'GREEN' | 'AMBER' | 'RED',
    flags: Record<string, any>,
    notes: string | null,
    createdByUserId: string,
  ): Promise<DispatchAnnotationRecord> {
    const row = await this.databaseService.queryOne<DispatchAnnotationRecord>(
      `
      INSERT INTO dispatch_annotations (
        tenant_id,
        roster_sortie_id,
        snapshot_id,
        risk_level,
        flags,
        notes,
        created_by_user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (tenant_id, roster_sortie_id)
      DO UPDATE SET
        snapshot_id = EXCLUDED.snapshot_id,
        risk_level = EXCLUDED.risk_level,
        flags = EXCLUDED.flags,
        notes = EXCLUDED.notes,
        created_by_user_id = EXCLUDED.created_by_user_id
      RETURNING
        id,
        tenant_id AS "tenantId",
        roster_sortie_id AS "rosterSortieId",
        snapshot_id AS "snapshotId",
        risk_level AS "riskLevel",
        flags,
        notes,
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt"
      `,
      [
        tenantId,
        rosterSortieId,
        snapshotId,
        riskLevel,
        JSON.stringify(flags),
        notes,
        createdByUserId,
      ],
    );

    if (!row) {
      throw new Error('Failed to upsert dispatch annotation');
    }

    return row;
  }

  async getDispatchAnnotation(
    tenantId: string,
    rosterSortieId: string,
  ): Promise<DispatchAnnotationRecord | null> {
    return this.databaseService.queryOne<DispatchAnnotationRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        roster_sortie_id AS "rosterSortieId",
        snapshot_id AS "snapshotId",
        risk_level AS "riskLevel",
        flags,
        notes,
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt"
      FROM dispatch_annotations
      WHERE tenant_id = $1 AND roster_sortie_id = $2
      `,
      [tenantId, rosterSortieId],
    );
  }

  async getDispatchDashboardForOps(
    tenantId: string,
    filters: {
      from?: Date;
      to?: Date;
      airportIcao?: string;
      riskLevel?: 'GREEN' | 'AMBER' | 'RED';
      status?: string;
    },
  ): Promise<DispatchDashboardItem[]> {
    const conditions: string[] = ['rs.tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.from) {
      conditions.push(`rs.report_time >= $${paramIndex++}`);
      values.push(filters.from);
    }

    if (filters.to) {
      conditions.push(`rs.report_time <= $${paramIndex++}`);
      values.push(filters.to);
    }

    if (filters.airportIcao) {
      conditions.push(`rs.airport_icao = $${paramIndex++}`);
      values.push(filters.airportIcao);
    }

    if (filters.status) {
      conditions.push(`rs.status = $${paramIndex++}`);
      values.push(filters.status);
    }

    if (filters.riskLevel) {
      conditions.push(`COALESCE(da.risk_level, 'GREEN') = $${paramIndex++}`);
      values.push(filters.riskLevel);
    }

    return this.databaseService.query<DispatchDashboardItem>(
      `
      SELECT
        rs.id AS "sortieId",
        rs.tenant_id AS "tenantId",
        rs.student_profile_id AS "studentProfileId",
        rs.instructor_user_id AS "instructorUserId",
        rs.aircraft_id AS "aircraftId",
        rs.program_id AS "programId",
        rs.lesson_id AS "lessonId",
        rs.airport_icao AS "airportIcao",
        rs.report_time AS "reportTime",
        rs.block_off_at AS "blockOffAt",
        rs.block_on_at AS "blockOnAt",
        rs.status,
        rs.dispatch_notes AS "dispatchNotes",
        COALESCE(da.risk_level, 'GREEN') AS "riskLevel",
        da.flags,
        da.id AS "annotationId",
        da.snapshot_id AS "snapshotId"
      FROM roster_sorties rs
      LEFT JOIN dispatch_annotations da ON rs.tenant_id = da.tenant_id AND rs.id = da.roster_sortie_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY rs.report_time ASC
      `,
      values,
    );
  }
}

