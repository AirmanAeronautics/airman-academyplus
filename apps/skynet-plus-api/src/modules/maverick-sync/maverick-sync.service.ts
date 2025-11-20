import { Injectable, NotFoundException } from '@nestjs/common';
import { MaverickSyncRepository } from './maverick-sync.repository';

@Injectable()
export class MaverickSyncService {
  constructor(private readonly repository: MaverickSyncRepository) {}

  async listEvents(tenantId: string, status?: string, since?: string) {
    return this.repository.listEvents(tenantId, {
      status,
      since: since ? new Date(since) : undefined,
    });
  }

  async acknowledgeEvent(tenantId: string, eventId: string) {
    const event = await this.repository.acknowledgeEvent(tenantId, eventId);
    if (!event) {
      throw new NotFoundException(`Event with id '${eventId}' not found`);
    }
    return event;
  }
}

