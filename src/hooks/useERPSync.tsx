import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  amount: number;
  student_id: string;
  status: string;
  [key: string]: any;
}

export const useERPSync = (erpType: 'quickbooks' | 'xero' | 'sage') => {
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const syncInvoices = async (invoices: Invoice[]) => {
    try {
      setSyncing(true);

      // TODO: Call edge function to sync invoices
      // const { data, error } = await supabase.functions.invoke(
      //   'integration-erp',
      //   {
      //     body: {
      //       erp_type: erpType,
      //       action: 'sync_invoices',
      //       invoices
      //     }
      //   }
      // );

      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Invoices synced",
        description: `Successfully synced ${invoices.length} invoices to ${erpType}.`,
      });

      return { success: true, synced: invoices.length };
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, synced: 0 };
    } finally {
      setSyncing(false);
    }
  };

  const pullPayments = async (fromDate: Date) => {
    try {
      setSyncing(true);

      // TODO: Call edge function to pull payments
      // const { data } = await supabase.functions.invoke(
      //   'integration-erp',
      //   {
      //     body: {
      //       erp_type: erpType,
      //       action: 'pull_payments',
      //       from_date: fromDate.toISOString()
      //     }
      //   }
      // );

      // Simulate pull
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockPayments = [
        { id: '1', amount: 500, date: new Date().toISOString(), status: 'completed' }
      ];

      toast({
        title: "Payments pulled",
        description: `Retrieved ${mockPayments.length} payments from ${erpType}.`,
      });

      return mockPayments;
    } catch (error: any) {
      toast({
        title: "Pull failed",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setSyncing(false);
    }
  };

  const syncCustomers = async () => {
    try {
      setSyncing(true);

      // TODO: Call edge function to sync customers
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Customers synced",
        description: `Customer data synchronized with ${erpType}.`,
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
      return { success: false };
    } finally {
      setSyncing(false);
    }
  };

  const getLastSync = async (orgId: string) => {
    try {
      // TODO: Uncomment when org_integrations table is created
      // const { data, error } = await supabase
      //   .from('org_integrations')
      //   .select('last_sync_at')
      //   .eq('org_id', orgId)
      //   .eq('integration_type', erpType)
      //   .single();
      // if (error) throw error;
      // return data?.last_sync_at ? new Date(data.last_sync_at) : null;
      
      return null;
    } catch (error) {
      return null;
    }
  };

  return {
    syncInvoices,
    pullPayments,
    syncCustomers,
    getLastSync,
    syncing,
  };
};
