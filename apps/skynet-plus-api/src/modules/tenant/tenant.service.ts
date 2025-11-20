import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/db/database.service';
import { TenantRepository } from '../../core/tenants/tenant.repository';

@Injectable()
export class TenantService {
  private readonly tenantRepository: TenantRepository;

  constructor(private readonly databaseService: DatabaseService) {
    this.tenantRepository = new TenantRepository(this.databaseService);
  }

  async findById(id: string) {
    return this.tenantRepository.findById(id);
  }

  // Resolve tenant from JWT payload (used by guards/interceptors)
  async resolveTenant(tenantId: string) {
    return this.tenantRepository.findById(tenantId);
  }
}

