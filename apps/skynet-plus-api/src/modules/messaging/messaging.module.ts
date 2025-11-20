import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { MessagingRepository } from './messaging.repository';
import { RosterModule } from '../roster/roster.module';
import { FleetModule } from '../fleet/fleet.module';
import { TrainingModule } from '../training/training.module';
import { MaverickSyncModule } from '../maverick-sync/maverick-sync.module';

@Module({
  imports: [RosterModule, FleetModule, TrainingModule, MaverickSyncModule],
  controllers: [MessagingController],
  providers: [MessagingService, MessagingRepository],
  exports: [MessagingService],
})
export class MessagingModule {}

