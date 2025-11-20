import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';

export interface SupportTicketRecord {
  id: string;
  tenantId: string;
  createdByUserId: string;
  assignedToUserId: string | null;
  category: 'TECHNICAL' | 'SCHEDULING' | 'BILLING' | 'MAINTENANCE' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  subject: string;
  description: string;
  linkedSortieId: string | null;
  linkedAircraftId: string | null;
  linkedInvoiceId: string | null;
  linkedStudentProfileId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicketMessageRecord {
  id: string;
  tenantId: string;
  ticketId: string;
  senderUserId: string;
  message: string;
  createdAt: Date;
}

@Injectable()
export class SupportRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createTicket(
    tenantId: string,
    params: {
      createdByUserId: string;
      category: string;
      priority?: string;
      subject: string;
      description: string;
      linkedSortieId?: string | null;
      linkedAircraftId?: string | null;
      linkedInvoiceId?: string | null;
      linkedStudentProfileId?: string | null;
    },
  ): Promise<SupportTicketRecord> {
    const row = await this.databaseService.queryOne<SupportTicketRecord>(
      `
      INSERT INTO support_tickets (
        tenant_id,
        created_by_user_id,
        category,
        priority,
        subject,
        description,
        linked_sortie_id,
        linked_aircraft_id,
        linked_invoice_id,
        linked_student_profile_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING
        id,
        tenant_id AS "tenantId",
        created_by_user_id AS "createdByUserId",
        assigned_to_user_id AS "assignedToUserId",
        category,
        priority,
        status,
        subject,
        description,
        linked_sortie_id AS "linkedSortieId",
        linked_aircraft_id AS "linkedAircraftId",
        linked_invoice_id AS "linkedInvoiceId",
        linked_student_profile_id AS "linkedStudentProfileId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        tenantId,
        params.createdByUserId,
        params.category,
        params.priority ?? 'MEDIUM',
        params.subject,
        params.description,
        params.linkedSortieId ?? null,
        params.linkedAircraftId ?? null,
        params.linkedInvoiceId ?? null,
        params.linkedStudentProfileId ?? null,
      ],
    );

    if (!row) {
      throw new Error('Failed to create support ticket');
    }

    return row;
  }

  async updateTicket(
    tenantId: string,
    ticketId: string,
    params: {
      status?: string;
      assignedToUserId?: string | null;
      priority?: string;
      linkedSortieId?: string | null;
      linkedAircraftId?: string | null;
      linkedInvoiceId?: string | null;
      linkedStudentProfileId?: string | null;
    },
  ): Promise<SupportTicketRecord> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(params.status);
    }

    if (params.assignedToUserId !== undefined) {
      updates.push(`assigned_to_user_id = $${paramIndex++}`);
      values.push(params.assignedToUserId);
    }

    if (params.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(params.priority);
    }

    if (params.linkedSortieId !== undefined) {
      updates.push(`linked_sortie_id = $${paramIndex++}`);
      values.push(params.linkedSortieId);
    }

    if (params.linkedAircraftId !== undefined) {
      updates.push(`linked_aircraft_id = $${paramIndex++}`);
      values.push(params.linkedAircraftId);
    }

    if (params.linkedInvoiceId !== undefined) {
      updates.push(`linked_invoice_id = $${paramIndex++}`);
      values.push(params.linkedInvoiceId);
    }

    if (params.linkedStudentProfileId !== undefined) {
      updates.push(`linked_student_profile_id = $${paramIndex++}`);
      values.push(params.linkedStudentProfileId);
    }

    if (updates.length === 0) {
      const ticket = await this.getTicketById(tenantId, ticketId);
      if (!ticket) {
        throw new Error('Ticket not found');
      }
      return ticket;
    }

    values.push(ticketId, tenantId);

    const row = await this.databaseService.queryOne<SupportTicketRecord>(
      `
      UPDATE support_tickets
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
      RETURNING
        id,
        tenant_id AS "tenantId",
        created_by_user_id AS "createdByUserId",
        assigned_to_user_id AS "assignedToUserId",
        category,
        priority,
        status,
        subject,
        description,
        linked_sortie_id AS "linkedSortieId",
        linked_aircraft_id AS "linkedAircraftId",
        linked_invoice_id AS "linkedInvoiceId",
        linked_student_profile_id AS "linkedStudentProfileId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      values,
    );

    if (!row) {
      throw new Error('Ticket not found or update failed');
    }

    return row;
  }

  async getTicketById(tenantId: string, ticketId: string): Promise<SupportTicketRecord | null> {
    return this.databaseService.queryOne<SupportTicketRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        created_by_user_id AS "createdByUserId",
        assigned_to_user_id AS "assignedToUserId",
        category,
        priority,
        status,
        subject,
        description,
        linked_sortie_id AS "linkedSortieId",
        linked_aircraft_id AS "linkedAircraftId",
        linked_invoice_id AS "linkedInvoiceId",
        linked_student_profile_id AS "linkedStudentProfileId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM support_tickets
      WHERE id = $1 AND tenant_id = $2
      `,
      [ticketId, tenantId],
    );
  }

  async listTickets(
    tenantId: string,
    filters: {
      status?: string;
      category?: string;
      createdByUserId?: string;
      linkedSortieId?: string;
      linkedAircraftId?: string;
      linkedInvoiceId?: string;
      linkedStudentProfileId?: string;
    },
  ): Promise<SupportTicketRecord[]> {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];
    let paramIndex = 2;

    if (filters.status) {
      conditions.push(`status = $${paramIndex++}`);
      values.push(filters.status);
    }

    if (filters.category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(filters.category);
    }

    if (filters.createdByUserId) {
      conditions.push(`created_by_user_id = $${paramIndex++}`);
      values.push(filters.createdByUserId);
    }

    if (filters.linkedSortieId) {
      conditions.push(`linked_sortie_id = $${paramIndex++}`);
      values.push(filters.linkedSortieId);
    }

    if (filters.linkedAircraftId) {
      conditions.push(`linked_aircraft_id = $${paramIndex++}`);
      values.push(filters.linkedAircraftId);
    }

    if (filters.linkedInvoiceId) {
      conditions.push(`linked_invoice_id = $${paramIndex++}`);
      values.push(filters.linkedInvoiceId);
    }

    if (filters.linkedStudentProfileId) {
      conditions.push(`linked_student_profile_id = $${paramIndex++}`);
      values.push(filters.linkedStudentProfileId);
    }

    return this.databaseService.query<SupportTicketRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        created_by_user_id AS "createdByUserId",
        assigned_to_user_id AS "assignedToUserId",
        category,
        priority,
        status,
        subject,
        description,
        linked_sortie_id AS "linkedSortieId",
        linked_aircraft_id AS "linkedAircraftId",
        linked_invoice_id AS "linkedInvoiceId",
        linked_student_profile_id AS "linkedStudentProfileId",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM support_tickets
      WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
      `,
      values,
    );
  }

  async createMessage(
    tenantId: string,
    ticketId: string,
    params: {
      senderUserId: string;
      message: string;
    },
  ): Promise<SupportTicketMessageRecord> {
    const row = await this.databaseService.queryOne<SupportTicketMessageRecord>(
      `
      INSERT INTO support_ticket_messages (
        tenant_id,
        ticket_id,
        sender_user_id,
        message
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        tenant_id AS "tenantId",
        ticket_id AS "ticketId",
        sender_user_id AS "senderUserId",
        message,
        created_at AS "createdAt"
      `,
      [tenantId, ticketId, params.senderUserId, params.message],
    );

    if (!row) {
      throw new Error('Failed to create ticket message');
    }

    return row;
  }

  async listMessages(tenantId: string, ticketId: string): Promise<SupportTicketMessageRecord[]> {
    return this.databaseService.query<SupportTicketMessageRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        ticket_id AS "ticketId",
        sender_user_id AS "senderUserId",
        message,
        created_at AS "createdAt"
      FROM support_ticket_messages
      WHERE tenant_id = $1 AND ticket_id = $2
      ORDER BY created_at ASC
      `,
      [tenantId, ticketId],
    );
  }

  async isTicketParticipant(tenantId: string, ticketId: string, userId: string): Promise<boolean> {
    const ticket = await this.getTicketById(tenantId, ticketId);
    if (!ticket) {
      return false;
    }

    // User is participant if they created the ticket, are assigned to it, or have sent messages
    if (ticket.createdByUserId === userId || ticket.assignedToUserId === userId) {
      return true;
    }

    const messages = await this.listMessages(tenantId, ticketId);
    return messages.some((m) => m.senderUserId === userId);
  }
}

