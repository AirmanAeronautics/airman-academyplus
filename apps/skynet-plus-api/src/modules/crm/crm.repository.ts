import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface CrmLeadRecord {
  id: string;
  tenantId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  source: string;
  marketingSourceId: string | null;
  stage: 'NEW' | 'CONTACTED' | 'SCHEDULED_DEMO' | 'APPLIED' | 'ENROLLED' | 'LOST';
  assignedToUserId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmActivityRecord {
  id: string;
  tenantId: string;
  leadId: string;
  type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'MEETING' | 'VISIT';
  subject: string | null;
  details: string | null;
  performedByUserId: string;
  performedAt: Date;
}

export interface CrmCampaignRecord {
  id: string;
  tenantId: string;
  name: string;
  channel: 'GOOGLE_ADS' | 'SOCIAL' | 'FAIR' | 'REFERRAL' | 'OTHER';
  budget: number | null;
  startDate: Date | null;
  endDate: Date | null;
  status: 'PLANNED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

export interface MarketingSourceRecord {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  category: 'DIGITAL' | 'SOCIAL' | 'REFERRAL' | 'EVENT' | 'DIRECT' | 'OTHER';
  isActive: boolean;
  costPerLead: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrmLeadAssignmentRecord {
  id: string;
  tenantId: string;
  leadId: string;
  assignedToUserId: string;
  assignedByUserId: string;
  previousAssignedToUserId: string | null;
  reason: string | null;
  assignedAt: Date;
  unassignedAt: Date | null;
  isActive: boolean;
}

@Injectable()
export class CrmRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createLead(
    tenantId: string,
    params: {
      fullName: string;
      email?: string | null;
      phone?: string | null;
      source: string;
      marketingSourceId?: string | null;
      stage?: string;
      assignedToUserId?: string | null;
      notes?: string | null;
    },
  ): Promise<CrmLeadRecord> {
    const row = await this.databaseService.queryOne<CrmLeadRecord>(
      `
      INSERT INTO crm_leads (
        tenant_id,
        full_name,
        email,
        phone,
        source,
        marketing_source_id,
        stage,
        assigned_to_user_id,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        tenant_id AS "tenantId",
        full_name AS "fullName",
        email,
        phone,
        source,
        marketing_source_id AS "marketingSourceId",
        stage,
        assigned_to_user_id AS "assignedToUserId",
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.fullName,
        params.email ?? null,
        params.phone ?? null,
        params.source,
        params.marketingSourceId ?? null,
        params.stage ?? 'NEW',
        params.assignedToUserId ?? null,
        params.notes ?? null,
      ],
    );

    if (!row) {
      throw new Error('Failed to create CRM lead');
    }

    return row;
  }

  async updateLead(
    tenantId: string,
    leadId: string,
    params: {
      fullName?: string;
      email?: string | null;
      phone?: string | null;
      source?: string;
      marketingSourceId?: string | null;
      stage?: string;
      assignedToUserId?: string | null;
      notes?: string | null;
    },
  ): Promise<CrmLeadRecord> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.fullName !== undefined) {
      updates.push(`full_name = $${paramIndex++}`);
      values.push(params.fullName);
    }

    if (params.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(params.email);
    }

    if (params.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(params.phone);
    }

    if (params.source !== undefined) {
      updates.push(`source = $${paramIndex++}`);
      values.push(params.source);
    }

    if (params.marketingSourceId !== undefined) {
      updates.push(`marketing_source_id = $${paramIndex++}`);
      values.push(params.marketingSourceId);
    }

    if (params.stage !== undefined) {
      updates.push(`stage = $${paramIndex++}`);
      values.push(params.stage);
    }

    if (params.assignedToUserId !== undefined) {
      updates.push(`assigned_to_user_id = $${paramIndex++}`);
      values.push(params.assignedToUserId);
    }

    if (params.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(params.notes);
    }

    if (updates.length === 0) {
      const lead = await this.findLeadById(tenantId, leadId);
      if (!lead) {
        throw new Error('Lead not found');
      }
      return lead;
    }

    values.push(leadId, tenantId);

    const row = await this.databaseService.queryOne<CrmLeadRecord>(
      `
      UPDATE crm_leads
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING
        id,
        tenant_id AS "tenantId",
        full_name AS "fullName",
        email,
        phone,
        source,
        marketing_source_id AS "marketingSourceId",
        stage,
        assigned_to_user_id AS "assignedToUserId",
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      values,
    );

    if (!row) {
      throw new Error('Lead not found or update failed');
    }

    return row;
  }

  async findLeadById(tenantId: string, leadId: string): Promise<CrmLeadRecord | null> {
    return this.databaseService.queryOne<CrmLeadRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        full_name AS "fullName",
        email,
        phone,
        source,
        marketing_source_id AS "marketingSourceId",
        stage,
        assigned_to_user_id AS "assignedToUserId",
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM crm_leads
      WHERE id = $1 AND tenant_id = $2
      `,
      [leadId, tenantId],
    );
  }

  async listLeads(
    tenantId: string,
    filters: {
      stage?: string;
      source?: string;
      assignedToUserId?: string;
      search?: string;
    },
  ): Promise<CrmLeadRecord[]> {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.stage) {
      conditions.push(`stage = $${paramIndex++}`);
      values.push(filters.stage);
    }

    if (filters.source) {
      conditions.push(`source = $${paramIndex++}`);
      values.push(filters.source);
    }

    if (filters.assignedToUserId) {
      conditions.push(`assigned_to_user_id = $${paramIndex++}`);
      values.push(filters.assignedToUserId);
    }

    if (filters.search) {
      conditions.push(
        `(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`,
      );
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    return this.databaseService.query<CrmLeadRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        full_name AS "fullName",
        email,
        phone,
        source,
        marketing_source_id AS "marketingSourceId",
        stage,
        assigned_to_user_id AS "assignedToUserId",
        notes,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM crm_leads
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
      `,
      values,
    );
  }

  async createActivity(
    tenantId: string,
    leadId: string,
    params: {
      type: string;
      subject?: string | null;
      details?: string | null;
      performedByUserId: string;
      performedAt?: Date;
    },
  ): Promise<CrmActivityRecord> {
    const row = await this.databaseService.queryOne<CrmActivityRecord>(
      `
      INSERT INTO crm_activities (
        tenant_id,
        lead_id,
        type,
        subject,
        details,
        performed_by_user_id,
        performed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        tenant_id AS "tenantId",
        lead_id AS "leadId",
        type,
        subject,
        details,
        performed_by_user_id AS "performedByUserId",
        performed_at AS "performedAt"
      `,
      [
        tenantId,
        leadId,
        params.type,
        params.subject ?? null,
        params.details ?? null,
        params.performedByUserId,
        params.performedAt ?? new Date(),
      ],
    );

    if (!row) {
      throw new Error('Failed to create CRM activity');
    }

    return row;
  }

  async listActivities(tenantId: string, leadId: string): Promise<CrmActivityRecord[]> {
    return this.databaseService.query<CrmActivityRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        lead_id AS "leadId",
        type,
        subject,
        details,
        performed_by_user_id AS "performedByUserId",
        performed_at AS "performedAt"
      FROM crm_activities
      WHERE tenant_id = $1 AND lead_id = $2
      ORDER BY performed_at DESC
      `,
      [tenantId, leadId],
    );
  }

  async createCampaign(
    tenantId: string,
    params: {
      name: string;
      channel: string;
      budget?: number | null;
      startDate?: Date | null;
      endDate?: Date | null;
      status?: string;
    },
  ): Promise<CrmCampaignRecord> {
    const row = await this.databaseService.queryOne<CrmCampaignRecord>(
      `
      INSERT INTO crm_campaigns (
        tenant_id,
        name,
        channel,
        budget,
        start_date,
        end_date,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        tenant_id AS "tenantId",
        name,
        channel,
        budget,
        start_date AS "startDate",
        end_date AS "endDate",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.name,
        params.channel,
        params.budget ?? null,
        params.startDate ?? null,
        params.endDate ?? null,
        params.status ?? 'PLANNED',
      ],
    );

    if (!row) {
      throw new Error('Failed to create CRM campaign');
    }

    return row;
  }

  async updateCampaign(
    tenantId: string,
    campaignId: string,
    params: {
      name?: string;
      channel?: string;
      budget?: number | null;
      startDate?: Date | null;
      endDate?: Date | null;
      status?: string;
    },
  ): Promise<CrmCampaignRecord> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(params.name);
    }

    if (params.channel !== undefined) {
      updates.push(`channel = $${paramIndex++}`);
      values.push(params.channel);
    }

    if (params.budget !== undefined) {
      updates.push(`budget = $${paramIndex++}`);
      values.push(params.budget);
    }

    if (params.startDate !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      values.push(params.startDate);
    }

    if (params.endDate !== undefined) {
      updates.push(`end_date = $${paramIndex++}`);
      values.push(params.endDate);
    }

    if (params.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(params.status);
    }

    if (updates.length === 0) {
      const campaign = await this.findCampaignById(tenantId, campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      return campaign;
    }

    values.push(campaignId, tenantId);

    const row = await this.databaseService.queryOne<CrmCampaignRecord>(
      `
      UPDATE crm_campaigns
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING
        id,
        tenant_id AS "tenantId",
        name,
        channel,
        budget,
        start_date AS "startDate",
        end_date AS "endDate",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      values,
    );

    if (!row) {
      throw new Error('Campaign not found or update failed');
    }

    return row;
  }

  async findCampaignById(tenantId: string, campaignId: string): Promise<CrmCampaignRecord | null> {
    return this.databaseService.queryOne<CrmCampaignRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        name,
        channel,
        budget,
        start_date AS "startDate",
        end_date AS "endDate",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM crm_campaigns
      WHERE id = $1 AND tenant_id = $2
      `,
      [campaignId, tenantId],
    );
  }

  async listCampaigns(tenantId: string): Promise<CrmCampaignRecord[]> {
    return this.databaseService.query<CrmCampaignRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        name,
        channel,
        budget,
        start_date AS "startDate",
        end_date AS "endDate",
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM crm_campaigns
      WHERE tenant_id = $1
      ORDER BY created_at DESC
      `,
      [tenantId],
    );
  }

  async attachLeadToCampaign(tenantId: string, leadId: string, campaignId: string): Promise<void> {
    await this.databaseService.query(
      `
      INSERT INTO crm_lead_campaigns (tenant_id, lead_id, campaign_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (tenant_id, lead_id, campaign_id) DO NOTHING
      `,
      [tenantId, leadId, campaignId],
    );
  }

  async detachLeadFromCampaign(tenantId: string, leadId: string, campaignId: string): Promise<void> {
    await this.databaseService.query(
      `
      DELETE FROM crm_lead_campaigns
      WHERE tenant_id = $1 AND lead_id = $2 AND campaign_id = $3
      `,
      [tenantId, leadId, campaignId],
    );
  }

  // ===========================
  // Marketing Sources
  // ===========================

  async createMarketingSource(
    tenantId: string,
    params: {
      name: string;
      description?: string | null;
      category?: string;
      costPerLead?: number | null;
      isActive?: boolean;
    },
  ): Promise<MarketingSourceRecord> {
    const row = await this.databaseService.queryOne<MarketingSourceRecord>(
      `
      INSERT INTO marketing_sources (
        tenant_id,
        name,
        description,
        category,
        cost_per_lead,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        tenant_id AS "tenantId",
        name,
        description,
        category,
        is_active AS "isActive",
        cost_per_lead AS "costPerLead",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.name,
        params.description ?? null,
        params.category ?? 'OTHER',
        params.costPerLead ?? null,
        params.isActive ?? true,
      ],
    );

    if (!row) {
      throw new Error('Failed to create marketing source');
    }

    return row;
  }

  async updateMarketingSource(
    tenantId: string,
    sourceId: string,
    params: {
      name?: string;
      description?: string | null;
      category?: string;
      costPerLead?: number | null;
      isActive?: boolean;
    },
  ): Promise<MarketingSourceRecord> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(params.name);
    }

    if (params.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(params.description);
    }

    if (params.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(params.category);
    }

    if (params.costPerLead !== undefined) {
      updates.push(`cost_per_lead = $${paramIndex++}`);
      values.push(params.costPerLead);
    }

    if (params.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(params.isActive);
    }

    if (updates.length === 0) {
      const source = await this.findMarketingSourceById(tenantId, sourceId);
      if (!source) {
        throw new Error('Marketing source not found');
      }
      return source;
    }

    values.push(sourceId, tenantId);

    const row = await this.databaseService.queryOne<MarketingSourceRecord>(
      `
      UPDATE marketing_sources
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING
        id,
        tenant_id AS "tenantId",
        name,
        description,
        category,
        is_active AS "isActive",
        cost_per_lead AS "costPerLead",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      values,
    );

    if (!row) {
      throw new Error('Marketing source not found or update failed');
    }

    return row;
  }

  async findMarketingSourceById(tenantId: string, sourceId: string): Promise<MarketingSourceRecord | null> {
    return this.databaseService.queryOne<MarketingSourceRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        name,
        description,
        category,
        is_active AS "isActive",
        cost_per_lead AS "costPerLead",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM marketing_sources
      WHERE id = $1 AND tenant_id = $2
      `,
      [sourceId, tenantId],
    );
  }

  async listMarketingSources(
    tenantId: string,
    filters?: {
      category?: string;
      isActive?: boolean;
    },
  ): Promise<MarketingSourceRecord[]> {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters?.category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(filters.category);
    }

    if (filters?.isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      values.push(filters.isActive);
    }

    return this.databaseService.query<MarketingSourceRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        name,
        description,
        category,
        is_active AS "isActive",
        cost_per_lead AS "costPerLead",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM marketing_sources
      WHERE ${conditions.join(' AND ')}
      ORDER BY name ASC
      `,
      values,
    );
  }

  // ===========================
  // Lead Assignments
  // ===========================

  async createLeadAssignment(
    tenantId: string,
    leadId: string,
    params: {
      assignedToUserId: string;
      assignedByUserId: string;
      previousAssignedToUserId?: string | null;
      reason?: string | null;
    },
  ): Promise<CrmLeadAssignmentRecord> {
    const row = await this.databaseService.queryOne<CrmLeadAssignmentRecord>(
      `
      INSERT INTO crm_lead_assignments (
        tenant_id,
        lead_id,
        assigned_to_user_id,
        assigned_by_user_id,
        previous_assigned_to_user_id,
        reason
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        tenant_id AS "tenantId",
        lead_id AS "leadId",
        assigned_to_user_id AS "assignedToUserId",
        assigned_by_user_id AS "assignedByUserId",
        previous_assigned_to_user_id AS "previousAssignedToUserId",
        reason,
        assigned_at AS "assignedAt",
        unassigned_at AS "unassignedAt",
        is_active AS "isActive"
      `,
      [
        tenantId,
        leadId,
        params.assignedToUserId,
        params.assignedByUserId,
        params.previousAssignedToUserId ?? null,
        params.reason ?? null,
      ],
    );

    if (!row) {
      throw new Error('Failed to create lead assignment');
    }

    return row;
  }

  async listLeadAssignments(
    tenantId: string,
    leadId: string,
    filters?: {
      isActive?: boolean;
    },
  ): Promise<CrmLeadAssignmentRecord[]> {
    const conditions: string[] = ['tenant_id = $1', 'lead_id = $2'];
    const values: any[] = [tenantId, leadId];
    let paramIndex = 3;

    if (filters?.isActive !== undefined) {
      conditions.push(`is_active = $${paramIndex++}`);
      values.push(filters.isActive);
    }

    return this.databaseService.query<CrmLeadAssignmentRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        lead_id AS "leadId",
        assigned_to_user_id AS "assignedToUserId",
        assigned_by_user_id AS "assignedByUserId",
        previous_assigned_to_user_id AS "previousAssignedToUserId",
        reason,
        assigned_at AS "assignedAt",
        unassigned_at AS "unassignedAt",
        is_active AS "isActive"
      FROM crm_lead_assignments
      WHERE ${conditions.join(' AND ')}
      ORDER BY assigned_at DESC
      `,
      values,
    );
  }

  async getActiveAssignment(
    tenantId: string,
    leadId: string,
  ): Promise<CrmLeadAssignmentRecord | null> {
    return this.databaseService.queryOne<CrmLeadAssignmentRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        lead_id AS "leadId",
        assigned_to_user_id AS "assignedToUserId",
        assigned_by_user_id AS "assignedByUserId",
        previous_assigned_to_user_id AS "previousAssignedToUserId",
        reason,
        assigned_at AS "assignedAt",
        unassigned_at AS "unassignedAt",
        is_active AS "isActive"
      FROM crm_lead_assignments
      WHERE tenant_id = $1 AND lead_id = $2 AND is_active = true
      ORDER BY assigned_at DESC
      LIMIT 1
      `,
      [tenantId, leadId],
    );
  }

  async unassignLead(
    tenantId: string,
    leadId: string,
    assignmentId: string,
  ): Promise<void> {
    await this.databaseService.query(
      `
      UPDATE crm_lead_assignments
      SET is_active = false, unassigned_at = now()
      WHERE id = $1 AND tenant_id = $2 AND lead_id = $3 AND is_active = true
      `,
      [assignmentId, tenantId, leadId],
    );
  }
}

