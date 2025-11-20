import { Injectable } from '@nestjs/common';
import { EnvironmentRepository, EnvironmentSnapshotRecord } from './environment.repository';
import { IngestEnvironmentDto } from './dto/ingest-environment.dto';

export interface DerivedFlags {
  wxBelowVfrMinima: boolean;
  strongCrosswind: boolean;
  runwayClosed: boolean;
  highTraffic: boolean;
}

@Injectable()
export class EnvironmentService {
  constructor(private readonly repository: EnvironmentRepository) {}

  /**
   * Evaluate derived flags from raw environment data.
   * Simple heuristics (not hardcore meteorology):
   * - wxBelowVfrMinima: vis < 5km OR ceiling < 3000 ft
   * - strongCrosswind: crosswind component > 12-15 kt (if data exists, else false)
   * - runwayClosed: true if any NOTAM contains something like "RWY XX CLSD"
   * - highTraffic: true if trafficJson.densityIndex > 0.7
   */
  evaluateDerivedFlags(raw: {
    metarJson?: any;
    tafJson?: any;
    notamsJson?: any;
    trafficJson?: any;
  }): DerivedFlags {
    const flags: DerivedFlags = {
      wxBelowVfrMinima: false,
      strongCrosswind: false,
      runwayClosed: false,
      highTraffic: false,
    };

    // Check METAR for VFR minima
    if (raw.metarJson) {
      // Visibility check: assume vis is in meters or km
      const visibility = raw.metarJson.visibility;
      if (visibility !== undefined) {
        // Convert to km if needed (assume meters if > 100, otherwise km)
        const visKm = visibility > 100 ? visibility / 1000 : visibility;
        if (visKm < 5) {
          flags.wxBelowVfrMinima = true;
        }
      }

      // Ceiling check: assume ceiling is in feet
      const ceiling = raw.metarJson.ceiling;
      if (ceiling !== undefined && ceiling < 3000) {
        flags.wxBelowVfrMinima = true;
      }

      // Crosswind check: assume crosswind component is in knots
      const crosswind = raw.metarJson.crosswindComponent;
      if (crosswind !== undefined && crosswind > 15) {
        flags.strongCrosswind = true;
      } else if (raw.metarJson.windSpeed && raw.metarJson.windDirection) {
        // Simple heuristic: if wind speed > 20 kt and direction suggests crosswind
        // This is a simplified check; real crosswind calculation needs runway heading
        if (raw.metarJson.windSpeed > 20) {
          flags.strongCrosswind = true;
        }
      }
    }

    // Check NOTAMs for runway closures
    if (raw.notamsJson && Array.isArray(raw.notamsJson)) {
      for (const notam of raw.notamsJson) {
        const text = (notam.text || notam.message || '').toUpperCase();
        if (text.includes('RWY') && (text.includes('CLSD') || text.includes('CLOSED'))) {
          flags.runwayClosed = true;
          break;
        }
      }
    }

    // Check traffic density
    if (raw.trafficJson) {
      const densityIndex = raw.trafficJson.densityIndex;
      if (densityIndex !== undefined && densityIndex > 0.7) {
        flags.highTraffic = true;
      }
    }

    return flags;
  }

  async upsertSnapshot(
    tenantId: string | null,
    dto: IngestEnvironmentDto,
  ): Promise<EnvironmentSnapshotRecord> {
    // Compute derived flags before persisting
    const derivedFlags = this.evaluateDerivedFlags({
      metarJson: dto.metarJson,
      tafJson: dto.tafJson,
      notamsJson: dto.notamsJson,
      trafficJson: dto.trafficJson,
    });

    return this.repository.upsertSnapshot({
      tenantId,
      airportIcao: dto.airportIcao,
      capturedAt: new Date(dto.capturedAt),
      metarJson: dto.metarJson,
      tafJson: dto.tafJson,
      notamsJson: dto.notamsJson,
      trafficJson: dto.trafficJson,
      derivedFlags,
    });
  }

  async getLatestSnapshot(
    airportIcao: string,
    tenantId?: string | null,
  ): Promise<EnvironmentSnapshotRecord | null> {
    return this.repository.getLatestSnapshotForAirport(airportIcao, tenantId);
  }

  async getSnapshotsInRange(
    airportIcao: string,
    from: Date,
    to: Date,
    tenantId?: string | null,
  ): Promise<EnvironmentSnapshotRecord[]> {
    return this.repository.getSnapshotsForAirportInRange(airportIcao, from, to, tenantId);
  }

  async getLatestSnapshotBeforeTime(
    airportIcao: string,
    beforeTime: Date,
    tenantId?: string | null,
  ): Promise<EnvironmentSnapshotRecord | null> {
    return this.repository.getLatestSnapshotForAirportBeforeTime(airportIcao, beforeTime, tenantId);
  }
}
