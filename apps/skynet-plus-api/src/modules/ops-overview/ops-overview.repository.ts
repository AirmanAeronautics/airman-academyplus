import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface OpsDailySummaryRecord {
  id: string;
  tenantId: string;
  date: Date;
  totalSorties: number;
  completed: number;
  cancelled: number;
  noShow: number;
  utilizationPercent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpsSummaryData {
  date: Date;
  totalSorties: number;
  completed: number;
  cancelled: number;
  noShow: number;
  scheduled: number;
  dispatched: number;
  inFlight: number;
  instructorUtilization: number;
  aircraftUtilization: number;
  overallUtilization: number;
}

@Injectable()
export class OpsOverviewRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async upsertDailySummary(
    tenantId: string,
    date: Date,
    summary: {
      totalSorties: number;
      completed: number;
      cancelled: number;
      noShow: number;
      utilizationPercent: number;
    },
  ): Promise<OpsDailySummaryRecord> {
    const row = await this.databaseService.queryOne<OpsDailySummaryRecord>(
      `
      INSERT INTO ops_daily_summary (
        tenant_id,
        date,
        total_sorties,
        completed,
        cancelled,
        no_show,
        utilization_percent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (tenant_id, date)
      DO UPDATE SET
        total_sorties = EXCLUDED.total_sorties,
        completed = EXCLUDED.completed,
        cancelled = EXCLUDED.cancelled,
        no_show = EXCLUDED.no_show,
        utilization_percent = EXCLUDED.utilization_percent,
        updated_at = now()
      RETURNING
        id,
        tenant_id AS "tenantId",
        date,
        total_sorties AS "totalSorties",
        completed,
        cancelled,
        no_show AS "noShow",
        utilization_percent AS "utilizationPercent",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        date,
        summary.totalSorties,
        summary.completed,
        summary.cancelled,
        summary.noShow,
        summary.utilizationPercent,
      ],
    );

    if (!row) {
      throw new Error('Failed to upsert ops daily summary');
    }

    return row;
  }

  async getDailySummary(tenantId: string, date: Date): Promise<OpsDailySummaryRecord | null> {
    return this.databaseService.queryOne<OpsDailySummaryRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        date,
        total_sorties AS "totalSorties",
        completed,
        cancelled,
        no_show AS "noShow",
        utilization_percent AS "utilizationPercent",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM ops_daily_summary
      WHERE tenant_id = $1 AND date = $2
      `,
      [tenantId, date],
    );
  }

  async getSummaryRange(
    tenantId: string,
    from: Date,
    to: Date,
  ): Promise<OpsDailySummaryRecord[]> {
    return this.databaseService.query<OpsDailySummaryRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        date,
        total_sorties AS "totalSorties",
        completed,
        cancelled,
        no_show AS "noShow",
        utilization_percent AS "utilizationPercent",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM ops_daily_summary
      WHERE tenant_id = $1 AND date >= $2 AND date <= $3
      ORDER BY date DESC
      `,
      [tenantId, from, to],
    );
  }

  async computeDailySummaryFromSorties(
    tenantId: string,
    date: Date,
  ): Promise<OpsSummaryData> {
    // Get all sorties for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sorties = await this.databaseService.query<any>(
      `
      SELECT
        id,
        status,
        instructor_user_id,
        aircraft_id,
        report_time,
        block_off_at,
        block_on_at
      FROM roster_sorties
      WHERE tenant_id = $1
        AND report_time >= $2
        AND report_time <= $3
      `,
      [tenantId, startOfDay, endOfDay],
    );

    // Count by status
    const totalSorties = sorties.length;
    const completed = sorties.filter((s) => s.status === 'COMPLETED').length;
    const cancelled = sorties.filter((s) => s.status === 'CANCELLED').length;
    const noShow = sorties.filter((s) => s.status === 'NO_SHOW').length;
    const scheduled = sorties.filter((s) => s.status === 'SCHEDULED').length;
    const dispatched = sorties.filter((s) => s.status === 'DISPATCHED').length;
    const inFlight = sorties.filter((s) => s.status === 'IN_FLIGHT').length;

    // Calculate instructor utilization
    // Count unique instructors who have completed sorties
    const instructorsWithSorties = new Set(
      sorties.filter((s) => s.status === 'COMPLETED').map((s) => s.instructor_user_id),
    );
    const totalInstructors = await this.databaseService.queryOne<{ count: number }>(
      `
      SELECT COUNT(DISTINCT id) as count
      FROM "user"
      WHERE tenant_id = $1 AND role = 'INSTRUCTOR' AND is_active = true
      `,
      [tenantId],
    );
    const instructorUtilization =
      totalInstructors && totalInstructors.count > 0
        ? (instructorsWithSorties.size / totalInstructors.count) * 100
        : 0;

    // Calculate aircraft utilization
    // Count unique aircraft that have completed sorties
    const aircraftWithSorties = new Set(
      sorties.filter((s) => s.status === 'COMPLETED').map((s) => s.aircraft_id),
    );
    const totalAircraft = await this.databaseService.queryOne<{ count: number }>(
      `
      SELECT COUNT(DISTINCT id) as count
      FROM aircraft
      WHERE tenant_id = $1 AND status = 'ACTIVE'
      `,
      [tenantId],
    );
    const aircraftUtilization =
      totalAircraft && totalAircraft.count > 0
        ? (aircraftWithSorties.size / totalAircraft.count) * 100
        : 0;

    // Overall utilization: average of instructor and aircraft utilization
    const overallUtilization = (instructorUtilization + aircraftUtilization) / 2;

    return {
      date,
      totalSorties,
      completed,
      cancelled,
      noShow,
      scheduled,
      dispatched,
      inFlight,
      instructorUtilization: Math.round(instructorUtilization * 100) / 100,
      aircraftUtilization: Math.round(aircraftUtilization * 100) / 100,
      overallUtilization: Math.round(overallUtilization * 100) / 100,
    };
  }

  async computeUtilizationByAirport(
    tenantId: string,
    airportIcao: string,
    date: Date,
  ): Promise<{
    airportIcao: string;
    date: Date;
    totalSorties: number;
    completed: number;
    utilization: number;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await this.databaseService.queryOne<{
      total: number;
      completed: number;
    }>(
      `
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed
      FROM roster_sorties
      WHERE tenant_id = $1
        AND airport_icao = $2
        AND report_time >= $3
        AND report_time <= $4
      `,
      [tenantId, airportIcao, startOfDay, endOfDay],
    );

    const totalSorties = result?.total ?? 0;
    const completed = result?.completed ?? 0;
    const utilization = totalSorties > 0 ? (completed / totalSorties) * 100 : 0;

    return {
      airportIcao,
      date,
      totalSorties,
      completed,
      utilization: Math.round(utilization * 100) / 100,
    };
  }
}

