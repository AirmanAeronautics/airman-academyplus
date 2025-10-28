import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CSVExporter } from '@/lib/exports';

export interface ReportConfig {
  reportType: string;
  reportName: string;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  filters?: Record<string, any>;
  format?: 'csv' | 'pdf' | 'excel';
  templateId?: string;
}

export interface ReportSchedule {
  templateId: string;
  scheduleName: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  dayOfWeek?: number;
  dayOfMonth?: number;
  timeOfDay?: string;
  recipients: string[];
}

export interface ReportHistoryItem {
  id: string;
  report_name: string;
  report_type: string;
  generated_at: string;
  file_url?: string;
  file_format?: string;
  row_count?: number;
  file_size_kb?: number;
  status: string;
  date_range_start?: string;
  date_range_end?: string;
}

export const useReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateReport = async (config: ReportConfig): Promise<ReportHistoryItem | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get current user's org
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // For now, generate a simple report (this will be enhanced with edge functions)
      let data: any[] = [];
      let columns: string[] = [];

      // Fetch data based on report type
      if (config.reportType === 'flight_hours') {
        const query = supabase
          .from('flight_hours_log')
          .select('*')
          .eq('org_id', profile.org_id);
        
        if (config.dateRangeStart) {
          query.gte('flight_date', config.dateRangeStart);
        }
        if (config.dateRangeEnd) {
          query.lte('flight_date', config.dateRangeEnd);
        }

        const { data: flightData, error: queryError } = await query;
        if (queryError) throw queryError;
        
        data = flightData || [];
        columns = ['student_id', 'instructor_id', 'aircraft_id', 'flight_date', 'flight_duration_hours', 'flight_type'];
      } else if (config.reportType === 'compliance') {
        const { data: complianceData, error: queryError } = await supabase
          .from('compliance_items')
          .select('*')
          .eq('org_id', profile.org_id);
        
        if (queryError) throw queryError;
        data = complianceData || [];
        columns = ['user_id', 'compliance_type_id', 'status', 'expiry_date', 'issued_date'];
      }

      // Generate CSV (for now)
      const csv = CSVExporter.toCSV(data, columns);
      const blob = new Blob([csv], { type: 'text/csv' });
      const fileSizeKb = Math.round(blob.size / 1024);

      // Create history entry
      const { data: historyEntry, error: historyError } = await supabase
        .from('report_history')
        .insert({
          org_id: profile.org_id,
          template_id: config.templateId,
          report_name: config.reportName,
          report_type: config.reportType,
          generated_by: user.id,
          file_format: config.format || 'csv',
          row_count: data.length,
          file_size_kb: fileSizeKb,
          filters_applied: config.filters || {},
          date_range_start: config.dateRangeStart,
          date_range_end: config.dateRangeEnd,
          status: 'completed'
        })
        .select()
        .single();

      if (historyError) throw historyError;

      // Download the file
      const filename = `${config.reportName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Report Generated',
        description: `${config.reportName} exported successfully with ${data.length} records.`
      });

      return historyEntry;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate report';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleReport = async (schedule: ReportSchedule): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Calculate next run time
      const nextRunAt = new Date();
      // Simple logic - can be enhanced
      if (schedule.frequency === 'daily') {
        nextRunAt.setDate(nextRunAt.getDate() + 1);
      } else if (schedule.frequency === 'weekly') {
        nextRunAt.setDate(nextRunAt.getDate() + 7);
      } else if (schedule.frequency === 'monthly') {
        nextRunAt.setMonth(nextRunAt.getMonth() + 1);
      }

      const { error: scheduleError } = await supabase
        .from('report_schedules')
        .insert({
          org_id: profile.org_id,
          template_id: schedule.templateId,
          schedule_name: schedule.scheduleName,
          frequency: schedule.frequency,
          day_of_week: schedule.dayOfWeek,
          day_of_month: schedule.dayOfMonth,
          time_of_day: schedule.timeOfDay,
          recipients: schedule.recipients,
          next_run_at: nextRunAt.toISOString(),
          is_active: true
        });

      if (scheduleError) throw scheduleError;

      toast({
        title: 'Schedule Created',
        description: `Report will be generated ${schedule.frequency}`
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to schedule report';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getReportHistory = async (limit = 10): Promise<ReportHistoryItem[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile) throw new Error('Profile not found');

      const { data, error: queryError } = await supabase
        .from('report_history')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('generated_at', { ascending: false })
        .limit(limit);

      if (queryError) throw queryError;

      return data || [];
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch report history';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getScheduledReports = async (): Promise<any[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single();

      if (!profile) return [];

      const { data } = await supabase
        .from('report_schedules')
        .select('*')
        .eq('org_id', profile.org_id)
        .eq('is_active', true)
        .order('next_run_at', { ascending: true });

      return data || [];
    } catch {
      return [];
    }
  };

  return {
    generateReport,
    scheduleReport,
    getReportHistory,
    getScheduledReports,
    isLoading,
    error
  };
};
