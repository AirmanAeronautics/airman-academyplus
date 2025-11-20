import { Injectable } from '@nestjs/common';

@Injectable()
export class AutomationService {
  constructor() {}

  // TODO: Scan OutboxEvent and fire webhooks (Maverick, n8n, etc.)
}

