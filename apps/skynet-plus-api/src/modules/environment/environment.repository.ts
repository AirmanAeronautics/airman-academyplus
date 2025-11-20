import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface EnvironmentSnapshotRecord {
  id: string;
  tenantId: string | null;
  airportIcao: string;
  capturedAt: Date;
  metarJson: any | null;
  tafJson: any | null;
  notamsJson: any | null;
  trafficJson: any | null;
  derivedFlags: Record<string, any>;
  createdAt: Date;
}

@Injectable()
export class EnvironmentRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async upsertSnapshot(input: {
    tenantId?: string | null;
    airportIcao: string;
    capturedAt: Date;
    metarJson?: any;
    tafJson?: any;
    notamsJson?: any;
    trafficJson?: any;
    derivedFlags?: any;
  }): Promise<EnvironmentSnapshotRecord> {
    // Use INSERT ... ON CONFLICT for upsert
    // Since we don't have a unique constraint on (airport_icao, captured_at, tenant_id),
    // we'll use a simple INSERT for now. In production, you might want to add a unique constraint.
    const row = await this.databaseService.queryOne<EnvironmentSnapshotRecord>(
      `
      INSERT INTO environment_snapshots (
        tenant_id,
        airport_icao,
        captured_at,
        metar_json,
        taf_json,
        notams_json,
        traffic_json,
        derived_flags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        tenant_id AS "tenantId",
        airport_icao AS "airportIcao",
        captured_at AS "capturedAt",
        metar_json AS "metarJson",
        taf_json AS "tafJson",
        notams_json AS "notamsJson",
        traffic_json AS "trafficJson",
        derived_flags AS "derivedFlags",
        created_at AS "createdAt"
      `,
      [
        input.tenantId ?? null,
        input.airportIcao,
        input.capturedAt,
        input.metarJson ? JSON.stringify(input.metarJson) : null,
        input.tafJson ? JSON.stringify(input.tafJson) : null,
        input.notamsJson ? JSON.stringify(input.notamsJson) : null,
        input.trafficJson ? JSON.stringify(input.trafficJson) : null,
        input.derivedFlags ? JSON.stringify(input.derivedFlags) : JSON.stringify({}),
      ],
    );

    if (!row) {
      throw new Error('Failed to create environment snapshot');
    }

    return row;
  }

  async getLatestSnapshotForAirport(
    airportIcao: string,
    tenantId?: string | null,
  ): Promise<EnvironmentSnapshotRecord | null> {
    if (tenantId) {
      // Try tenant-specific first, then fall back to global (tenant_id IS NULL)
      const row = await this.databaseService.queryOne<EnvironmentSnapshotRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          airport_icao AS "airportIcao",
          captured_at AS "capturedAt",
          metar_json AS "metarJson",
          taf_json AS "tafJson",
          notams_json AS "notamsJson",
          traffic_json AS "trafficJson",
          derived_flags AS "derivedFlags",
          created_at AS "createdAt"
        FROM environment_snapshots
        WHERE airport_icao = $1
          AND (tenant_id = $2 OR tenant_id IS NULL)
        ORDER BY captured_at DESC
        LIMIT 1
        `,
        [airportIcao, tenantId],
      );
      return row;
    } else {
      // Global only
      const row = await this.databaseService.queryOne<EnvironmentSnapshotRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          airport_icao AS "airportIcao",
          captured_at AS "capturedAt",
          metar_json AS "metarJson",
          taf_json AS "tafJson",
          notams_json AS "notamsJson",
          traffic_json AS "trafficJson",
          derived_flags AS "derivedFlags",
          created_at AS "createdAt"
        FROM environment_snapshots
        WHERE airport_icao = $1
          AND tenant_id IS NULL
        ORDER BY captured_at DESC
        LIMIT 1
        `,
        [airportIcao],
      );
      return row;
    }
  }

  async getLatestSnapshotForAirportBeforeTime(
    airportIcao: string,
    beforeTime: Date,
    tenantId?: string | null,
  ): Promise<EnvironmentSnapshotRecord | null> {
    if (tenantId) {
      const row = await this.databaseService.queryOne<EnvironmentSnapshotRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          airport_icao AS "airportIcao",
          captured_at AS "capturedAt",
          metar_json AS "metarJson",
          taf_json AS "tafJson",
          notams_json AS "notamsJson",
          traffic_json AS "trafficJson",
          derived_flags AS "derivedFlags",
          created_at AS "createdAt"
        FROM environment_snapshots
        WHERE airport_icao = $1
          AND captured_at <= $2
          AND (tenant_id = $3 OR tenant_id IS NULL)
        ORDER BY captured_at DESC
        LIMIT 1
        `,
        [airportIcao, beforeTime, tenantId],
      );
      return row;
    } else {
      const row = await this.databaseService.queryOne<EnvironmentSnapshotRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          airport_icao AS "airportIcao",
          captured_at AS "capturedAt",
          metar_json AS "metarJson",
          taf_json AS "tafJson",
          notams_json AS "notamsJson",
          traffic_json AS "trafficJson",
          derived_flags AS "derivedFlags",
          created_at AS "createdAt"
        FROM environment_snapshots
        WHERE airport_icao = $1
          AND captured_at <= $2
          AND tenant_id IS NULL
        ORDER BY captured_at DESC
        LIMIT 1
        `,
        [airportIcao, beforeTime],
      );
      return row;
    }
  }

  async getSnapshotsForAirportInRange(
    airportIcao: string,
    from: Date,
    to: Date,
    tenantId?: string | null,
  ): Promise<EnvironmentSnapshotRecord[]> {
    if (tenantId) {
      return this.databaseService.query<EnvironmentSnapshotRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          airport_icao AS "airportIcao",
          captured_at AS "capturedAt",
          metar_json AS "metarJson",
          taf_json AS "tafJson",
          notams_json AS "notamsJson",
          traffic_json AS "trafficJson",
          derived_flags AS "derivedFlags",
          created_at AS "createdAt"
        FROM environment_snapshots
        WHERE airport_icao = $1
          AND captured_at >= $2
          AND captured_at <= $3
          AND (tenant_id = $4 OR tenant_id IS NULL)
        ORDER BY captured_at DESC
        `,
        [airportIcao, from, to, tenantId],
      );
    } else {
      return this.databaseService.query<EnvironmentSnapshotRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          airport_icao AS "airportIcao",
          captured_at AS "capturedAt",
          metar_json AS "metarJson",
          taf_json AS "tafJson",
          notams_json AS "notamsJson",
          traffic_json AS "trafficJson",
          derived_flags AS "derivedFlags",
          created_at AS "createdAt"
        FROM environment_snapshots
        WHERE airport_icao = $1
          AND captured_at >= $2
          AND captured_at <= $3
          AND tenant_id IS NULL
        ORDER BY captured_at DESC
        `,
        [airportIcao, from, to],
      );
    }
  }
}

