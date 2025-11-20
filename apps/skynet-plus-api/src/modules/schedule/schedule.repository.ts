import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface ScheduleBlockRecord {
  id: string;
  tenantId: string;
  label: string;
  startMinutes: number;
  endMinutes: number;
  createdAt: Date;
}

export interface InstructorDailyScheduleRecord {
  id: string;
  tenantId: string;
  instructorUserId: string;
  date: Date;
  blockId: string;
  status: 'AVAILABLE' | 'BUSY' | 'LEAVE';
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ScheduleRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createBlock(
    tenantId: string,
    params: {
      label: string;
      startMinutes: number;
      endMinutes: number;
    },
  ): Promise<ScheduleBlockRecord> {
    const row = await this.databaseService.queryOne<ScheduleBlockRecord>(
      `
      INSERT INTO schedule_blocks (tenant_id, label, start_minutes, end_minutes)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        tenant_id AS "tenantId",
        label,
        start_minutes AS "startMinutes",
        end_minutes AS "endMinutes",
        created_at AS "createdAt"
      `,
      [tenantId, params.label, params.startMinutes, params.endMinutes],
    );

    if (!row) {
      throw new Error('Failed to create schedule block');
    }

    return row;
  }

  async getBlockById(tenantId: string, blockId: string): Promise<ScheduleBlockRecord | null> {
    return this.databaseService.queryOne<ScheduleBlockRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        label,
        start_minutes AS "startMinutes",
        end_minutes AS "endMinutes",
        created_at AS "createdAt"
      FROM schedule_blocks
      WHERE id = $1 AND tenant_id = $2
      `,
      [blockId, tenantId],
    );
  }

  async listBlocks(tenantId: string): Promise<ScheduleBlockRecord[]> {
    return this.databaseService.query<ScheduleBlockRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        label,
        start_minutes AS "startMinutes",
        end_minutes AS "endMinutes",
        created_at AS "createdAt"
      FROM schedule_blocks
      WHERE tenant_id = $1
      ORDER BY start_minutes ASC
      `,
      [tenantId],
    );
  }

  async updateBlock(
    tenantId: string,
    blockId: string,
    params: {
      label?: string;
      startMinutes?: number;
      endMinutes?: number;
    },
  ): Promise<ScheduleBlockRecord> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.label !== undefined) {
      updates.push(`label = $${paramIndex++}`);
      values.push(params.label);
    }

    if (params.startMinutes !== undefined) {
      updates.push(`start_minutes = $${paramIndex++}`);
      values.push(params.startMinutes);
    }

    if (params.endMinutes !== undefined) {
      updates.push(`end_minutes = $${paramIndex++}`);
      values.push(params.endMinutes);
    }

    if (updates.length === 0) {
      // No updates, just return the existing block
      const block = await this.getBlockById(tenantId, blockId);
      if (!block) {
        throw new Error('Block not found');
      }
      return block;
    }

    values.push(blockId, tenantId);

    const row = await this.databaseService.queryOne<ScheduleBlockRecord>(
      `
      UPDATE schedule_blocks
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING
        id,
        tenant_id AS "tenantId",
        label,
        start_minutes AS "startMinutes",
        end_minutes AS "endMinutes",
        created_at AS "createdAt"
      `,
      values,
    );

    if (!row) {
      throw new Error('Block not found or update failed');
    }

    return row;
  }

  async deleteBlock(tenantId: string, blockId: string): Promise<void> {
    const result = await this.databaseService.query(
      `
      DELETE FROM schedule_blocks
      WHERE id = $1 AND tenant_id = $2
      `,
      [blockId, tenantId],
    );

    // Note: We don't check if anything was deleted, but we could if needed
  }

  async setInstructorDailySchedule(
    tenantId: string,
    instructorUserId: string,
    date: Date,
    blocks: Array<{ blockId: string; status: 'AVAILABLE' | 'BUSY' | 'LEAVE' }>,
  ): Promise<InstructorDailyScheduleRecord[]> {
    const client = await this.databaseService.getClient();
    try {
      await client.query('BEGIN');

      // Delete existing schedule for this instructor on this date
      await client.query(
        `
        DELETE FROM instructor_daily_schedule
        WHERE tenant_id = $1 AND instructor_user_id = $2 AND date = $3
        `,
        [tenantId, instructorUserId, date],
      );

      // Insert new schedule blocks
      const results: InstructorDailyScheduleRecord[] = [];
      for (const block of blocks) {
        const row = await this.databaseService.queryOne<InstructorDailyScheduleRecord>(
          `
          INSERT INTO instructor_daily_schedule (
            tenant_id,
            instructor_user_id,
            date,
            block_id,
            status
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING
            id,
            tenant_id AS "tenantId",
            instructor_user_id AS "instructorUserId",
            date,
            block_id AS "blockId",
            status,
            created_at AS "createdAt",
            updated_at AS "updatedAt"
          `,
          [tenantId, instructorUserId, date, block.blockId, block.status],
        );

        if (row) {
          results.push(row);
        }
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getInstructorDailySchedule(
    tenantId: string,
    instructorUserId: string,
    date: Date,
  ): Promise<InstructorDailyScheduleRecord[]> {
    return this.databaseService.query<InstructorDailyScheduleRecord>(
      `
      SELECT
        ids.id,
        ids.tenant_id AS "tenantId",
        ids.instructor_user_id AS "instructorUserId",
        ids.date,
        ids.block_id AS "blockId",
        ids.status,
        ids.created_at AS "createdAt",
        ids.updated_at AS "updatedAt"
      FROM instructor_daily_schedule ids
      WHERE ids.tenant_id = $1
        AND ids.instructor_user_id = $2
        AND ids.date = $3
      ORDER BY (
        SELECT start_minutes
        FROM schedule_blocks
        WHERE id = ids.block_id
      ) ASC
      `,
      [tenantId, instructorUserId, date],
    );
  }
}

