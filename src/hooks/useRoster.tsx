import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RosterPlan {
  id: string;
  org_id: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'active' | 'archived';
  objective_weights: {
    weather_fit: number;
    instructor_balance: number;
    travel_min: number;
    aircraft_utilization: number;
    student_continuity: number;
    cancellation_risk: number;
  };
  created_at: string;
  updated_at: string;
}

interface RosterAssignment {
  id: string;
  plan_id: string;
  org_id: string;
  lesson_id: string | null;
  student_id: string;
  instructor_id: string | null;
  aircraft_id: string | null;
  airport_icao: string;
  start_at: string;
  end_at: string;
  status: 'scheduled' | 'pending_confirm' | 'cancelled' | 'completed';
  feasibility_proof: any;
  score_breakdown: any;
  sync_state: any;
}

export const useRoster = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createPlan = async (
    period_start: string,
    period_end: string,
    objective_weights?: any
  ): Promise<RosterPlan | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('roster-plan-create', {
        body: { period_start, period_end, objective_weights },
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Roster plan created successfully',
      });

      return data.data;
    } catch (error) {
      console.error('Error creating roster plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create roster plan',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPlan = async (planId: string): Promise<RosterPlan | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('roster-plan-get', {
        body: { plan_id: planId },
      });

      if (error) throw error;
      return data.data;
    } catch (error) {
      console.error('Error fetching roster plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch roster plan',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getAssignments = async (filters?: {
    plan_id?: string;
    status?: string;
    student_id?: string;
    instructor_id?: string;
    aircraft_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<RosterAssignment[]> => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }

      const { data, error } = await supabase.functions.invoke(
        `roster-assignments-list?${queryParams.toString()}`,
        { method: 'GET' }
      );

      if (error) throw error;
      return data.data || [];
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assignments',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateAssignment = async (
    assignmentId: string,
    updates: Partial<RosterAssignment>
  ): Promise<RosterAssignment | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        `roster-assignment-update/${assignmentId}`,
        {
          body: updates,
          method: 'PATCH',
        }
      );

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Assignment updated successfully',
      });

      return data.data;
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update assignment',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createPlan,
    getPlan,
    getAssignments,
    updateAssignment,
  };
};
