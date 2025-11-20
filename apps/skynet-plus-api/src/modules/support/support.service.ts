import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupportRepository } from './support.repository';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { TicketFiltersDto } from './dto/ticket-filters.dto';
import { UserRepository } from '../../core/users/user.repository';
import { TrainingService } from '../training/training.service';
import { UserRole } from '../../core/users/user.types';
import { SUPPORT_MANAGEMENT_ROLES } from '../../common/auth/role-groups';

@Injectable()
export class SupportService {
  constructor(
    private readonly repository: SupportRepository,
    private readonly userRepository: UserRepository,
    private readonly trainingService: TrainingService,
  ) {}

  async createTicket(tenantId: string, dto: CreateTicketDto, createdByUserId: string) {
    await this.ensureStudentProfileExists(tenantId, dto.linkedStudentProfileId);

    return this.repository.createTicket(tenantId, {
      createdByUserId,
      category: dto.category,
      priority: dto.priority ?? 'MEDIUM',
      subject: dto.subject,
      description: dto.description,
      linkedSortieId: dto.linkedSortieId ?? null,
      linkedAircraftId: dto.linkedAircraftId ?? null,
      linkedInvoiceId: dto.linkedInvoiceId ?? null,
      linkedStudentProfileId: dto.linkedStudentProfileId ?? null,
    });
  }

  async updateTicket(
    tenantId: string,
    ticketId: string,
    dto: UpdateTicketDto,
    currentUserRole: UserRole,
  ) {
    if (!SUPPORT_MANAGEMENT_ROLES.includes(currentUserRole)) {
      throw new ForbiddenException('Only support staff and tenant admins can update tickets');
    }

    const ticket = await this.repository.getTicketById(tenantId, ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket with id '${ticketId}' not found`);
    }

    // Validate assigned user if provided
    if (dto.assignedToUserId) {
      const user = await this.userRepository.findById(tenantId, dto.assignedToUserId);
      if (!user) {
        throw new NotFoundException(`User with id '${dto.assignedToUserId}' not found`);
      }
    }

    await this.ensureStudentProfileExists(tenantId, dto.linkedStudentProfileId);

    return this.repository.updateTicket(tenantId, ticketId, {
      status: dto.status,
      assignedToUserId: dto.assignedToUserId,
      priority: dto.priority,
      linkedSortieId: dto.linkedSortieId,
      linkedAircraftId: dto.linkedAircraftId,
      linkedInvoiceId: dto.linkedInvoiceId,
      linkedStudentProfileId: dto.linkedStudentProfileId,
    });
  }

  async getTicketById(tenantId: string, ticketId: string) {
    const ticket = await this.repository.getTicketById(tenantId, ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket with id '${ticketId}' not found`);
    }
    return ticket;
  }

  async listTickets(
    tenantId: string,
    filters: TicketFiltersDto,
    currentUserRole: UserRole,
    currentUserId: string,
  ) {
    if (!SUPPORT_MANAGEMENT_ROLES.includes(currentUserRole)) {
      return this.repository.listTickets(tenantId, {
        ...filters,
        createdByUserId: currentUserId,
      });
    }

    return this.repository.listTickets(tenantId, {
      status: filters.status,
      category: filters.category,
      linkedSortieId: filters.linkedSortieId,
      linkedAircraftId: filters.linkedAircraftId,
      linkedInvoiceId: filters.linkedInvoiceId,
      linkedStudentProfileId: filters.linkedStudentProfileId,
    });
  }

  async getMyTickets(tenantId: string, currentUserId: string) {
    return this.repository.listTickets(tenantId, {
      createdByUserId: currentUserId,
    });
  }

  async createMessage(
    tenantId: string,
    ticketId: string,
    dto: CreateMessageDto,
    senderUserId: string,
  ) {
    // Verify ticket exists
    const ticket = await this.repository.getTicketById(tenantId, ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket with id '${ticketId}' not found`);
    }

    // Verify user is a participant (created ticket, assigned to it, or has sent messages)
    const isParticipant = await this.repository.isTicketParticipant(tenantId, ticketId, senderUserId);
    if (!isParticipant) {
      throw new ForbiddenException('You can only send messages to tickets you are involved with');
    }

    return this.repository.createMessage(tenantId, ticketId, {
      senderUserId,
      message: dto.message,
    });
  }

  async listMessages(tenantId: string, ticketId: string, currentUserId: string) {
    // Verify ticket exists
    const ticket = await this.repository.getTicketById(tenantId, ticketId);
    if (!ticket) {
      throw new NotFoundException(`Ticket with id '${ticketId}' not found`);
    }

    // Verify user is a participant
    const isParticipant = await this.repository.isTicketParticipant(tenantId, ticketId, currentUserId);
    if (!isParticipant) {
      throw new ForbiddenException('You can only view messages for tickets you are involved with');
    }

    return this.repository.listMessages(tenantId, ticketId);
  }

  private async ensureStudentProfileExists(tenantId: string, studentProfileId?: string | null) {
    if (!studentProfileId) {
      return;
    }

    await this.trainingService.getStudentProfileById(tenantId, studentProfileId);
  }
}

