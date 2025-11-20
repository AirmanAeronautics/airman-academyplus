import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { ScheduleRepository } from './schedule.repository';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { SetInstructorBlocksDto } from './dto/set-instructor-blocks.dto';
import { UserRepository } from '../../core/users/user.repository';
import { UserRole } from '../../core/users/user.types';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly repository: ScheduleRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async createBlock(tenantId: string, dto: CreateBlockDto) {
    // Validate start_minutes < end_minutes
    if (dto.startMinutes >= dto.endMinutes) {
      throw new ConflictException('startMinutes must be less than endMinutes');
    }

    // Check for duplicate label
    const existingBlocks = await this.repository.listBlocks(tenantId);
    const duplicate = existingBlocks.find((b) => b.label === dto.label);
    if (duplicate) {
      throw new ConflictException(`Block with label '${dto.label}' already exists`);
    }

    return this.repository.createBlock(tenantId, {
      label: dto.label,
      startMinutes: dto.startMinutes,
      endMinutes: dto.endMinutes,
    });
  }

  async listBlocks(tenantId: string) {
    return this.repository.listBlocks(tenantId);
  }

  async getBlockById(tenantId: string, blockId: string) {
    const block = await this.repository.getBlockById(tenantId, blockId);
    if (!block) {
      throw new NotFoundException(`Block with id '${blockId}' not found`);
    }
    return block;
  }

  async updateBlock(tenantId: string, blockId: string, dto: UpdateBlockDto) {
    // Check block exists
    const existing = await this.repository.getBlockById(tenantId, blockId);
    if (!existing) {
      throw new NotFoundException(`Block with id '${blockId}' not found`);
    }

    // Validate start_minutes < end_minutes if both are provided
    const startMinutes = dto.startMinutes ?? existing.startMinutes;
    const endMinutes = dto.endMinutes ?? existing.endMinutes;
    if (startMinutes >= endMinutes) {
      throw new ConflictException('startMinutes must be less than endMinutes');
    }

    // Check for duplicate label if label is being updated
    if (dto.label && dto.label !== existing.label) {
      const existingBlocks = await this.repository.listBlocks(tenantId);
      const duplicate = existingBlocks.find((b) => b.label === dto.label);
      if (duplicate) {
        throw new ConflictException(`Block with label '${dto.label}' already exists`);
      }
    }

    return this.repository.updateBlock(tenantId, blockId, {
      label: dto.label,
      startMinutes: dto.startMinutes,
      endMinutes: dto.endMinutes,
    });
  }

  async deleteBlock(tenantId: string, blockId: string) {
    const block = await this.repository.getBlockById(tenantId, blockId);
    if (!block) {
      throw new NotFoundException(`Block with id '${blockId}' not found`);
    }

    await this.repository.deleteBlock(tenantId, blockId);
  }

  async setInstructorDailySchedule(
    tenantId: string,
    instructorUserId: string,
    dto: SetInstructorBlocksDto,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    // Verify instructor exists
    const instructor = await this.userRepository.findById(tenantId, instructorUserId);
    if (!instructor) {
      throw new NotFoundException(`Instructor with id '${instructorUserId}' not found`);
    }

    // Enforce access control: INSTRUCTOR can only set their own schedule
    if (currentUserRole === 'INSTRUCTOR' && currentUserId !== instructorUserId) {
      throw new ForbiddenException('You can only set your own schedule');
    }

    // Validate all blocks exist
    const date = new Date(dto.date);
    for (const blockDto of dto.blocks) {
      const block = await this.repository.getBlockById(tenantId, blockDto.blockId);
      if (!block) {
        throw new NotFoundException(`Block with id '${blockDto.blockId}' not found`);
      }
    }

    return this.repository.setInstructorDailySchedule(tenantId, instructorUserId, date, dto.blocks);
  }

  async getInstructorDailySchedule(
    tenantId: string,
    instructorUserId: string,
    date: string,
  ) {
    // Verify instructor exists
    const instructor = await this.userRepository.findById(tenantId, instructorUserId);
    if (!instructor) {
      throw new NotFoundException(`Instructor with id '${instructorUserId}' not found`);
    }

    const dateObj = new Date(date);
    return this.repository.getInstructorDailySchedule(tenantId, instructorUserId, dateObj);
  }
}

