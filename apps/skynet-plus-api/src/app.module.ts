// apps/skynet-plus-api/src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './common/db/db.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TenantGuard } from './common/guards/tenant.guard';

import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { UsersModule } from './modules/users/users.module';
import { TrainingModule } from './modules/training/training.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { EnvironmentModule } from './modules/environment/environment.module';
import { RosterModule } from './modules/roster/roster.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { OpsOverviewModule } from './modules/ops-overview/ops-overview.module';
import { CrmModule } from './modules/crm/crm.module';
import { FinanceModule } from './modules/finance/finance.module';
import { SupportModule } from './modules/support/support.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { MaverickSyncModule } from './modules/maverick-sync/maverick-sync.module';
import { ComplianceModule } from './modules/compliance/compliance.module';
import { AuditModule } from './modules/audit/audit.module';
import { AutomationModule } from './modules/automation/automation.module';
import { HealthModule } from './modules/health/health.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    AuthModule,
    TenantModule,
    UsersModule,
    TrainingModule,
    FleetModule,
    AvailabilityModule,
    EnvironmentModule,
    RosterModule,
    DispatchModule,
    ScheduleModule,
    OpsOverviewModule,
    CrmModule,
    FinanceModule,
    SupportModule,
    MessagingModule,
    MaverickSyncModule,
    ComplianceModule,
    AuditModule,
    AutomationModule,
    HealthModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}

