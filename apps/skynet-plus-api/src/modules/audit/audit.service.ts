import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';
import { AuditRepository } from '../../core/audit/audit.repository';

@Injectable()
export class AuditService {
  private readonly auditRepository: AuditRepository;

  constructor(private readonly databaseService: DatabaseService) {
    this.auditRepository = new AuditRepository(this.databaseService);
  }

  async log(
    tenantId: string,
    actorId: string | null,
    entityType: string,
    entityId: string | null,
    action: string,
    payload: Record<string, any>,
  ): Promise<void> {
    await this.auditRepository.log({
      tenantId,
      userId: actorId,
      action,
      entityType,
      entityId,
      meta: payload,
    });
  }
}

