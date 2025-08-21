import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: string;
  aviation_region: string;
  flight_school_id?: string;
  flight_school_name?: string;
  org_id: string;
  onboarding_completed: boolean;
  approval_status: 'approved' | 'pending';
  trial_expires_at?: string;
}

interface DemoContextType {
  isDemoMode: boolean;
  demoUser: DemoUser | null;
  startDemo: (email: string) => void;
  exitDemo: () => void;
  updateDemoUser: (updates: Partial<DemoUser>) => void;
  completeDemoOnboarding: (data: any) => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

interface DemoProviderProps {
  children: ReactNode;
}

export function DemoProvider({ children }: DemoProviderProps) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);

  // Load demo state from localStorage on mount
  useEffect(() => {
    const savedDemo = localStorage.getItem('airman-demo-user');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setDemoUser(parsed);
        setIsDemoMode(true);
      } catch (error) {
        console.error('Failed to parse demo user data:', error);
        localStorage.removeItem('airman-demo-user');
      }
    }
  }, []);

  // Save demo state to localStorage when it changes
  useEffect(() => {
    if (demoUser && isDemoMode) {
      localStorage.setItem('airman-demo-user', JSON.stringify(demoUser));
    } else {
      localStorage.removeItem('airman-demo-user');
    }
  }, [demoUser, isDemoMode]);

  const startDemo = (email: string) => {
    const newDemoUser: DemoUser = {
      id: `demo-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: 'admin',
      aviation_region: 'North America',
      org_id: '550e8400-e29b-41d4-a716-446655440000', // Mock UUID for demo
      onboarding_completed: true,
      approval_status: 'approved'
    };
    
    setDemoUser(newDemoUser);
    setIsDemoMode(true);
  };

  const exitDemo = () => {
    setDemoUser(null);
    setIsDemoMode(false);
    localStorage.removeItem('airman-demo-user');
    localStorage.removeItem('airman-demo-mode');
  };

  const updateDemoUser = (updates: Partial<DemoUser>) => {
    if (demoUser) {
      setDemoUser({ ...demoUser, ...updates });
    }
  };

  const completeDemoOnboarding = (data: any) => {
    if (demoUser) {
      const updatedUser = {
        ...demoUser,
        role: data.role,
        aviation_region: data.aviation_region,
        flight_school_id: data.flight_school_id,
        flight_school_name: data.flight_school_name,
        onboarding_completed: true
      };
      setDemoUser(updatedUser);
    }
  };

  const resetDemo = () => {
    if (demoUser) {
      const resetUser = {
        ...demoUser,
        role: '',
        aviation_region: '',
        flight_school_id: undefined,
        flight_school_name: undefined,
        onboarding_completed: false
      };
      setDemoUser(resetUser);
    }
  };

  const value = {
    isDemoMode,
    demoUser,
    startDemo,
    exitDemo,
    updateDemoUser,
    completeDemoOnboarding,
    resetDemo
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
}