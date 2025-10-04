import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScoreRequest {
  plan_id: string;
  student_id: string;
  instructor_id: string;
  aircraft_id: string;
  airport_icao: string;
  start_at: string;
  end_at: string;
  lesson_id?: string;
}

export interface ScoreBreakdown {
  weather_fit: number;
  instructor_balance: number;
  travel_min: number;
  aircraft_utilization: number;
  student_continuity: number;
  cancellation_risk: number;
}

export interface ScoreResult {
  total_score: number;
  breakdown: ScoreBreakdown;
  computed_at: string;
}

export const useRosterScoring = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const scoreAssignment = async (request: ScoreRequest): Promise<ScoreResult | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('roster-score-assignment', {
        body: request,
      });

      if (error) throw error;

      toast({
        title: 'Assignment Scored',
        description: `Total score: ${(data.data.total_score * 100).toFixed(0)}%`,
      });

      return data.data;
    } catch (error) {
      console.error('Error scoring assignment:', error);
      toast({
        title: 'Scoring Error',
        description: 'Failed to score assignment',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const scoreBatch = async (requests: ScoreRequest[]): Promise<ScoreResult[]> => {
    setLoading(true);
    try {
      const results = await Promise.all(
        requests.map(async (req) => {
          const { data, error } = await supabase.functions.invoke('roster-score-assignment', {
            body: req,
          });
          if (error) throw error;
          return data.data;
        })
      );

      toast({
        title: 'Batch Scoring Complete',
        description: `Scored ${results.length} assignments`,
      });

      return results;
    } catch (error) {
      console.error('Error in batch scoring:', error);
      toast({
        title: 'Batch Scoring Error',
        description: 'Failed to score some assignments',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const compareAssignments = (a: ScoreResult, b: ScoreResult) => {
    return {
      winner: a.total_score > b.total_score ? 'a' : b.total_score > a.total_score ? 'b' : 'tie',
      difference: Math.abs(a.total_score - b.total_score),
      breakdown_comparison: {
        weather_fit: a.breakdown.weather_fit - b.breakdown.weather_fit,
        instructor_balance: a.breakdown.instructor_balance - b.breakdown.instructor_balance,
        travel_min: a.breakdown.travel_min - b.breakdown.travel_min,
        aircraft_utilization: a.breakdown.aircraft_utilization - b.breakdown.aircraft_utilization,
        student_continuity: a.breakdown.student_continuity - b.breakdown.student_continuity,
        cancellation_risk: a.breakdown.cancellation_risk - b.breakdown.cancellation_risk,
      },
    };
  };

  return {
    loading,
    scoreAssignment,
    scoreBatch,
    compareAssignments,
  };
};
