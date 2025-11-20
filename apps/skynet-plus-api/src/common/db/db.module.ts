import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { DatabaseService } from './database.service';

@Global()
@Module({
  providers: [
    {
      provide: 'PG_POOL',
      useFactory: async () => {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL,
          max: 10,             // tune based on deployment
          idleTimeoutMillis: 30000,
        });

        // Optional: basic logging
        pool.on('error', (err) => {
          console.error('[PG_POOL] Unexpected error on idle client', err);
        });

        return pool;
      },
    },
    DatabaseService,
  ],
  exports: ['PG_POOL', DatabaseService],
})
export class DbModule {}

