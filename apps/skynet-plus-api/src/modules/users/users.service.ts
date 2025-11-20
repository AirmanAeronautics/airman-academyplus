import { ConflictException, Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../common/db/database.service';
import { UserRepository } from '../../core/users/user.repository';
import { UserRole } from '../../core/users/user.types';
import { ORG_ROLE_LIMITS } from './role-limits.config';

@Injectable()
export class UsersService {
  private readonly userRepository: UserRepository;

  constructor(private readonly databaseService: DatabaseService) {
    this.userRepository = new UserRepository(this.databaseService);
  }

  async enforceRoleLimit(tenantId: string, role: UserRole, client?: PoolClient): Promise<void> {
    const limit = ORG_ROLE_LIMITS[role];
    if (limit === null || limit === undefined) {
      return;
    }

    const currentCount = await this.userRepository.countActiveByRole(tenantId, role, client);
    if (currentCount >= limit) {
      throw new ConflictException(`Role ${role} limit reached for this tenant (${currentCount}/${limit})`);
    }
  }
}

