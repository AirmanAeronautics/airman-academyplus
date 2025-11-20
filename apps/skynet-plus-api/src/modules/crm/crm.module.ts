import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { CrmRepository } from './crm.repository';
import { UserRepository } from '../../core/users/user.repository';

@Module({
  controllers: [CrmController],
  providers: [CrmService, CrmRepository, UserRepository],
  exports: [CrmService],
})
export class CrmModule {}

