import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface MaverickSyncEventRecord {
  id: string;
  tenantId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'SENT' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MaverickSyncRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createEvent(
    tenantId: string,
    params: {
      eventType: string;
      entityType: string;
      entityId: string;
      payload?: Record<string, any>;
    },
  ): Promise<MaverickSyncEventRecord> {
    const row = await this.databaseService.queryOne<MaverickSyncEventRecord>(
      `
      INSERT INTO maverick_sync_events (
        tenant_id,
        event_type,
        entity_type,
        entity_id,
        payload,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        tenant_id AS "tenantId",
        event_type AS "eventType",
        entity_type AS "entityType",
        entity_id AS "entityId",
        payload,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.eventType,
        params.entityType,
        params.entityId,
        params.payload ? JSON.stringify(params.payload) : JSON.stringify({}),
        'PENDING',
      ],
    );

    if (!row) {
      throw new Error('Failed to create Maverick sync event');
    }

    return row;
  }

  async listEvents(
    tenantId: string,
    filters: {
      status?: string;
      since?: Date;
    },
  ): Promise<MaverickSyncEventRecord[]> {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }

    if (filters.since) {
      conditions.push(`created_at >= $${paramIndex++}`);
      values.push(filters.since);
    }

    return this.databaseService.query<MaverickSyncEventRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        event_type AS "eventType",
        entity_type AS "entityType",
        entity_id AS "entityId",
        payload,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM maverick_sync_events
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at ASC
      `,
      values,
    );
  }

  async acknowledgeEvent(tenantId: string, eventId: string): Promise<MaverickSyncEventRecord> {
    const row = await this.databaseService.queryOne<MaverickSyncEventRecord>(
      `
      UPDATE maverick_sync_events
      SET status = 'SENT'
      WHERE id = $1 AND tenant_id = $2
      RETURNING
        id,
        tenant_id AS "tenantId",
        event_type AS "eventType",
        entity_type AS "entityType",
        entity_id AS "entityId",
        payload,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [eventId, tenantId],
    );

    if (!row) {
      throw new Error('Event not found or update failed');
    }

    return row;
  }
}

