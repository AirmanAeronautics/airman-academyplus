import { useAuthBackend } from '@/hooks/useAuthBackend';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
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
  // Call all hooks at the top - never after conditional returns
  const { user: backendUser, accessToken, loading: backendLoading } = useAuthBackend();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { isDemoMode, demoUser } = useDemo();
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Use new auth context if available, fallback to old one
  const currentUser = user || backendUser;
  const loading = isLoading || backendLoading;
  const authenticated = isAuthenticated || (!!currentUser && !!accessToken);

  // Show loading for authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">
              Authenticating...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to auth if not authenticated (unless in demo mode)
  if (!authenticated && !isDemoMode) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user needs onboarding
  // For new auth system, check isOnboardingComplete
  // For old system, check onboarding_completed
  const needsOnboarding = 
    (user && !user.isOnboardingComplete) ||
    (isDemoMode && demoUser && !demoUser.onboarding_completed) ||
    (!user && backendUser && !(backendUser as any).onboarding_completed);

  const isOnboardingRoute = location.pathname.startsWith('/onboarding');

  // Redirect to onboarding if needed (unless already on onboarding route)
  if (needsOnboarding && !isOnboardingRoute && !isDemoMode) {
    return <Navigate to="/onboarding/start" replace />;
  }

  // For demo mode, show demo onboarding if needed
  const currentProfile = isDemoMode ? demoUser : null;
  if (currentProfile && !currentProfile.onboarding_completed && !showOnboarding) {
    setShowOnboarding(true);
  }

  // Show onboarding flow if needed (demo mode only for now)
  if (showOnboarding && isDemoMode && currentProfile && !currentProfile.onboarding_completed) {
    return (
      <DemoOnboardingFlow 
        onComplete={() => setShowOnboarding(false)} 
      />
    );
  }

  // If authenticated and onboarding complete, but on onboarding route, redirect to dashboard
  if (authenticated && !needsOnboarding && isOnboardingRoute) {
    const dashboardRoute = 
      user?.primaryRole === 'ADMIN' ? '/admin/dashboard' :
      user?.primaryRole === 'INSTRUCTOR' ? '/instructor/dashboard' :
      user?.primaryRole === 'STUDENT' ? '/student/dashboard' :
      '/';
    return <Navigate to={dashboardRoute} replace />;
  }

  return <>{children}</>;
}