import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CrmRepository } from './crm.repository';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { LeadFiltersDto } from './dto/lead-filters.dto';
import { CreateMarketingSourceDto } from './dto/create-marketing-source.dto';
import { UpdateMarketingSourceDto } from './dto/update-marketing-source.dto';
import { MarketingSourceFiltersDto } from './dto/marketing-source-filters.dto';
import { CreateLeadAssignmentDto } from './dto/create-lead-assignment.dto';
import { UserRepository } from '../../core/users/user.repository';

@Injectable()
export class CrmService {
  constructor(
    private readonly repository: CrmRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createLead(tenantId: string, dto: CreateLeadDto) {
    // Validate assigned user if provided
    if (dto.assignedToUserId) {
      const user = await this.userRepository.findById(tenantId, dto.assignedToUserId);
      if (!user) {
        throw new NotFoundException(`User with id '${dto.assignedToUserId}' not found`);
      }
    }

    // Check for duplicate email if provided
    if (dto.email) {
      const existing = await this.repository.listLeads(tenantId, {});
      const duplicate = existing.find((l) => l.email === dto.email);
      if (duplicate) {
        throw new ConflictException(`Lead with email '${dto.email}' already exists`);
      }
    }

    // Validate marketing source if provided
    if (dto.marketingSourceId) {
      const source = await this.repository.findMarketingSourceById(tenantId, dto.marketingSourceId);
      if (!source) {
        throw new NotFoundException(`Marketing source with id '${dto.marketingSourceId}' not found`);
      }
    }

    return this.repository.createLead(tenantId, {
      fullName: dto.fullName,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      source: dto.source,
      marketingSourceId: dto.marketingSourceId ?? null,
      stage: dto.stage ?? 'NEW',
      assignedToUserId: dto.assignedToUserId ?? null,
      notes: dto.notes ?? null,
    });
  }

  async updateLead(tenantId: string, leadId: string, dto: UpdateLeadDto) {
    const existing = await this.repository.findLeadById(tenantId, leadId);
    if (!existing) {
      throw new NotFoundException(`Lead with id '${leadId}' not found`);
    }

    // Validate assigned user if provided
    if (dto.assignedToUserId) {
      const user = await this.userRepository.findById(tenantId, dto.assignedToUserId);
      if (!user) {
        throw new NotFoundException(`User with id '${dto.assignedToUserId}' not found`);
      }
    }

    // Check for duplicate email if email is being changed
    if (dto.email && dto.email !== existing.email) {
      const allLeads = await this.repository.listLeads(tenantId, {});
      const duplicate = allLeads.find((l) => l.email === dto.email && l.id !== leadId);
      if (duplicate) {
        throw new ConflictException(`Lead with email '${dto.email}' already exists`);
      }
    }

    // Validate marketing source if provided
    if (dto.marketingSourceId !== undefined && dto.marketingSourceId !== null) {
      const source = await this.repository.findMarketingSourceById(tenantId, dto.marketingSourceId);
      if (!source) {
        throw new NotFoundException(`Marketing source with id '${dto.marketingSourceId}' not found`);
      }
    }

    return this.repository.updateLead(tenantId, leadId, {
      fullName: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      source: dto.source,
      marketingSourceId: dto.marketingSourceId,
      stage: dto.stage,
      assignedToUserId: dto.assignedToUserId,
      notes: dto.notes,
    });
  }

  async getLeadById(tenantId: string, leadId: string) {
    const lead = await this.repository.findLeadById(tenantId, leadId);
    if (!lead) {
      throw new NotFoundException(`Lead with id '${leadId}' not found`);
    }
    return lead;
  }

  async listLeads(tenantId: string, filters: LeadFiltersDto) {
    return this.repository.listLeads(tenantId, {
      stage: filters.stage,
      source: filters.source,
      assignedToUserId: filters.assignedToUserId,
      search: filters.search,
    });
  }

  async createActivity(
    tenantId: string,
    leadId: string,
    dto: CreateActivityDto,
    performedByUserId: string,
  ) {
    // Verify lead exists
    const lead = await this.repository.findLeadById(tenantId, leadId);
    if (!lead) {
      throw new NotFoundException(`Lead with id '${leadId}' not found`);
    }

    return this.repository.createActivity(tenantId, leadId, {
      type: dto.type,
      subject: dto.subject ?? null,
      details: dto.details ?? null,
      performedByUserId,
      performedAt: dto.performedAt ? new Date(dto.performedAt) : undefined,
    });
  }

  async listActivities(tenantId: string, leadId: string) {
    // Verify lead exists
    const lead = await this.repository.findLeadById(tenantId, leadId);
    if (!lead) {
      throw new NotFoundException(`Lead with id '${leadId}' not found`);
    }

    return this.repository.listActivities(tenantId, leadId);
  }

  async createCampaign(tenantId: string, dto: CreateCampaignDto) {
    return this.repository.createCampaign(tenantId, {
      name: dto.name,
      channel: dto.channel,
      budget: dto.budget ?? null,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      status: dto.status ?? 'PLANNED',
    });
  }

  async updateCampaign(tenantId: string, campaignId: string, dto: UpdateCampaignDto) {
    const existing = await this.repository.findCampaignById(tenantId, campaignId);
    if (!existing) {
      throw new NotFoundException(`Campaign with id '${campaignId}' not found`);
    }

    return this.repository.updateCampaign(tenantId, campaignId, {
      name: dto.name,
      channel: dto.channel,
      budget: dto.budget,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      status: dto.status,
    });
  }

  async listCampaigns(tenantId: string) {
    return this.repository.listCampaigns(tenantId);
  }

  async attachLeadToCampaign(tenantId: string, campaignId: string, leadId: string) {
    // Verify campaign exists
    const campaign = await this.repository.findCampaignById(tenantId, campaignId);
    if (!campaign) {
      throw new NotFoundException(`Campaign with id '${campaignId}' not found`);
    }

    // Verify lead exists
    const lead = await this.repository.findLeadById(tenantId, leadId);
    if (!lead) {
      throw new NotFoundException(`Lead with id '${leadId}' not found`);
    }

    await this.repository.attachLeadToCampaign(tenantId, leadId, campaignId);
  }

  // ===========================
  // Marketing Sources
  // ===========================

  async createMarketingSource(tenantId: string, dto: CreateMarketingSourceDto) {
    // Check for duplicate name
    const existing = await this.repository.listMarketingSources(tenantId);
    const duplicate = existing.find((s) => s.name.toLowerCase() === dto.name.toLowerCase());
    if (duplicate) {
      throw new ConflictException(`Marketing source with name '${dto.name}' already exists`);
    }

    return this.repository.createMarketingSource(tenantId, {
      name: dto.name,
      description: dto.description ?? null,
      category: dto.category ?? 'OTHER',
      costPerLead: dto.costPerLead ?? null,
      isActive: dto.isActive ?? true,
    });
  }

  async updateMarketingSource(tenantId: string, sourceId: string, dto: UpdateMarketingSourceDto) {
    const existing = await this.repository.findMarketingSourceById(tenantId, sourceId);
    if (!existing) {
      throw new NotFoundException(`Marketing source with id '${sourceId}' not found`);
    }

    // Check for duplicate name if name is being changed
    if (dto.name && dto.name.toLowerCase() !== existing.name.toLowerCase()) {
      const allSources = await this.repository.listMarketingSources(tenantId);
      const duplicate = allSources.find((s) => s.name.toLowerCase() === dto.name.toLowerCase() && s.id !== sourceId);
      if (duplicate) {
        throw new ConflictException(`Marketing source with name '${dto.name}' already exists`);
      }
    }

    return this.repository.updateMarketingSource(tenantId, sourceId, {
      name: dto.name,
      description: dto.description,
      category: dto.category,
      costPerLead: dto.costPerLead,
      isActive: dto.isActive,
    });
  }

  async getMarketingSourceById(tenantId: string, sourceId: string) {
    const source = await this.repository.findMarketingSourceById(tenantId, sourceId);
    if (!source) {
      throw new NotFoundException(`Marketing source with id '${sourceId}' not found`);
    }
    return source;
  }

  async listMarketingSources(tenantId: string, filters?: MarketingSourceFiltersDto) {
    return this.repository.listMarketingSources(tenantId, {
      category: filters?.category,
      isActive: filters?.isActive,
    });
  }

  // ===========================
  // Lead Assignments
  // ===========================

  async createLeadAssignment(
    tenantId: string,
    leadId: string,
    dto: CreateLeadAssignmentDto,
    assignedByUserId: string,
  ) {
    // Verify lead exists
    const lead = await this.repository.findLeadById(tenantId, leadId);
    if (!lead) {
      throw new NotFoundException(`Lead with id '${leadId}' not found`);
    }

    // Validate assigned user
    const user = await this.userRepository.findById(tenantId, dto.assignedToUserId);
    if (!user) {
      throw new NotFoundException(`User with id '${dto.assignedToUserId}' not found`);
    }

    // Get current active assignment if exists
    const currentAssignment = await this.repository.getActiveAssignment(tenantId, leadId);
    const previousAssignedToUserId = currentAssignment?.assignedToUserId ?? lead.assignedToUserId ?? null;

    // Deactivate current assignment if exists
    if (currentAssignment) {
      await this.repository.unassignLead(tenantId, leadId, currentAssignment.id);
    }

    // Create new assignment
    const assignment = await this.repository.createLeadAssignment(tenantId, leadId, {
      assignedToUserId: dto.assignedToUserId,
      assignedByUserId,
      previousAssignedToUserId,
      reason: dto.reason ?? null,
    });

    // Update lead's assigned_to_user_id
    await this.repository.updateLead(tenantId, leadId, {
      assignedToUserId: dto.assignedToUserId,
    });

    return assignment;
  }

  async listLeadAssignments(tenantId: string, leadId: string, filters?: { isActive?: boolean }) {
    // Verify lead exists
    const lead = await this.repository.findLeadById(tenantId, leadId);
    if (!lead) {
      throw new NotFoundException(`Lead with id '${leadId}' not found`);
    }

    return this.repository.listLeadAssignments(tenantId, leadId, filters);
  }

  async getActiveAssignment(tenantId: string, leadId: string) {
    // Verify lead exists
    const lead = await this.repository.findLeadById(tenantId, leadId);
    if (!lead) {
      throw new NotFoundException(`Lead with id '${leadId}' not found`);
    }

    return this.repository.getActiveAssignment(tenantId, leadId);
  }

  async unassignLead(tenantId: string, leadId: string, assignmentId: string) {
    // Verify lead exists
    const lead = await this.repository.findLeadById(tenantId, leadId);
    if (!lead) {
      throw new NotFoundException(`Lead with id '${leadId}' not found`);
    }

    // Verify assignment exists
    const assignments = await this.repository.listLeadAssignments(tenantId, leadId, { isActive: true });
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) {
      throw new NotFoundException(`Active assignment with id '${assignmentId}' not found`);
    }

    await this.repository.unassignLead(tenantId, leadId, assignmentId);

    // Update lead's assigned_to_user_id to null
    await this.repository.updateLead(tenantId, leadId, {
      assignedToUserId: null,
    });
  }
}

