import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface OrgThreadRecord {
  id: string;
  tenantId: string;
  type: 'GENERAL' | 'SORTIE' | 'AIRCRAFT' | 'STUDENT';
  title: string;
  sortieId: string | null;
  aircraftId: string | null;
  studentProfileId: string | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgMessageRecord {
  id: string;
  tenantId: string;
  threadId: string;
  senderUserId: string;
  body: string;
  createdAt: Date;
}

@Injectable()
export class MessagingRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createThread(
    tenantId: string,
    params: {
      type: string;
      title: string;
      sortieId?: string | null;
      aircraftId?: string | null;
      studentProfileId?: string | null;
      createdByUserId: string;
    },
  ): Promise<OrgThreadRecord> {
    const row = await this.databaseService.queryOne<OrgThreadRecord>(
      `
      INSERT INTO org_threads (
        tenant_id,
        type,
        title,
        sortie_id,
        aircraft_id,
        student_profile_id,
        created_by_user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        tenant_id AS "tenantId",
        type,
        title,
        sortie_id AS "sortieId",
        aircraft_id AS "aircraftId",
        student_profile_id AS "studentProfileId",
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.type,
        params.title,
        params.sortieId ?? null,
        params.aircraftId ?? null,
        params.studentProfileId ?? null,
        params.createdByUserId,
      ],
    );

    if (!row) {
      throw new Error('Failed to create thread');
    }

    return row;
  }

  async getThreadById(tenantId: string, threadId: string): Promise<OrgThreadRecord | null> {
    return this.databaseService.queryOne<OrgThreadRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        type,
        title,
        sortie_id AS "sortieId",
        aircraft_id AS "aircraftId",
        student_profile_id AS "studentProfileId",
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM org_threads
      WHERE id = $1 AND tenant_id = $2
      `,
      [threadId, tenantId],
    );
  }

  async findThreadBySortie(tenantId: string, sortieId: string): Promise<OrgThreadRecord | null> {
    return this.databaseService.queryOne<OrgThreadRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        type,
        title,
        sortie_id AS "sortieId",
        aircraft_id AS "aircraftId",
        student_profile_id AS "studentProfileId",
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM org_threads
      WHERE tenant_id = $1
        AND type = 'SORTIE'
        AND sortie_id = $2
      `,
      [tenantId, sortieId],
    );
  }

  async listThreads(
    tenantId: string,
    filters: {
      type?: string;
      sortieId?: string;
      aircraftId?: string;
      studentProfileId?: string;
    },
  ): Promise<OrgThreadRecord[]> {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.type) {
      conditions.push(`type = $${paramIndex++}`);
      values.push(filters.type);
    }

    if (filters.sortieId) {
      conditions.push(`sortie_id = $${paramIndex++}`);
      values.push(filters.sortieId);
    }

    if (filters.aircraftId) {
      conditions.push(`aircraft_id = $${paramIndex++}`);
      values.push(filters.aircraftId);
    }

    if (filters.studentProfileId) {
      conditions.push(`student_profile_id = $${paramIndex++}`);
      values.push(filters.studentProfileId);
    }

    return this.databaseService.query<OrgThreadRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        type,
        title,
        sortie_id AS "sortieId",
        aircraft_id AS "aircraftId",
        student_profile_id AS "studentProfileId",
        created_by_user_id AS "createdByUserId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM org_threads
      WHERE ${conditions.join(' AND ')}
      ORDER BY updated_at DESC
      `,
      values,
    );
  }

  async createMessage(
    tenantId: string,
    threadId: string,
    params: {
      senderUserId: string;
      body: string;
    },
  ): Promise<OrgMessageRecord> {
    const row = await this.databaseService.queryOne<OrgMessageRecord>(
      `
      INSERT INTO org_messages (
        tenant_id,
        thread_id,
        sender_user_id,
        body
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        tenant_id AS "tenantId",
        thread_id AS "threadId",
        sender_user_id AS "senderUserId",
        body,
        created_at AS "createdAt"
      `,
      [tenantId, threadId, params.senderUserId, params.body],
    );

    if (!row) {
      throw new Error('Failed to create message');
    }

    // Update thread's updated_at
    await this.databaseService.query(
      `
      UPDATE org_threads
      SET updated_at = now()
      WHERE id = $1 AND tenant_id = $2
      `,
      [threadId, tenantId],
    );

    return row;
  }

  async listMessages(tenantId: string, threadId: string): Promise<OrgMessageRecord[]> {
    return this.databaseService.query<OrgMessageRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        thread_id AS "threadId",
        sender_user_id AS "senderUserId",
        body,
        created_at AS "createdAt"
      FROM org_messages
      WHERE tenant_id = $1 AND thread_id = $2
      ORDER BY created_at ASC
      `,
      [tenantId, threadId],
    );
  }
}

