import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDemo } from '@/contexts/DemoContext';
import { useToast } from '@/hooks/use-toast';
import { RoleSelection } from './RoleSelection';
import { RegionSelection } from './RegionSelection';
import { DemoSchoolSelection } from './DemoSchoolSelection';

interface DemoOnboardingFlowProps {
  onComplete: () => void;
}

export type OnboardingStep = 'role' | 'region' | 'school';

export interface OnboardingData {
  role: string;
  aviation_region: string;
  flight_school_id?: string;
  flight_school_name?: string;
}

export function DemoOnboardingFlow({ onComplete }: DemoOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role');
  const [data, setData] = useState<OnboardingData>({
    role: '',
    aviation_region: ''
  });
  const [loading, setLoading] = useState(false);
  const { completeDemoOnboarding } = useDemo();
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
    setLoading(true);
    
    // Simulate API delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      completeDemoOnboarding(data);

      toast({
        title: "Welcome to AIRMAN Academy+ Demo!",
        description: `Your demo profile is set up as a ${data.role.replace('_', ' ')} in the ${data.aviation_region} region.`,
        variant: "default"
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Demo Setup Error",
        description: "Failed to complete demo onboarding",
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
          <CardTitle className="text-2xl font-bold">Welcome to AIRMAN Academy+ Demo</CardTitle>
          <CardDescription>Experience the platform by selecting your role and region</CardDescription>
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
            <DemoSchoolSelection
              aviationRegion={data.aviation_region}
              value={data.flight_school_id}
              onChange={(flight_school_id, flight_school_name) => 
                updateData({ flight_school_id, flight_school_name })
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