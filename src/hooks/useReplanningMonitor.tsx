import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AlternativeSolution {
  id: string;
  original_assignment_id: string;
  org_id: string;
  trigger_type: 'weather' | 'notam' | 'availability' | 'aircraft';
  trigger_details: any;
  alternative_assignment: any;
  score_breakdown: any;
  generated_at: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface TriggerRequest {
  trigger_type: 'weather' | 'notam' | 'availability' | 'aircraft';
  trigger_details: any;
  affected_entity_id?: string;
  timeframe?: { start: string; end: string };
}

export const useReplanningMonitor = (assignmentId?: string) => {
  const { toast } = useToast();
  const [alternatives, setAlternatives] = useState<AlternativeSolution[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlternatives = async () => {
    if (!assignmentId) return;

    try {
      const { data, error } = await supabase
        .from('roster_alternative_solutions')
        .select('*')
        .eq('original_assignment_id', assignmentId)
        .eq('status', 'pending')
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setAlternatives((data || []) as AlternativeSolution[]);
    } catch (error) {
      console.error('Error fetching alternatives:', error);
    }
  };

  const acceptAlternative = async (alternativeId: string) => {
    setLoading(true);
    try {
      // Update alternative status
      const { error: updateError } = await supabase
        .from('roster_alternative_solutions')
        .update({ status: 'accepted' })
        .eq('id', alternativeId);

      if (updateError) throw updateError;

      // Get the alternative to apply it
      const { data: alternative } = await supabase
        .from('roster_alternative_solutions')
        .select('*')
        .eq('id', alternativeId)
        .single();

      if (alternative) {
        // Update the original assignment with new details
        const altAssignment = alternative.alternative_assignment as any;
        const { error: assignmentError } = await supabase
          .from('roster_assignment')
          .update({
            ...altAssignment,
            status: 'confirmed',
          })
          .eq('id', alternative.original_assignment_id);

        if (assignmentError) throw assignmentError;

        // Reject other alternatives for this assignment
        await supabase
          .from('roster_alternative_solutions')
          .update({ status: 'rejected' })
          .eq('original_assignment_id', alternative.original_assignment_id)
          .neq('id', alternativeId);
      }

      toast({
        title: 'Alternative Accepted',
        description: 'The alternative schedule has been applied',
      });

      await fetchAlternatives();
    } catch (error) {
      console.error('Error accepting alternative:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept alternative',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const rejectAlternative = async (alternativeId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('roster_alternative_solutions')
        .update({ status: 'rejected' })
        .eq('id', alternativeId);

      if (error) throw error;

      toast({
        title: 'Alternative Rejected',
        description: 'The alternative has been dismissed',
      });

      await fetchAlternatives();
    } catch (error) {
      console.error('Error rejecting alternative:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject alternative',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerReplanning = async (request: TriggerRequest) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('roster-replan-trigger', {
        body: request,
      });

      if (error) throw error;

      toast({
        title: 'Replanning Triggered',
        description: `${data.alternatives_generated} alternative(s) generated for ${data.affected_assignments} assignment(s)`,
      });

      return data;
    } catch (error) {
      console.error('Error triggering replanning:', error);
      toast({
        title: 'Error',
        description: 'Failed to trigger replanning',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const subscribeToChanges = () => {
    if (!assignmentId) return;

    const channel = supabase
      .channel('alternative-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'roster_alternative_solutions',
          filter: `original_assignment_id=eq.${assignmentId}`,
        },
        (payload) => {
          console.log('New alternative:', payload);
          fetchAlternatives();
          
          toast({
            title: 'New Alternative Available',
            description: 'A new scheduling alternative has been generated',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  useEffect(() => {
    fetchAlternatives();
  }, [assignmentId]);

  return {
    alternatives,
    loading,
    acceptAlternative,
    rejectAlternative,
    triggerReplanning,
    subscribeToChanges,
    refreshAlternatives: fetchAlternatives,
  };
};
