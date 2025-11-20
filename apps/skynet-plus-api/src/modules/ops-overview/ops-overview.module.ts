import { Module } from '@nestjs/common';
import { OpsOverviewController } from './ops-overview.controller';
import { OpsOverviewService } from './ops-overview.service';
import { OpsOverviewRepository } from './ops-overview.repository';

@Module({
  controllers: [OpsOverviewController],
  providers: [OpsOverviewService, OpsOverviewRepository],
  exports: [OpsOverviewService],
})
export class OpsOverviewModule {}

