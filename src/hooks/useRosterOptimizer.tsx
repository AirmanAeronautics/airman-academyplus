import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OptimizeRequest {
  plan_id: string;
  student_ids: string[];
  instructor_ids: string[];
  aircraft_ids: string[];
  time_slots: { start: string; end: string }[];
  max_iterations?: number;
}

interface OptimizeResult {
  success: boolean;
  plan_id: string;
  assignments_created: number;
  average_score: number;
  total_iterations: number;
  execution_time_ms: number;
  unassigned_students: string[];
}

export const useRosterOptimizer = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const optimizeSchedule = async (
    request: OptimizeRequest
  ): Promise<OptimizeResult | null> => {
    setLoading(true);
    setProgress('Starting optimization...');

    try {
      const { data, error } = await supabase.functions.invoke('roster-solve', {
        body: request,
      });

      if (error) throw error;

      const result = data as OptimizeResult;

      if (result.success) {
        toast({
          title: 'Schedule Optimized',
          description: `Created ${result.assignments_created} assignments with average score ${result.average_score.toFixed(2)} in ${(result.execution_time_ms / 1000).toFixed(1)}s`,
        });

        if (result.unassigned_students.length > 0) {
          toast({
            title: 'Some Students Unassigned',
            description: `${result.unassigned_students.length} student(s) could not be scheduled`,
            variant: 'destructive',
          });
        }
      }

      setProgress('');
      return result;
    } catch (error) {
      console.error('Error optimizing schedule:', error);
      toast({
        title: 'Optimization Failed',
        description: 'Failed to optimize schedule. Please try again.',
        variant: 'destructive',
      });
      setProgress('');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    progress,
    optimizeSchedule,
  };
};
