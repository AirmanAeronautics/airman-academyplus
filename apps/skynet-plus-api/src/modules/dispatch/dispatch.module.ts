import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { DispatchRepository } from './dispatch.repository';
import { EnvironmentModule } from '../environment/environment.module';
import { TrainingModule } from '../training/training.module';
import { RosterModule } from '../roster/roster.module';
import { UserRepository } from '../../core/users/user.repository';

@Module({
  imports: [EnvironmentModule, TrainingModule, RosterModule],
  controllers: [DispatchController],
  providers: [
    DispatchService,
    DispatchRepository,
    UserRepository,
  ],
  exports: [DispatchService],
})
export class DispatchModule {}
