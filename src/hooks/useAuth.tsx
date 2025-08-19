
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ensureProfileAndOrg, handleOnboardingResult } from '@/lib/auth/onboarding';
import { useDemo } from '@/contexts/DemoContext';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any;
  authLoading: boolean;
  profileLoading: boolean;
  signOut: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  isDemoMode?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // ALL HOOKS MUST BE CALLED FIRST - BEFORE ANY CONDITIONAL LOGIC
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const { isDemoMode, demoUser } = useDemo();

  // Initialize auth state and set up listener - ALWAYS run this effect
  useEffect(() => {
    // Skip auth setup in demo mode
    if (isDemoMode) {
      setAuthLoading(false);
      setProfileLoading(false);
      return;
    }

    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Handle onboarding for new sessions
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Defer onboarding to avoid auth state deadlock
          setTimeout(async () => {
            if (!mounted) return;
            
            try {
              setProfileLoading(true);
              const result = await ensureProfileAndOrg(session);
              
              if (result.success && result.profile) {
                setProfile(result.profile);
                handleOnboardingResult(result);
              }
            } catch (error) {
              console.error('Onboarding failed:', error);
              handleOnboardingResult({ 
                success: false, 
                error: error instanceof Error ? error.message : 'Onboarding failed' 
              });
            } finally {
              if (mounted) {
                setProfileLoading(false);
              }
            }
          }, 0);
        } else if (!session) {
          // Clear profile when logged out
          setProfile(null);
          setProfileLoading(false);
        }
        
        setAuthLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
      
      // If we have a session, trigger onboarding
      if (session?.user) {
        setTimeout(async () => {
          if (!mounted) return;
          
          try {
            setProfileLoading(true);
            const result = await ensureProfileAndOrg(session);
            
            if (result.success && result.profile) {
              setProfile(result.profile);
            }
          } catch (error) {
            console.error('Initial onboarding failed:', error);
          } finally {
            if (mounted) {
              setProfileLoading(false);
            }
          }
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isDemoMode]); // Add isDemoMode as dependency

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    setProfile(null);
    setProfileLoading(false);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    
    try {
      setProfileLoading(true);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, organizations(name, domain)')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Profile refresh error:', error);
        return;
      }

      setProfile(profile);
    } catch (error) {
      console.error('Profile refresh failed:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Determine the context value based on demo mode
  const value = isDemoMode && demoUser ? {
    user: { id: demoUser.id, email: demoUser.email } as User,
    session: { user: { id: demoUser.id, email: demoUser.email } } as Session,
    profile: demoUser,
    authLoading: false,
    profileLoading: false,
    signOut: async () => {},
    signInWithPassword: async () => ({ error: null }),
    refreshProfile: async () => {},
    isDemoMode: true
  } : {
    user,
    session,
    profile,
    authLoading,
    profileLoading,
    signOut,
    signInWithPassword,
    refreshProfile,
    isDemoMode: false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
