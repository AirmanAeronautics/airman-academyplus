import { PoolClient } from 'pg';
import { DatabaseService } from '../../common/db/database.service';

export interface TenantRecord {
  id: string;
  name: string;
  regulatoryFrameworkCode: string;
  timezone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class TenantRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createTenant(
    params: {
      name: string;
      regulatoryFrameworkCode: string;
      timezone: string;
    },
    client?: PoolClient,
  ): Promise<TenantRecord> {
    const sql = `
      INSERT INTO tenant (name, regulatory_framework_code, timezone)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        name,
        regulatory_framework_code AS "regulatoryFrameworkCode",
        timezone,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    const params_array = [params.name, params.regulatoryFrameworkCode, params.timezone];

    if (client) {
      const { rows } = await client.query(sql, params_array);
      return rows[0];
    } else {
      const row = await this.databaseService.queryOne<TenantRecord>(sql, params_array);
      if (!row) {
        throw new Error('Failed to create tenant');
      }
      return row;
    }
  }

  async findById(id: string): Promise<TenantRecord | null> {
    return this.databaseService.queryOne<TenantRecord>(
      `
      SELECT
        id,
        name,
        regulatory_framework_code AS "regulatoryFrameworkCode",
        timezone,
        is_active AS "isActive",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM tenant
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    );
  }
}

