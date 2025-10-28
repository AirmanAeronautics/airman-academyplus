import { useState } from 'react';
import { IntegrationCard } from './IntegrationCard';
import { IntegrationSettings } from './IntegrationSettings';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useAuth } from '@/hooks/useAuth';
import { Video, DollarSign, Cloud, Plug } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const INTEGRATION_CONFIGS = [
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Host video classes and save recordings',
    category: 'video' as const,
    logo: <Video className="h-6 w-6 text-primary" />,
  },
  {
    id: 'google_meet',
    name: 'Google Meet',
    description: 'Schedule meetings via Google Calendar',
    category: 'video' as const,
    logo: <Video className="h-6 w-6 text-primary" />,
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Enterprise video conferencing',
    category: 'video' as const,
    logo: <Video className="h-6 w-6 text-primary" />,
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Automated invoice and payment sync',
    category: 'erp' as const,
    logo: <DollarSign className="h-6 w-6 text-primary" />,
  },
  {
    id: 'xero',
    name: 'Xero',
    description: 'Cloud accounting integration',
    category: 'erp' as const,
    logo: <DollarSign className="h-6 w-6 text-primary" />,
  },
  {
    id: 'sage',
    name: 'Sage 50',
    description: 'Desktop accounting software',
    category: 'erp' as const,
    logo: <DollarSign className="h-6 w-6 text-primary" />,
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Store recordings and documents',
    category: 'storage' as const,
    logo: <Cloud className="h-6 w-6 text-primary" />,
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'File backup and sharing',
    category: 'storage' as const,
    logo: <Cloud className="h-6 w-6 text-primary" />,
  },
];

export function IntegrationsHub() {
  const { profile } = useAuth();
  const { integrations, loading, connectIntegration, disconnectIntegration, updateIntegrationSettings } = 
    useIntegrations(profile?.org_id);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);

  const getIntegrationStatus = (configId: string): 'connected' | 'disconnected' | 'error' => {
    const integration = integrations.find(i => i.integration_type === configId);
    if (!integration) return 'disconnected';
    return integration.status === 'active' ? 'connected' : 
           integration.status === 'error' ? 'error' : 'disconnected';
  };

  const handleConfigure = (configId: string) => {
    const integration = integrations.find(i => i.integration_type === configId);
    const config = INTEGRATION_CONFIGS.find(c => c.id === configId);
    
    if (integration && config) {
      setSelectedIntegration({
        ...integration,
        name: config.name,
        type: configId
      });
      setSettingsOpen(true);
    }
  };

  const handleSaveSettings = async (settings: any) => {
    if (selectedIntegration?.id) {
      await updateIntegrationSettings(selectedIntegration.id, settings);
    }
  };

  const videoConferencing = INTEGRATION_CONFIGS.filter(c => c.category === 'video');
  const erpSystems = INTEGRATION_CONFIGS.filter(c => c.category === 'erp');
  const cloudStorage = INTEGRATION_CONFIGS.filter(c => c.category === 'storage');

  return (
    <div className="space-y-8">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Database tables for integrations need to be created. Please approve the pending migration to enable full functionality.
        </AlertDescription>
      </Alert>

      {/* Video Conferencing */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Video Conferencing</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videoConferencing.map((config) => (
            <IntegrationCard
              key={config.id}
              name={config.name}
              description={config.description}
              logo={config.logo}
              category={config.category}
              status={getIntegrationStatus(config.id)}
              onConnect={() => connectIntegration(config.id)}
              onDisconnect={() => {
                const integration = integrations.find(i => i.integration_type === config.id);
                if (integration) disconnectIntegration(integration.id);
              }}
              onConfigure={() => handleConfigure(config.id)}
              isLoading={loading}
            />
          ))}
        </div>
      </div>

      {/* ERP & Finance */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Finance & ERP</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {erpSystems.map((config) => (
            <IntegrationCard
              key={config.id}
              name={config.name}
              description={config.description}
              logo={config.logo}
              category={config.category}
              status={getIntegrationStatus(config.id)}
              onConnect={() => connectIntegration(config.id)}
              onDisconnect={() => {
                const integration = integrations.find(i => i.integration_type === config.id);
                if (integration) disconnectIntegration(integration.id);
              }}
              onConfigure={() => handleConfigure(config.id)}
              isLoading={loading}
            />
          ))}
        </div>
      </div>

      {/* Cloud Storage */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Cloud Storage</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cloudStorage.map((config) => (
            <IntegrationCard
              key={config.id}
              name={config.name}
              description={config.description}
              logo={config.logo}
              category={config.category}
              status={getIntegrationStatus(config.id)}
              onConnect={() => connectIntegration(config.id)}
              onDisconnect={() => {
                const integration = integrations.find(i => i.integration_type === config.id);
                if (integration) disconnectIntegration(integration.id);
              }}
              onConfigure={() => handleConfigure(config.id)}
              isLoading={loading}
            />
          ))}
        </div>
      </div>

      {selectedIntegration && (
        <IntegrationSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          integration={selectedIntegration}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}
