import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { SupportRepository } from './support.repository';
import { UserRepository } from '../../core/users/user.repository';
import { TrainingModule } from '../training/training.module';

@Module({
  imports: [TrainingModule],
  controllers: [SupportController],
  providers: [SupportService, SupportRepository, UserRepository],
  exports: [SupportService],
})
export class SupportModule {}

