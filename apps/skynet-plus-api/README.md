# Skynet+ API

NestJS API for Skynet+ Flight Training Operations Platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run migrations:
```bash
npm run prisma:migrate
```

5. Start development server:
```bash
npm run start:dev
```

## Project Structure

- `src/` - Source code
  - `modules/` - Feature modules (auth, tenant, users, training, fleet, etc.)
  - `common/` - Shared utilities (Prisma service, guards, interceptors)
- `prisma/` - Prisma schema and migrations

## Key Modules

- **Auth** - Authentication and JWT token management
- **Tenant** - Multi-tenant resolution from JWT
- **Users** - User management (tenant-scoped)
- **Training** - Lessons, student/instructor profiles
- **Fleet** - Aircraft management
- **Availability** - Instructor/student availability blocks
- **Environment** - WX/NOTAM/Traffic snapshots
- **Roster** - Roster planning and assignments (integrates with roster-engine)
- **Dispatch** - Dispatch release workflow
- **Audit** - Audit logging
- **Automation** - Outbox event processing

## Development

- API runs on `http://localhost:3000`
- Global prefix: `/api`
- Health check: `GET /api/health`

