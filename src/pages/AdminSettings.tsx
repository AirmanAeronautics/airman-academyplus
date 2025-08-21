import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useDemo } from '@/contexts/DemoContext';

export default function AdminSettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { isDemoMode } = useDemo();
  const [settings, setSettings] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, [profile]);

  const fetchSettings = async () => {
    if (!profile?.org_id) return;

    try {
      // Provide mock data for demo mode
      if (isDemoMode) {
        const mockOrganization = {
          id: profile.org_id,
          name: 'AIRMAN Academy (Demo)',
          domain: 'airmanacademy.com',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_default: true
        };

        const mockSettings = {
          id: '550e8400-e29b-41d4-a716-446655440001',
          org_id: profile.org_id,
          auto_approve_domain: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setOrganization(mockOrganization);
        setSettings(mockSettings);
        return;
      }

      // Fetch organization details
      const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profile.org_id)
        .single();

      setOrganization(orgData);

      // Fetch or create org settings
      let { data: settingsData } = await supabase
        .from('org_settings')
        .select('*')
        .eq('org_id', profile.org_id)
        .single();

      if (!settingsData) {
        // Create default settings
        const { data: newSettings } = await supabase
          .from('org_settings')
          .insert({ org_id: profile.org_id, auto_approve_domain: false })
          .select()
          .single();
        
        settingsData = newSettings;
      }

      setSettings(settingsData);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAutoApprove = async (enabled: boolean) => {
    if (!settings) return;

    try {
      // Handle demo mode updates locally
      if (isDemoMode) {
        setSettings({ ...settings, auto_approve_domain: enabled });
        toast({
          title: "Demo Settings Updated",
          description: `Domain auto-approval has been ${enabled ? 'enabled' : 'disabled'} in demo mode.`,
        });
        return;
      }

      const { error } = await supabase
        .from('org_settings')
        .update({ auto_approve_domain: enabled })
        .eq('id', settings.id);

      if (error) throw error;

      setSettings({ ...settings, auto_approve_domain: enabled });
      
      toast({
        title: "Settings updated",
        description: `Domain auto-approval has been ${enabled ? 'enabled' : 'disabled'}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization's access control settings</p>
      </div>

      {organization && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Information about your organization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Organization Name</Label>
                <Input value={organization.name} disabled />
              </div>
              <div>
                <Label>Email Domain</Label>
                <div className="flex items-center space-x-2">
                  <Input value={organization.domain} disabled />
                  <Badge variant="secondary">@{organization.domain}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {settings && (
        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
            <CardDescription>
              Configure how new users gain access to your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Auto-Approval for Email Domain</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically approve users with email addresses matching @{organization?.domain}
                </p>
              </div>
              <Switch
                checked={settings.auto_approve_domain}
                onCheckedChange={updateAutoApprove}
              />
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Explicitly invited users</strong> are always auto-approved regardless of this setting</li>
                <li>• <strong>Domain users (when enabled)</strong> are automatically approved upon signup</li>
                <li>• <strong>Domain users (when disabled)</strong> must wait for admin approval</li>
                <li>• <strong>Other users</strong> always require admin approval or explicit invitation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}