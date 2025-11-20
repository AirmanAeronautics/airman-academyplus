import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../common/db/database.service';
import { UserRole } from './user.types';

export interface UserRecord {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findByEmail(tenantId: string, email: string): Promise<UserRecord | null> {
    return this.databaseService.queryOne<UserRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        email,
        password_hash AS "passwordHash",
        full_name AS "fullName",
        role,
        is_active AS "isActive",
        last_login_at AS "lastLoginAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM "user"
      WHERE tenant_id = $1 AND email = $2
      LIMIT 1
      `,
      [tenantId, email],
    );
  }

  async findByEmailGlobal(email: string): Promise<UserRecord | null> {
    return this.databaseService.queryOne<UserRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        email,
        password_hash AS "passwordHash",
        full_name AS "fullName",
        role,
        is_active AS "isActive",
        last_login_at AS "lastLoginAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM "user"
      WHERE email = $1
      LIMIT 1
      `,
      [email],
    );
  }

  async createUser(
    params: {
      tenantId: string;
      email: string;
      passwordHash: string;
      fullName: string;
      role: UserRole;
    },
    client?: PoolClient,
  ): Promise<UserRecord> {
    const sql = `
      INSERT INTO "user" (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        tenant_id AS "tenantId",
        email,
        password_hash AS "passwordHash",
        full_name AS "fullName",
        role,
        is_active AS "isActive",
        last_login_at AS "lastLoginAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    const params_array = [params.tenantId, params.email, params.passwordHash, params.fullName, params.role];

    if (client) {
      const { rows } = await client.query(sql, params_array);
      return rows[0];
    } else {
      const row = await this.databaseService.queryOne<UserRecord>(sql, params_array);
      if (!row) {
        throw new Error('Failed to create user');
      }
      return row;
    }
  }

  async updateLastLogin(tenantId: string, userId: string): Promise<void> {
    await this.databaseService.query(
      `
      UPDATE "user"
      SET last_login_at = now()
      WHERE id = $1 AND tenant_id = $2
      `,
      [userId, tenantId],
    );
  }

  async findById(tenantId: string, userId: string): Promise<UserRecord | null> {
    return this.databaseService.queryOne<UserRecord>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        email,
        password_hash AS "passwordHash",
        full_name AS "fullName",
        role,
        is_active AS "isActive",
        last_login_at AS "lastLoginAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM "user"
      WHERE id = $1 AND tenant_id = $2
      LIMIT 1
      `,
      [userId, tenantId],
    );
  }

  async countActiveByRole(tenantId: string, role: UserRole, client?: PoolClient): Promise<number> {
    const sql = `
      SELECT COUNT(*)::int AS count
      FROM "user"
      WHERE tenant_id = $1
        AND role = $2
        AND is_active = true
    `;
    const params = [tenantId, role];

    if (client) {
      const { rows } = await client.query(sql, params);
      return rows[0]?.count ?? 0;
    }

    const row = await this.databaseService.queryOne<{ count: number }>(sql, params);
    return row?.count ?? 0;
  }
}

