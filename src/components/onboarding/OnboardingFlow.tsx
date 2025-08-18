import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RoleSelection } from './RoleSelection';
import { RegionSelection } from './RegionSelection';
import { SchoolSelection } from './SchoolSelection';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export type OnboardingStep = 'role' | 'region' | 'school';

export interface OnboardingData {
  role: string;
  aviation_region: string;
  flight_school_id?: string;
  needs_approval?: boolean;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role');
  const [data, setData] = useState<OnboardingData>({
    role: '',
    aviation_region: ''
  });
  const [loading, setLoading] = useState(false);
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const steps = ['role', 'region', 'school'] as const;
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    } else {
      handleComplete();
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Calculate trial expiry for non-admin roles
      const trialExpiry = data.role !== 'admin' && data.needs_approval 
        ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Update user profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .update({
          role: data.role,
          aviation_region: data.aviation_region,
          flight_school_id: data.flight_school_id,
          trial_expires_at: trialExpiry,
          approval_status: data.needs_approval ? 'pending' : 'approved',
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (error) throw error;

      // If joining a school, create join request
      if (data.flight_school_id) {
        await supabase
          .from('school_join_requests')
          .insert({
            user_id: user.id,
            flight_school_id: data.flight_school_id,
            org_id: user.user_metadata?.org_id || ''
          });
      }

      // Refresh profile to get updated data
      await refreshProfile();

      toast({
        title: "Welcome to AIRMAN Academy+!",
        description: data.needs_approval 
          ? "Your account is pending approval. You'll have 2 weeks of trial access."
          : "Your account has been set up successfully!",
        variant: "default"
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: "Setup Error",
        description: error.message || "Failed to complete onboarding",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to AIRMAN Academy+</CardTitle>
          <CardDescription>Let's set up your account in just a few steps</CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 'role' && (
            <RoleSelection
              value={data.role}
              onChange={(role) => updateData({ role })}
              onNext={goToNextStep}
            />
          )}

          {currentStep === 'region' && (
            <RegionSelection
              value={data.aviation_region}
              onChange={(aviation_region) => updateData({ aviation_region })}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
            />
          )}

          {currentStep === 'school' && (
            <SchoolSelection
              aviationRegion={data.aviation_region}
              value={data.flight_school_id}
              onChange={(flight_school_id, needs_approval) => 
                updateData({ flight_school_id, needs_approval })
              }
              onNext={handleComplete}
              onBack={goToPreviousStep}
              loading={loading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}