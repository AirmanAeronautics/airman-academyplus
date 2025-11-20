import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';

export interface OpsSummaryData {
  date: string;
  totalSorties: number;
  completed: number;
  cancelled: number;
  noShow: number;
  scheduled: number;
  dispatched: number;
  inFlight: number;
  instructorUtilization: number;
  aircraftUtilization: number;
  overallUtilization: number;
}

export interface OpsUtilizationData {
  airportIcao: string;
  date: string;
  totalSorties: number;
  completed: number;
  utilization: number;
}

export function useOpsOverview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getDailySummary = useCallback(async (date: string): Promise<OpsSummaryData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Format date as YYYY-MM-DD
      const dateStr = date.includes('T') ? date.split('T')[0] : date;
      const url = `/ops/summary?date=${dateStr}`;
      const response = await apiClient.get<OpsSummaryData>(url);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch ops summary';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getUtilization = useCallback(async (
    airportIcao: string,
    date: string
  ): Promise<OpsUtilizationData | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const dateStr = date.includes('T') ? date.split('T')[0] : date;
      const url = `/ops/utilization?airportIcao=${airportIcao}&date=${dateStr}`;
      const response = await apiClient.get<OpsUtilizationData>(url);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch utilization data';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    getDailySummary,
    getUtilization,
  };
}

