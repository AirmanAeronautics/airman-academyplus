import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { FleetRepository } from './fleet.repository';
import { CreateAircraftDto } from './dto/create-aircraft.dto';
import { UpdateAircraftDto } from './dto/update-aircraft.dto';

@Injectable()
export class FleetService {
  constructor(private readonly repository: FleetRepository) {}

  async createAircraft(tenantId: string, dto: CreateAircraftDto) {
    // Check if registration already exists
    const existing = await this.repository.listAircraft(tenantId);
    const registrationExists = existing.some((a) => a.registration === dto.registration);
    if (registrationExists) {
      throw new ConflictException(`Aircraft with registration '${dto.registration}' already exists`);
    }

    return this.repository.createAircraft(tenantId, {
      registration: dto.registration,
      type: dto.type,
      baseAirportIcao: dto.baseAirportIcao,
      status: dto.status,
      capabilities: dto.capabilities,
    });
  }

  async listAircraft(tenantId: string, status?: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE') {
    return this.repository.listAircraft(tenantId, status);
  }

  async getAircraftById(tenantId: string, aircraftId: string) {
    const aircraft = await this.repository.getAircraftById(tenantId, aircraftId);
    if (!aircraft) {
      throw new NotFoundException(`Aircraft with id '${aircraftId}' not found`);
    }
    return aircraft;
  }

  async updateAircraft(tenantId: string, aircraftId: string, dto: UpdateAircraftDto) {
    // Verify aircraft exists
    await this.getAircraftById(tenantId, aircraftId);

    return this.repository.updateAircraft(tenantId, aircraftId, {
      baseAirportIcao: dto.baseAirportIcao,
      status: dto.status,
      capabilities: dto.capabilities,
    });
  }

  async deactivateAircraft(tenantId: string, aircraftId: string) {
    return this.repository.softDeactivateAircraft(tenantId, aircraftId);
  }
}
