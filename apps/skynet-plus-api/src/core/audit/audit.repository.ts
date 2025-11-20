import { DatabaseService } from '../../common/db/database.service';

export interface AuditLogRecord {
  id: string;
  tenantId: string;
  userId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  meta: any | null;
  createdAt: Date;
}

export class AuditRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async log(params: {
    tenantId: string;
    userId?: string | null;
    action: string;
    entityType?: string | null;
    entityId?: string | null;
    meta?: Record<string, any> | null;
  }): Promise<void> {
    await this.databaseService.query(
      `
      INSERT INTO audit_log (tenant_id, user_id, action, entity_type, entity_id, meta)
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        params.tenantId,
        params.userId ?? null,
        params.action,
        params.entityType ?? null,
        params.entityId ?? null,
        params.meta ? JSON.stringify(params.meta) : null,
      ],
    );
  }
}

