import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Check, AlertCircle } from "lucide-react";

interface IntegrationCardProps {
  name: string;
  description: string;
  logo: React.ReactNode;
  category: 'video' | 'erp' | 'storage';
  status: 'connected' | 'disconnected' | 'error';
  onConnect: () => void;
  onDisconnect: () => void;
  onConfigure?: () => void;
  isLoading?: boolean;
}

export function IntegrationCard({
  name,
  description,
  logo,
  status,
  onConnect,
  onDisconnect,
  onConfigure,
  isLoading = false
}: IntegrationCardProps) {
  const isConnected = status === 'connected';
  const hasError = status === 'error';

  return (
    <Card className="aviation-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-card">
              {logo}
            </div>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
          <Badge 
            variant={isConnected ? "default" : hasError ? "destructive" : "secondary"}
            className="ml-2"
          >
            {isConnected && <Check className="mr-1 h-3 w-3" />}
            {hasError && <AlertCircle className="mr-1 h-3 w-3" />}
            {isConnected ? "Connected" : hasError ? "Error" : "Not Connected"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              onClick={onConnect} 
              disabled={isLoading}
              className="flex-1"
            >
              Connect
            </Button>
          ) : (
            <>
              {onConfigure && (
                <Button 
                  onClick={onConfigure} 
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              )}
              <Button 
                onClick={onDisconnect} 
                variant="destructive"
                size="sm"
                disabled={isLoading}
              >
                Disconnect
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
