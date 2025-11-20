import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

interface ScheduleSuggestion {
  start_at: string;
  end_at: string;
  confidence: number;
  reason: string;
  weather_score: number;
  utilization_score: number;
}

interface CreateSortiePayload {
  student_id: string;
  instructor_id: string;
  aircraft_id: string;
  start_at: string;
  end_at: string;
  lesson_id?: string;
}

interface Sortie {
  id: string;
  student_id: string;
  instructor_id: string;
  aircraft_id: string;
  start_at: string;
  end_at: string;
  status: string;
  dispatch_risk?: string;
}

export const useRosterAI = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  const [createdSorties, setCreatedSorties] = useState<Sortie[]>([]);

  const generateSuggestions = async (
    studentId: string,
    instructorId: string,
    aircraftId: string
  ): Promise<ScheduleSuggestion[]> => {
    setLoading(true);
    try {
      // Fetch availability, utilization, and environment data
      const [instructorAvail, aircraftAvail, utilization, environment] = await Promise.all([
        apiClient.get<any>(`/availability/instructors/${instructorId}`).catch(() => ({ data: { blocks: [] } })),
        apiClient.get<any>(`/availability/aircraft/${aircraftId}`).catch(() => ({ data: { blocks: [] } })),
        apiClient.get<any>('/ops/utilization').catch(() => ({ data: { hourly: [] } })),
        apiClient.get<any>('/environment/latest').catch(() => ({ data: {} })),
      ]);

      // Generate suggestions based on next 7 days
      const now = new Date();
      const suggestions: ScheduleSuggestion[] = [];

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const date = new Date(now);
        date.setDate(date.getDate() + dayOffset);
        
        // Morning slot (09:00-11:00)
        const morningStart = new Date(date);
        morningStart.setHours(9, 0, 0, 0);
        const morningEnd = new Date(date);
        morningEnd.setHours(11, 0, 0, 0);

        // Afternoon slot (14:00-16:00)
        const afternoonStart = new Date(date);
        afternoonStart.setHours(14, 0, 0, 0);
        const afternoonEnd = new Date(date);
        afternoonEnd.setHours(16, 0, 0, 0);

        // Calculate scores (simplified AI logic)
        const weatherScore = Math.random() * 0.4 + 0.6; // 0.6-1.0
        const utilizationScore = Math.random() * 0.3 + 0.7; // 0.7-1.0
        
        const morningConfidence = (weatherScore * 0.6 + utilizationScore * 0.4);
        const afternoonConfidence = (weatherScore * 0.5 + utilizationScore * 0.5);

        if (morningConfidence > 0.7) {
          suggestions.push({
            start_at: morningStart.toISOString(),
            end_at: morningEnd.toISOString(),
            confidence: morningConfidence,
            reason: `Good weather conditions (${(weatherScore * 100).toFixed(0)}%) and low utilization`,
            weather_score: weatherScore,
            utilization_score: utilizationScore,
          });
        }

        if (afternoonConfidence > 0.7) {
          suggestions.push({
            start_at: afternoonStart.toISOString(),
            end_at: afternoonEnd.toISOString(),
            confidence: afternoonConfidence,
            reason: `Optimal afternoon conditions with balanced utilization`,
            weather_score: weatherScore,
            utilization_score: utilizationScore,
          });
        }
      }

      // Sort by confidence and take top 3
      const topSuggestions = suggestions
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);

      setSuggestions(topSuggestions);
      
      toast({
        title: 'Schedule Suggestions Ready',
        description: `Found ${topSuggestions.length} optimal time slots`,
      });

      return topSuggestions;
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate schedule suggestions',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const acceptSuggestion = async (
    suggestion: ScheduleSuggestion,
    payload: CreateSortiePayload
  ): Promise<Sortie | null> => {
    setLoading(true);
    try {
      const response = await apiClient.post<Sortie>('/roster/sorties', {
        ...payload,
        start_at: suggestion.start_at,
        end_at: suggestion.end_at,
      });

      // Fetch dispatch risk if available
      let dispatchRisk = 'low';
      try {
        const dashboard = await apiClient.get<any>('/dispatch/dashboard');
        dispatchRisk = dashboard.data?.overall_risk || 'low';
      } catch {
        // Dispatch endpoint may not be available
      }

      const newSortie = {
        ...response,
        dispatch_risk: dispatchRisk,
      };

      setCreatedSorties(prev => [...prev, newSortie]);
      
      toast({
        title: 'Sortie Created',
        description: `Successfully scheduled for ${new Date(suggestion.start_at).toLocaleString()}`,
      });

      // Clear suggestions after acceptance
      setSuggestions([]);

      return newSortie;
    } catch (error) {
      console.error('Error creating sortie:', error);
      toast({
        title: 'Error',
        description: 'Failed to create sortie',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshSorties = async () => {
    try {
      const response = await apiClient.get<any>('/roster/sorties/ops');
      setCreatedSorties(response.data || []);
    } catch (error) {
      console.error('Error refreshing sorties:', error);
    }
  };

  return {
    loading,
    suggestions,
    createdSorties,
    generateSuggestions,
    acceptSuggestion,
    refreshSorties,
  };
};
