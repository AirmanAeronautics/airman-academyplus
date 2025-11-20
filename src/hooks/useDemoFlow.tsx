import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/apiClient';

interface DemoStep {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
}

export const useDemoFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<DemoStep[]>([]);

  const updateStep = (name: string, status: DemoStep['status'], message?: string) => {
    setSteps(prev => {
      const existing = prev.find(s => s.name === name);
      if (existing) {
        return prev.map(s => s.name === name ? { ...s, status, message } : s);
      }
      return [...prev, { name, status, message }];
    });
  };

  const runTrainingDemo = async () => {
    setLoading(true);
    setSteps([]);

    try {
      updateStep('Creating training program', 'running');
      const program = await apiClient.post<any>('/training/programs', {
        code: `DEMO-${Date.now()}`,
        name: 'Demo CPL Program',
        regulatoryFrameworkCode: 'DGCA',
        category: 'FLIGHT',
      });
      updateStep('Creating training program', 'success', `Created: ${program.name}`);

      updateStep('Creating lesson', 'running');
      const lesson = await apiClient.post<any>(`/training/programs/${program.id}/lessons`, {
        code: `L-DEMO-${Date.now()}`,
        name: 'Demo Circuit Training',
        lessonType: 'FLIGHT',
        sequenceOrder: 1,
        durationMinutes: 60,
        requirements: { weather: 'VFR' },
      });
      updateStep('Creating lesson', 'success', `Created: ${lesson.name}`);

      updateStep('Creating aircraft', 'running');
      const aircraft = await apiClient.post<any>('/fleet/aircraft', {
        registration: `VT-DEMO${Date.now().toString().slice(-4)}`,
        type: 'C172',
        baseAirportIcao: 'VOBL',
        status: 'ACTIVE',
        capabilities: { ifr: true },
      });
      updateStep('Creating aircraft', 'success', `Created: ${aircraft.registration}`);

      toast({
        title: 'Training Demo Complete',
        description: 'Demo program, lesson, and aircraft created successfully',
      });

      setTimeout(() => navigate('/calendar'), 1500);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to run training demo';
      updateStep('Demo failed', 'error', errorMsg);
      toast({
        title: 'Demo Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runOpsDemo = async () => {
    setLoading(true);
    setSteps([]);

    try {
      updateStep('Ingesting environment data', 'running');
      await apiClient.post('/environment/ingest', {
        airportIcao: 'VOBL',
        capturedAt: new Date().toISOString(),
        metarJson: {
          visibility: 8000,
          ceiling: 4500,
          crosswindComponent: 5,
        },
        tafJson: { forecast: 'VFR' },
        notamsJson: { items: [{ text: 'RWY 09/27 OPEN' }] },
        trafficJson: { densityIndex: 0.3 },
      });
      updateStep('Ingesting environment data', 'success', 'Weather & NOTAMs ingested');

      updateStep('Fetching ops summary', 'running');
      const today = new Date().toISOString().slice(0, 10);
      const opsSummary = await apiClient.get<any>(`/ops/summary?date=${today}`);
      updateStep('Fetching ops summary', 'success', `Total sorties: ${opsSummary?.totalSorties ?? 0}`);

      toast({
        title: 'Operations Demo Complete',
        description: 'Environment data ingested and ops summary fetched',
      });

      setTimeout(() => navigate('/'), 1500);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to run ops demo';
      updateStep('Demo failed', 'error', errorMsg);
      toast({
        title: 'Demo Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const runSupportFinanceDemo = async () => {
    setLoading(true);
    setSteps([]);

    try {
      updateStep('Creating support ticket', 'running');
      const ticket = await apiClient.post<any>('/support/tickets', {
        category: 'SCHEDULING',
        priority: 'MEDIUM',
        subject: 'Demo Support Ticket',
        description: 'This is a demonstration support ticket created by the demo flow.',
      });
      updateStep('Creating support ticket', 'success', `Ticket #${ticket.id.slice(0, 8)} created`);

      updateStep('Creating invoice', 'running');
      // Note: This assumes there's a demo student/invoice API available
      // Adjust based on actual backend endpoints
      try {
        const invoice = await apiClient.post<any>('/finance/invoices', {
          amount: 5000,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Demo training invoice',
          status: 'PENDING',
        });
        updateStep('Creating invoice', 'success', `Invoice created for ₹${invoice.amount}`);
      } catch (err) {
        updateStep('Creating invoice', 'error', 'Invoice endpoint not available');
      }

      toast({
        title: 'Support & Finance Demo Complete',
        description: 'Support ticket created successfully',
      });

      setTimeout(() => navigate('/support'), 1500);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to run support/finance demo';
      updateStep('Demo failed', 'error', errorMsg);
      toast({
        title: 'Demo Failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    steps,
    runTrainingDemo,
    runOpsDemo,
    runSupportFinanceDemo,
  };
};
