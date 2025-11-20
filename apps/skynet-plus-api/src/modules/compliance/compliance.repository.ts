import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface ComplianceItemRecord {
  id: string;
  tenantId: string;
  code: string;
  title: string;
  description: string | null;
  category: 'TRAINING' | 'MAINTENANCE' | 'SAFETY' | 'DOCUMENTS' | 'OTHER';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PER_FLIGHT' | 'ADHOC';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceRecordRecord {
  id: string;
  tenantId: string;
  itemId: string;
  performedByUserId: string;
  performedAt: Date;
  status: 'PASS' | 'FAIL' | 'N/A';
  remarks: string | null;
  linkedSortieId: string | null;
  linkedAircraftId: string | null;
  createdAt: Date;
}

export interface ComplianceIncidentRecord {
  id: string;
  tenantId: string;
  reportedByUserId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'CLOSED';
  summary: string;
  details: string | null;
  occurredAt: Date;
  linkedSortieId: string | null;
  linkedAircraftId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ComplianceRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createItem(
    tenantId: string,
    params: {
      code: string;
      title: string;
      description?: string | null;
      category: string;
      frequency: string;
      isActive?: boolean;
    },
  ): Promise<ComplianceItemRecord> {
    const row = await this.databaseService.queryOne<ComplianceItemRecord>(
      `
      INSERT INTO compliance_items (
        tenant_id,
        code,
        title,
        description,
        category,
        frequency,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        tenant_id AS "tenantId",
        code,
        title,
        description,
        category,
        frequency,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.code,
        params.title,
        params.description ?? null,
        params.category,
        params.frequency,
        params.isActive ?? true,
      ],
    );

    if (!row) {
      throw new Error('Failed to create compliance item');
    }

    return row;
  }

  async listItems(tenantId: string, activeOnly: boolean = false): Promise<ComplianceItemRecord[]> {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];

    if (activeOnly) {
      conditions.push('is_active = TRUE');
    }

    return this.databaseService.query<ComplianceItemRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        code,
        title,
        description,
        category,
        frequency,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM compliance_items
      WHERE ${conditions.join(' AND ')}
      ORDER BY code ASC
      `,
      values,
    );
  }

  async getItemById(tenantId: string, itemId: string): Promise<ComplianceItemRecord | null> {
    return this.databaseService.queryOne<ComplianceItemRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        code,
        title,
        description,
        category,
        frequency,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM compliance_items
      WHERE id = $1 AND tenant_id = $2
      `,
      [itemId, tenantId],
    );
  }

  async createRecord(
    tenantId: string,
    params: {
      itemId: string;
      performedByUserId: string;
      performedAt?: Date;
      status: string;
      remarks?: string | null;
      linkedSortieId?: string | null;
      linkedAircraftId?: string | null;
    },
  ): Promise<ComplianceRecordRecord> {
    const row = await this.databaseService.queryOne<ComplianceRecordRecord>(
      `
      INSERT INTO compliance_records (
        tenant_id,
        item_id,
        performed_by_user_id,
        performed_at,
        status,
        remarks,
        linked_sortie_id,
        linked_aircraft_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        tenant_id AS "tenantId",
        item_id AS "itemId",
        performed_by_user_id AS "performedByUserId",
        performed_at AS "performedAt",
        status,
        remarks,
        linked_sortie_id AS "linkedSortieId",
        linked_aircraft_id AS "linkedAircraftId",
        created_at AS "createdAt"
      `,
      [
        tenantId,
        params.itemId,
        params.performedByUserId,
        params.performedAt ?? new Date(),
        params.status,
        params.remarks ?? null,
        params.linkedSortieId ?? null,
        params.linkedAircraftId ?? null,
      ],
    );

    if (!row) {
      throw new Error('Failed to create compliance record');
    }

    return row;
  }

  async listRecords(
    tenantId: string,
    filters: {
      category?: string;
      from?: Date;
      to?: Date;
      linkedSortieId?: string;
      linkedAircraftId?: string;
    },
  ): Promise<ComplianceRecordRecord[]> {
    const conditions: string[] = ['cr.tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.category) {
      conditions.push(`ci.category = $${paramIndex++}`);
      values.push(filters.category);
    }

    if (filters.from) {
      conditions.push(`cr.performed_at >= $${paramIndex++}`);
      values.push(filters.from);
    }

    if (filters.to) {
      conditions.push(`cr.performed_at <= $${paramIndex++}`);
      values.push(filters.to);
    }

    if (filters.linkedSortieId) {
      conditions.push(`cr.linked_sortie_id = $${paramIndex++}`);
      values.push(filters.linkedSortieId);
    }

    if (filters.linkedAircraftId) {
      conditions.push(`cr.linked_aircraft_id = $${paramIndex++}`);
      values.push(filters.linkedAircraftId);
    }

    return this.databaseService.query<ComplianceRecordRecord>(
      `
      SELECT
        cr.id,
        cr.tenant_id AS "tenantId",
        cr.item_id AS "itemId",
        cr.performed_by_user_id AS "performedByUserId",
        cr.performed_at AS "performedAt",
        cr.status,
        cr.remarks,
        cr.linked_sortie_id AS "linkedSortieId",
        cr.linked_aircraft_id AS "linkedAircraftId",
        cr.created_at AS "createdAt"
      FROM compliance_records cr
      JOIN compliance_items ci ON cr.item_id = ci.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY cr.performed_at DESC
      `,
      values,
    );
  }

  async createIncident(
    tenantId: string,
    params: {
      reportedByUserId: string;
      severity: string;
      summary: string;
      details?: string | null;
      occurredAt: Date;
      linkedSortieId?: string | null;
      linkedAircraftId?: string | null;
    },
  ): Promise<ComplianceIncidentRecord> {
    const row = await this.databaseService.queryOne<ComplianceIncidentRecord>(
      `
      INSERT INTO compliance_incidents (
        tenant_id,
        reported_by_user_id,
        severity,
        summary,
        details,
        occurred_at,
        linked_sortie_id,
        linked_aircraft_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        tenant_id AS "tenantId",
        reported_by_user_id AS "reportedByUserId",
        severity,
        status,
        summary,
        details,
        occurred_at AS "occurredAt",
        linked_sortie_id AS "linkedSortieId",
        linked_aircraft_id AS "linkedAircraftId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.reportedByUserId,
        params.severity,
        params.summary,
        params.details ?? null,
        params.occurredAt,
        params.linkedSortieId ?? null,
        params.linkedAircraftId ?? null,
      ],
    );

    if (!row) {
      throw new Error('Failed to create compliance incident');
    }

    return row;
  }

  async updateIncidentStatus(
    tenantId: string,
    incidentId: string,
    status: string,
  ): Promise<ComplianceIncidentRecord> {
    const row = await this.databaseService.queryOne<ComplianceIncidentRecord>(
      `
      UPDATE compliance_incidents
      SET status = $3
      WHERE id = $1 AND tenant_id = $2
      RETURNING
        id,
        tenant_id AS "tenantId",
        reported_by_user_id AS "reportedByUserId",
        severity,
        status,
        summary,
        details,
        occurred_at AS "occurredAt",
        linked_sortie_id AS "linkedSortieId",
        linked_aircraft_id AS "linkedAircraftId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [incidentId, tenantId, status],
    );

    if (!row) {
      throw new Error('Incident not found or update failed');
    }

    return row;
  }

  async listIncidents(
    tenantId: string,
    filters: {
      status?: string;
      severity?: string;
      linkedSortieId?: string;
      linkedAircraftId?: string;
    },
  ): Promise<ComplianceIncidentRecord[]> {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }

    if (filters.severity) {
      conditions.push(`severity = $${paramIndex++}`);
      values.push(filters.severity);
    }

    if (filters.linkedSortieId) {
      conditions.push(`linked_sortie_id = $${paramIndex++}`);
      values.push(filters.linkedSortieId);
    }

    if (filters.linkedAircraftId) {
      conditions.push(`linked_aircraft_id = $${paramIndex++}`);
      values.push(filters.linkedAircraftId);
    }

    return this.databaseService.query<ComplianceIncidentRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        reported_by_user_id AS "reportedByUserId",
        severity,
        status,
        summary,
        details,
        occurred_at AS "occurredAt",
        linked_sortie_id AS "linkedSortieId",
        linked_aircraft_id AS "linkedAircraftId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM compliance_incidents
      WHERE ${conditions.join(' AND ')}
      ORDER BY occurred_at DESC
      `,
      values,
    );
  }
}

