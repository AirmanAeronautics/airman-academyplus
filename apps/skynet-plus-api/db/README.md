# Database Migrations

## Initial Setup

1. Ensure your `.env` file has a valid `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/skynet_plus?schema=public"
   ```

2. Run the initial migration:
   ```bash
   npm run db:migrate
   ```

   Or manually:
   ```bash
   psql "$DATABASE_URL" -f db/migrations/2025_11_14_0001_init_core.sql
   ```

3. Verify tables were created:
   ```bash
   npm run db:migrate:check
   ```

## Migration Files

- `2025_11_14_0001_init_core.sql` - Initial core schema (tenant, user, audit_log)

## Schema Overview

### tenant
- Multi-tenant organization table
- Includes regulatory framework code (DGCA, EASA, FAA, etc.)
- Timezone support

### user
- Tenant-scoped users
- Roles: ADMIN, OPS, INSTRUCTOR, STUDENT
- Unique email per tenant
- Password hashing handled in application layer

### audit_log
- Comprehensive audit trail
- Tenant-scoped
- JSONB meta field for flexible context storage
- Indexed for performance

## Notes

- All tables use UUID primary keys
- `updated_at` is automatically maintained via triggers
- Foreign keys use `ON DELETE CASCADE` for data integrity
- All queries should be tenant-scoped for security

