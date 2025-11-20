import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FeasibilityRequest {
  student_id: string;
  instructor_id: string | null;
  aircraft_id: string | null;
  lesson_id: string | null;
  airport_icao: string;
  start_at: string;
  end_at: string;
}

interface ConstraintResult {
  constraint_type: string;
  passed: boolean;
  blocking: boolean;
  message: string;
  details?: any;
}

export interface FeasibilityReport {
  feasible: boolean;
  constraints: ConstraintResult[];
  blocking_issues: string[];
  warnings: string[];
}

export const useFeasibilityCheck = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const checkFeasibility = async (
    request: FeasibilityRequest
  ): Promise<FeasibilityReport | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('roster-feasibility-check', {
        body: request,
      });

      if (error) throw error;

      const report = data.data as FeasibilityReport;

      // Show toast based on result
      if (!report.feasible) {
        toast({
          title: 'Assignment Not Feasible',
          description: `${report.blocking_issues.length} blocking issue(s) found`,
          variant: 'destructive',
        });
      } else if (report.warnings.length > 0) {
        toast({
          title: 'Assignment Feasible with Warnings',
          description: `${report.warnings.length} warning(s) found`,
        });
      } else {
        toast({
          title: 'Assignment Feasible',
          description: 'All constraints validated successfully',
        });
      }

      return report;
    } catch (error) {
      console.error('Error checking feasibility:', error);
      toast({
        title: 'Error',
        description: 'Failed to check assignment feasibility',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkFeasibility,
  };
};
