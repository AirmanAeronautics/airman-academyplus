import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { DemoOnboardingFlow } from '@/components/onboarding/DemoOnboardingFlow';
import { useDemo } from '@/contexts/DemoContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, session, authLoading, profile, profileLoading, isDemoMode } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { demoUser } = useDemo();

  // Show loading for authentication and initial profile load
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              {authLoading ? 'Authenticating...' : 'Loading profile...'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to auth if not authenticated (unless in demo mode)
  if ((!user || !session) && !isDemoMode) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user needs onboarding
  const currentProfile = isDemoMode ? demoUser : profile;
  if (currentProfile && !currentProfile.onboarding_completed && !showOnboarding) {
    setShowOnboarding(true);
  }

  // Show onboarding flow if needed
  if (showOnboarding || (currentProfile && !currentProfile.onboarding_completed)) {
    if (isDemoMode) {
      return (
        <DemoOnboardingFlow 
          onComplete={() => setShowOnboarding(false)} 
        />
      );
    } else {
      return (
        <OnboardingFlow 
          onComplete={() => setShowOnboarding(false)} 
        />
      );
    }
  }

  // Check if user has expired trial access
  if (profile?.trial_expires_at && new Date() > new Date(profile.trial_expires_at)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center space-y-4 p-8">
            <h2 className="text-2xl font-bold">Trial Access Expired</h2>
            <p className="text-muted-foreground">
              Your trial access has expired. Please contact your flight school administrator 
              for approval to continue using the platform.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}