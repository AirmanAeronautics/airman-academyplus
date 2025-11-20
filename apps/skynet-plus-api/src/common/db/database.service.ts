import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  /**
   * Execute a parameterized query and return all rows.
   * @param sql SQL query with parameterized placeholders ($1, $2, ...)
   * @param params Array of parameter values
   * @returns Array of result rows
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const result = await this.pool.query(sql, params);
      return result.rows;
    } catch (error) {
      this.logger.error('Database query error', {
        message: error instanceof Error ? error.message : String(error),
        // Don't log SQL or params to avoid leaking sensitive data
      });
      throw error;
    }
  }

  /**
   * Execute a parameterized query and return the first row, or null if no rows.
   * @param sql SQL query with parameterized placeholders ($1, $2, ...)
   * @param params Array of parameter values
   * @returns First row or null
   */
  async queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  /**
   * Get a client from the pool for transactions.
   * Remember to release the client after use.
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }
}

