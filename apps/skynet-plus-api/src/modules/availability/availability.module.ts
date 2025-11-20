import { Module } from '@nestjs/common';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { AvailabilityRepository } from './availability.repository';
import { UserRepository } from '../../core/users/user.repository';
import { FleetModule } from '../fleet/fleet.module';

@Module({
  imports: [FleetModule],
  controllers: [AvailabilityController],
  providers: [AvailabilityService, AvailabilityRepository, UserRepository],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
