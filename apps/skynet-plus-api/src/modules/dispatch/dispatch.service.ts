import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DispatchRepository } from './dispatch.repository';
import { RosterRepository, RosterSortieRecord } from '../roster/roster.repository';
import { EnvironmentService } from '../environment/environment.service';
import { UpsertDispatchAnnotationDto } from './dto/upsert-dispatch-annotation.dto';
import { UserRepository } from '../../core/users/user.repository';
import { TrainingService } from '../training/training.service';
import { UserRole } from '../../core/users/user.types';

@Injectable()
export class DispatchService {
  constructor(
    private readonly dispatchRepository: DispatchRepository,
    private readonly rosterRepository: RosterRepository,
    private readonly environmentService: EnvironmentService,
    private readonly userRepository: UserRepository,
    private readonly trainingService: TrainingService,
  ) {}

  /**
   * Compute risk level from derived flags.
   * Simple rules:
   * - RED if wxBelowVfrMinima = true OR runwayClosed = true
   * - AMBER if highTraffic = true OR strongCrosswind = true (and not already RED)
   * - GREEN otherwise
   */
  computeRiskLevel(derivedFlags: {
    wxBelowVfrMinima?: boolean;
    strongCrosswind?: boolean;
    runwayClosed?: boolean;
    highTraffic?: boolean;
  }): 'GREEN' | 'AMBER' | 'RED' {
    if (derivedFlags.wxBelowVfrMinima === true || derivedFlags.runwayClosed === true) {
      return 'RED';
    }

    if (derivedFlags.highTraffic === true || derivedFlags.strongCrosswind === true) {
      return 'AMBER';
    }

    return 'GREEN';
  }

  async upsertDispatchAnnotation(
    tenantId: string,
    sortieId: string,
    dto: UpsertDispatchAnnotationDto,
    createdByUserId: string,
  ) {
    // Look up sortie
    const sortie = await this.rosterRepository.getSortieById(tenantId, sortieId);
    if (!sortie) {
      throw new NotFoundException('Sortie not found');
    }

    // Fetch latest snapshot for sortie's airport where captured_at <= report_time
    const snapshot = await this.environmentService.getLatestSnapshotBeforeTime(
      sortie.airportIcao,
      sortie.reportTime,
      tenantId,
    );

    let riskLevel: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
    let flags: Record<string, any> = {};
    let snapshotId: string | null = null;

    if (snapshot) {
      snapshotId = snapshot.id;
      flags = snapshot.derivedFlags || {};
      riskLevel = this.computeRiskLevel(flags);
    }

    // If no snapshot exists, fall back to GREEN with no flags
    return this.dispatchRepository.upsertDispatchAnnotation(
      tenantId,
      sortieId,
      snapshotId,
      riskLevel,
      flags,
      dto.notes || null,
      createdByUserId,
    );
  }

  async getSortieWithDispatch(
    tenantId: string,
    sortieId: string,
    currentUserId: string,
    currentUserRole: UserRole,
  ) {
    const sortie = await this.rosterRepository.getSortieById(tenantId, sortieId);
    if (!sortie) {
      throw new NotFoundException('Sortie not found');
    }

    // Enforce access control
    if (currentUserRole === 'INSTRUCTOR') {
      if (sortie.instructorUserId !== currentUserId) {
        throw new ForbiddenException('You can only access your own sorties');
      }
    } else if (currentUserRole === 'STUDENT') {
      const profile = await this.trainingService.getStudentProfileByUserId(tenantId, currentUserId);
      if (sortie.studentProfileId !== profile.id) {
        throw new ForbiddenException('You can only access your own sorties');
      }
    }
    // ADMIN and OPS can access any sortie in tenant

    const annotation = await this.dispatchRepository.getDispatchAnnotation(tenantId, sortieId);

    let snapshot = null;
    if (annotation?.snapshotId) {
      // Fetch the snapshot if annotation references one
      // For now, we'll just include snapshotId; in a full implementation,
      // you might want to join and return full snapshot data
      snapshot = { id: annotation.snapshotId };
    } else if (sortie) {
      // Try to get latest snapshot for the sortie's airport and time
      const latestSnapshot = await this.environmentService.getLatestSnapshotBeforeTime(
        sortie.airportIcao,
        sortie.reportTime,
        tenantId,
      );
      if (latestSnapshot) {
        snapshot = latestSnapshot;
      }
    }

    return {
      sortie,
      dispatchAnnotation: annotation,
      environmentSnapshot: snapshot,
    };
  }

  async getDispatchDashboard(
    tenantId: string,
    filters: {
      from?: Date;
      to?: Date;
      airportIcao?: string;
      riskLevel?: 'GREEN' | 'AMBER' | 'RED';
      status?: string;
    },
  ) {
    return this.dispatchRepository.getDispatchDashboardForOps(tenantId, filters);
  }
}
