import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface AircraftRecord {
  id: string;
  tenantId: string;
  registration: string;
  type: string;
  baseAirportIcao: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  capabilities: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class FleetRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createAircraft(
    tenantId: string,
    params: {
      registration: string;
      type: string;
      baseAirportIcao: string;
      status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
      capabilities?: Record<string, any>;
    },
  ): Promise<AircraftRecord> {
    const row = await this.databaseService.queryOne<AircraftRecord>(
      `
      INSERT INTO aircraft (tenant_id, registration, type, base_airport_icao, status, capabilities)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        tenant_id AS "tenantId",
        registration,
        type,
        base_airport_icao AS "baseAirportIcao",
        status,
        capabilities,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.registration,
        params.type,
        params.baseAirportIcao,
        params.status ?? 'ACTIVE',
        JSON.stringify(params.capabilities || {}),
      ],
    );

    if (!row) {
      throw new Error('Failed to create aircraft');
    }

    return row;
  }

  async listAircraft(
    tenantId: string,
    status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE',
  ): Promise<AircraftRecord[]> {
    if (status) {
      return this.databaseService.query<AircraftRecord>(
        `
        SELECT
          id,
          tenant_id AS "tenantId",
          registration,
          type,
          base_airport_icao AS "baseAirportIcao",
          status,
          capabilities,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM aircraft
        WHERE tenant_id = $1 AND status = $2
        ORDER BY registration
        `,
        [tenantId, status],
      );
    }

    return this.databaseService.query<AircraftRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        registration,
        type,
        base_airport_icao AS "baseAirportIcao",
        status,
        capabilities,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM aircraft
      WHERE tenant_id = $1
      ORDER BY registration
      `,
      [tenantId],
    );
  }

  async getAircraftById(tenantId: string, aircraftId: string): Promise<AircraftRecord | null> {
    return this.databaseService.queryOne<AircraftRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        registration,
        type,
        base_airport_icao AS "baseAirportIcao",
        status,
        capabilities,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM aircraft
      WHERE id = $1 AND tenant_id = $2
      LIMIT 1
      `,
      [aircraftId, tenantId],
    );
  }

  async updateAircraft(
    tenantId: string,
    aircraftId: string,
    params: {
      baseAirportIcao?: string;
      status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
      capabilities?: Record<string, any>;
    },
  ): Promise<AircraftRecord> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.baseAirportIcao !== undefined) {
      updates.push(`base_airport_icao = $${paramIndex++}`);
      values.push(params.baseAirportIcao);
    }

    if (params.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(params.status);
    }

    if (params.capabilities !== undefined) {
      updates.push(`capabilities = $${paramIndex++}`);
      values.push(JSON.stringify(params.capabilities));
    }

    if (updates.length === 0) {
      // No updates, return existing record
      const existing = await this.getAircraftById(tenantId, aircraftId);
      if (!existing) {
        throw new Error('Aircraft not found');
      }
      return existing;
    }

    values.push(aircraftId, tenantId);

    const row = await this.databaseService.queryOne<AircraftRecord>(
      `
      UPDATE aircraft
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING
        id,
        tenant_id AS "tenantId",
        registration,
        type,
        base_airport_icao AS "baseAirportIcao",
        status,
        capabilities,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      values,
    );

    if (!row) {
      throw new Error('Aircraft not found or update failed');
    }

    return row;
  }

  async softDeactivateAircraft(tenantId: string, aircraftId: string): Promise<AircraftRecord> {
    return this.updateAircraft(tenantId, aircraftId, { status: 'INACTIVE' });
  }
}

