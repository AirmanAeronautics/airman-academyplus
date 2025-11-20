import { Module } from '@nestjs/common';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { ScheduleRepository } from './schedule.repository';
import { UserRepository } from '../../core/users/user.repository';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService, ScheduleRepository, UserRepository],
  exports: [ScheduleService],
})
export class ScheduleModule {}

