import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface IntegrationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integration: {
    name: string;
    type: string;
    settings?: any;
  };
  onSave: (settings: any) => void;
}

export function IntegrationSettings({
  open,
  onOpenChange,
  integration,
  onSave
}: IntegrationSettingsProps) {
  const [settings, setSettings] = useState(integration.settings || {});

  const handleSave = () => {
    onSave(settings);
    onOpenChange(false);
  };

  const renderZoomSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="auto-record">Auto-record meetings</Label>
        <Switch
          id="auto-record"
          checked={settings.autoRecord ?? true}
          onCheckedChange={(checked) => 
            setSettings({ ...settings, autoRecord: checked })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="cloud-recording">Save to cloud</Label>
        <Switch
          id="cloud-recording"
          checked={settings.cloudRecording ?? true}
          onCheckedChange={(checked) => 
            setSettings({ ...settings, cloudRecording: checked })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="default-host">Default Host Email</Label>
        <Input
          id="default-host"
          type="email"
          value={settings.defaultHost || ''}
          onChange={(e) => 
            setSettings({ ...settings, defaultHost: e.target.value })
          }
          placeholder="host@example.com"
        />
      </div>
    </div>
  );

  const renderERPSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="auto-sync">Auto-sync invoices</Label>
        <Switch
          id="auto-sync"
          checked={settings.autoSync ?? true}
          onCheckedChange={(checked) => 
            setSettings({ ...settings, autoSync: checked })
          }
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sync-frequency">Sync Frequency (minutes)</Label>
        <Input
          id="sync-frequency"
          type="number"
          value={settings.syncFrequency || 30}
          onChange={(e) => 
            setSettings({ ...settings, syncFrequency: parseInt(e.target.value) })
          }
          min={5}
          max={1440}
        />
      </div>
    </div>
  );

  const renderStorageSettings = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="folder-path">Default Folder Path</Label>
        <Input
          id="folder-path"
          value={settings.folderPath || '/AIRMAN Academy'}
          onChange={(e) => 
            setSettings({ ...settings, folderPath: e.target.value })
          }
          placeholder="/AIRMAN Academy"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="auto-upload">Auto-upload recordings</Label>
        <Switch
          id="auto-upload"
          checked={settings.autoUpload ?? true}
          onCheckedChange={(checked) => 
            setSettings({ ...settings, autoUpload: checked })
          }
        />
      </div>
    </div>
  );

  const renderSettings = () => {
    const type = integration.type.toLowerCase();
    if (type.includes('zoom') || type.includes('meet') || type.includes('teams')) {
      return renderZoomSettings();
    }
    if (type.includes('quickbooks') || type.includes('xero') || type.includes('sage')) {
      return renderERPSettings();
    }
    if (type.includes('drive') || type.includes('dropbox')) {
      return renderStorageSettings();
    }
    return <p className="text-sm text-muted-foreground">No settings available for this integration.</p>;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{integration.name} Settings</DialogTitle>
          <DialogDescription>
            Configure your {integration.name} integration preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {renderSettings()}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
