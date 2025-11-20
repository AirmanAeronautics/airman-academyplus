import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ComplianceRepository } from './compliance.repository';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateRecordDto } from './dto/create-record.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident-status.dto';
import { ComplianceFiltersDto } from './dto/compliance-filters.dto';

@Injectable()
export class ComplianceService {
  constructor(private readonly repository: ComplianceRepository) {}

  async createItem(tenantId: string, dto: CreateItemDto) {
    // Check for duplicate code
    const existing = await this.repository.listItems(tenantId, false);
    const duplicate = existing.find((i) => i.code === dto.code);
    if (duplicate) {
      throw new ConflictException(`Compliance item with code '${dto.code}' already exists`);
    }

    return this.repository.createItem(tenantId, {
      code: dto.code,
      title: dto.title,
      description: dto.description ?? null,
      category: dto.category,
      frequency: dto.frequency,
      isActive: dto.isActive ?? true,
    });
  }

  async listItems(tenantId: string, activeOnly: boolean = false) {
    return this.repository.listItems(tenantId, activeOnly);
  }

  async createRecord(tenantId: string, dto: CreateRecordDto, performedByUserId: string) {
    // Verify item exists
    const item = await this.repository.getItemById(tenantId, dto.itemId);
    if (!item) {
      throw new NotFoundException(`Compliance item with id '${dto.itemId}' not found`);
    }

    return this.repository.createRecord(tenantId, {
      itemId: dto.itemId,
      performedByUserId,
      performedAt: dto.performedAt ? new Date(dto.performedAt) : undefined,
      status: dto.status,
      remarks: dto.remarks ?? null,
      linkedSortieId: dto.linkedSortieId ?? null,
      linkedAircraftId: dto.linkedAircraftId ?? null,
    });
  }

  async listRecords(tenantId: string, filters: ComplianceFiltersDto) {
    return this.repository.listRecords(tenantId, {
      category: filters.category,
      from: filters.from ? new Date(filters.from) : undefined,
      to: filters.to ? new Date(filters.to) : undefined,
      linkedSortieId: filters.linkedSortieId,
      linkedAircraftId: filters.linkedAircraftId,
    });
  }

  async createIncident(tenantId: string, dto: CreateIncidentDto, reportedByUserId: string) {
    return this.repository.createIncident(tenantId, {
      reportedByUserId,
      severity: dto.severity,
      summary: dto.summary,
      details: dto.details ?? null,
      occurredAt: new Date(dto.occurredAt),
      linkedSortieId: dto.linkedSortieId ?? null,
      linkedAircraftId: dto.linkedAircraftId ?? null,
    });
  }

  async updateIncidentStatus(tenantId: string, incidentId: string, dto: UpdateIncidentStatusDto) {
    return this.repository.updateIncidentStatus(tenantId, incidentId, dto.status);
  }

  async listIncidents(
    tenantId: string,
    filters: {
      status?: string;
      severity?: string;
      linkedSortieId?: string;
      linkedAircraftId?: string;
    },
  ) {
    return this.repository.listIncidents(tenantId, filters);
  }
}

