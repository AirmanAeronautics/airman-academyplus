import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, User } from 'lucide-react';
import { useState } from 'react';

export default function DevUserInfo() {
  const [isVisible, setIsVisible] = useState(false);
  const { user, profile } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          Dev Info
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-background/95 backdrop-blur-sm border-yellow-500/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center">
              <User className="h-4 w-4 mr-2" />
              Dev User Info
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="space-y-1">
            <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
            <p><strong>User ID:</strong> {user?.id ? `${user.id.slice(0, 8)}...` : 'N/A'}</p>
          </div>
          
          {profile && (
            <div className="space-y-1 pt-2 border-t">
              <div className="flex items-center gap-2">
                <strong>Role:</strong>
                <Badge variant={profile.role === 'super_admin' ? 'default' : 'secondary'}>
                  {profile.role}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <strong>Status:</strong>
                <Badge variant={profile.status === 'active' ? 'default' : 'destructive'}>
                  {profile.status}
                </Badge>
              </div>
              <p><strong>Org ID:</strong> {profile.org_id ? `${profile.org_id.slice(0, 8)}...` : 'None'}</p>
              {profile.organization && (
                <div className="pt-1">
                  <p><strong>Organization:</strong> {profile.organization.name}</p>
                  <p><strong>Domain:</strong> {profile.organization.domain}</p>
                </div>
              )}
            </div>
          )}
          
          {!profile && user && (
            <div className="pt-2 border-t">
              <Badge variant="destructive">No Profile Found</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}