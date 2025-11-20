import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from '../../common/db/database.service';
import { TenantRepository } from '../../core/tenants/tenant.repository';
import { UserRepository } from '../../core/users/user.repository';
import { AuditRepository } from '../../core/audit/audit.repository';
import { RegisterTenantDto } from './dto/register-tenant.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly tenantRepository: TenantRepository;
  private readonly userRepository: UserRepository;
  private readonly auditRepository: AuditRepository;

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.tenantRepository = new TenantRepository(this.databaseService);
    this.userRepository = new UserRepository(this.databaseService);
    this.auditRepository = new AuditRepository(this.databaseService);
  }

  async registerTenant(dto: RegisterTenantDto): Promise<AuthResponseDto> {
    // Use transaction for atomicity
    const client = await this.databaseService.getClient();
    try {
      await client.query('BEGIN');

      // Check if tenant already exists
      const existingTenant = await this.databaseService.query(
        'SELECT id FROM tenant WHERE name = $1 LIMIT 1',
        [dto.tenantName],
      );

      if (existingTenant.length > 0) {
        throw new ConflictException('Tenant with this name already exists');
      }

      // Check if admin email already exists
      const existingUser = await this.userRepository.findByEmailGlobal(dto.adminEmail);

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create tenant
      const tenant = await this.tenantRepository.createTenant(
        {
          name: dto.tenantName,
          regulatoryFrameworkCode: dto.regulatoryFrameworkCode,
          timezone: dto.timezone,
        },
        client,
      );

      // Hash password
      const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

      // Enforce role limit for initial SUPER_ADMIN
      await this.usersService.enforceRoleLimit(tenant.id, 'SUPER_ADMIN', client);

      // Create super admin user
      const user = await this.userRepository.createUser(
        {
          tenantId: tenant.id,
          email: dto.adminEmail,
          passwordHash,
          fullName: dto.adminFullName,
          role: 'SUPER_ADMIN',
        },
        client,
      );

      await client.query('COMMIT');

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Audit log
      await this.auditRepository.log({
        tenantId: tenant.id,
        userId: user.id,
        action: 'AUTH_REGISTER_TENANT',
        entityType: 'TENANT',
        entityId: tenant.id,
        meta: { tenantName: dto.tenantName },
      });

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          tenantId: user.tenantId,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email (global search for login)
    const user = await this.userRepository.findByEmailGlobal(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.tenantId, user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Audit log
    await this.auditRepository.log({
      tenantId: user.tenantId,
      userId: user.id,
      action: 'AUTH_LOGIN',
      entityType: 'USER',
      entityId: user.id,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.userRepository.findById(payload.tenantId, payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const accessToken = this.jwtService.sign({
        sub: user.id,
        tenantId: user.tenantId,
        role: user.role,
        fullName: user.fullName,
      });

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(user: any): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      fullName: user.fullName,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '7d',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return { accessToken, refreshToken };
  }

  async validateUser(userId: string): Promise<any> {
    // We need tenantId to find user, but we can search globally first
    // In practice, JWT will have tenantId, but for validation we'll do a broader search
    const user = await this.databaseService.queryOne<{
      id: string;
      tenantId: string;
      email: string;
      fullName: string;
      role: string;
    }>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        email,
        full_name AS "fullName",
        role
      FROM "user"
      WHERE id = $1 AND is_active = true
      LIMIT 1
      `,
      [userId],
    );

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}
