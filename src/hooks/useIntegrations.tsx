import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Integration {
  id: string;
  org_id: string;
  integration_type: string;
  integration_name: string;
  status: 'active' | 'inactive' | 'error';
  settings?: any;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export const useIntegrations = (orgId?: string) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    if (!orgId) return;
    
    try {
      setLoading(true);
      // TODO: Uncomment when org_integrations table is created
      // const { data, error } = await supabase
      //   .from('org_integrations')
      //   .select('*')
      //   .eq('org_id', orgId)
      //   .order('created_at', { ascending: false });
      // if (error) throw error;
      // setIntegrations(data || []);
      
      // For now, return empty array
      setIntegrations([]);
    } catch (error: any) {
      toast({
        title: "Error loading integrations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const connectIntegration = async (type: string) => {
    try {
      // For now, simulate OAuth flow - will be replaced with actual edge function
      toast({
        title: "Starting OAuth flow",
        description: `Connecting to ${type}...`,
      });

      // TODO: Call edge function for OAuth
      // const { data } = await supabase.functions.invoke('integration-oauth', {
      //   body: { action: 'authorize', integration_type: type, org_id: orgId }
      // });
      // window.location.href = data.authUrl;

      // For demo purposes, simulate connection
      toast({
        title: "Integration connected",
        description: `${type} has been successfully connected. (Database tables pending)`,
      });
      
      // TODO: Uncomment when org_integrations table is created
      // if (orgId) {
      //   const { error } = await supabase
      //     .from('org_integrations')
      //     .insert({
      //       org_id: orgId,
      //       integration_type: type,
      //       integration_name: type.charAt(0).toUpperCase() + type.slice(1),
      //       status: 'active',
      //       settings: {}
      //     });
      //   if (error) throw error;
      //   await fetchIntegrations();
      // }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const disconnectIntegration = async (integrationId: string) => {
    try {
      // TODO: Uncomment when org_integrations table is created
      // const { error } = await supabase
      //   .from('org_integrations')
      //   .update({ status: 'inactive' })
      //   .eq('id', integrationId);
      // if (error) throw error;

      toast({
        title: "Integration disconnected",
        description: "The integration has been disabled.",
      });

      await fetchIntegrations();
    } catch (error: any) {
      toast({
        title: "Error disconnecting",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateIntegrationSettings = async (integrationId: string, settings: any) => {
    try {
      // TODO: Uncomment when org_integrations table is created
      // const { error } = await supabase
      //   .from('org_integrations')
      //   .update({ settings, updated_at: new Date().toISOString() })
      //   .eq('id', integrationId);
      // if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Integration settings have been saved.",
      });

      await fetchIntegrations();
    } catch (error: any) {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [orgId]);

  return {
    integrations,
    loading,
    connectIntegration,
    disconnectIntegration,
    updateIntegrationSettings,
    refreshIntegrations: fetchIntegrations,
  };
};
