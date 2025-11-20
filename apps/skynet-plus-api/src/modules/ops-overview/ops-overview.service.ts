import { Injectable } from '@nestjs/common';
import { OpsOverviewRepository, OpsSummaryData } from './ops-overview.repository';

@Injectable()
export class OpsOverviewService {
  constructor(private readonly repository: OpsOverviewRepository) {}

  async getDailySummary(tenantId: string, date: string): Promise<OpsSummaryData> {
    const dateObj = new Date(date);
    
    // Compute summary from sorties
    const summary = await this.repository.computeDailySummaryFromSorties(tenantId, dateObj);

    // Optionally persist to ops_daily_summary table for caching
    await this.repository.upsertDailySummary(tenantId, dateObj, {
      totalSorties: summary.totalSorties,
      completed: summary.completed,
      cancelled: summary.cancelled,
      noShow: summary.noShow,
      utilizationPercent: summary.overallUtilization,
    });

    return summary;
  }

  async getSummaryRange(tenantId: string, from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // For each date in range, compute and cache summary
    const summaries: OpsSummaryData[] = [];
    const currentDate = new Date(fromDate);
    
    while (currentDate <= toDate) {
      const summary = await this.getDailySummary(tenantId, currentDate.toISOString().split('T')[0]);
      summaries.push(summary);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return summaries;
  }

  async getUtilizationByAirport(tenantId: string, airportIcao: string, date: string) {
    const dateObj = new Date(date);
    return this.repository.computeUtilizationByAirport(tenantId, airportIcao, dateObj);
  }
}

