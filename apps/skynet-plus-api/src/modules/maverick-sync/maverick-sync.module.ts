import { Module } from '@nestjs/common';
import { MaverickSyncController } from './maverick-sync.controller';
import { MaverickSyncService } from './maverick-sync.service';
import { MaverickSyncRepository } from './maverick-sync.repository';

@Module({
  controllers: [MaverickSyncController],
  providers: [MaverickSyncService, MaverickSyncRepository],
  exports: [MaverickSyncService, MaverickSyncRepository],
})
export class MaverickSyncModule {}

