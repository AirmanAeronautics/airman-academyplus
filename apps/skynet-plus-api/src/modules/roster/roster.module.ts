import { Module } from '@nestjs/common';
import { RosterController } from './roster.controller';
import { RosterService } from './roster.service';
import { RosterRepository } from './roster.repository';
import { TrainingModule } from '../training/training.module';
import { FleetModule } from '../fleet/fleet.module';
import { MaverickSyncModule } from '../maverick-sync/maverick-sync.module';
import { UserRepository } from '../../core/users/user.repository';

@Module({
  imports: [TrainingModule, FleetModule, MaverickSyncModule],
  controllers: [RosterController],
  providers: [RosterService, RosterRepository, UserRepository],
  exports: [RosterService, RosterRepository],
})
export class RosterModule {}
