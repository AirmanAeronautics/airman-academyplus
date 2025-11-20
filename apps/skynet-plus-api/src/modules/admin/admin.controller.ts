import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CORE_ADMIN_ROLES } from '../../common/auth/role-groups';

@Controller('admin')
@UseGuards(RolesGuard)
export class AdminController {
  @Get('test')
  @Roles(...CORE_ADMIN_ROLES)
  async test(@CurrentUser() user: any) {
    return {
      message: 'Admin endpoint accessed successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

