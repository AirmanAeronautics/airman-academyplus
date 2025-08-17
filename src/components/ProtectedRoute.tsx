import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import PendingApproval from '@/pages/PendingApproval';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading your account...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has a profile and organization access
  if (profile) {
    // If user has no org_id, show pending approval
    if (!profile.org_id) {
      return <PendingApproval />;
    }
    
    // If user has org access, show the protected content
    if (profile.org_id) {
      return <>{children}</>;
    }
  }

  // Fallback to pending approval for any other case
  return <PendingApproval />;
}