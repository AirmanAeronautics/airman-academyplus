import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfileCache } from './useProfileCache';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any;
  authLoading: boolean;  // Only for authentication, not profile
  profileLoading: boolean;  // Separate profile loading state
  signOut: () => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);  // Only for initial auth check
  const [profileLoading, setProfileLoading] = useState(false);  // Separate profile loading
  
  const { cachedProfile, saveToCache, clearCache } = useProfileCache(user?.id);

  const getDefaultOrg = async () => {
    try {
      const { data } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('is_default', true)
        .single();
      return data;
    } catch {
      return { id: 'default', name: 'Default Organization' }; // Fallback
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Immediately get session after successful sign-in
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        setSession(sessionData.session);
        setUser(sessionData.session.user);
        
        // Start profile loading in background (non-blocking)
        setTimeout(() => {
          refreshProfile();
        }, 0);
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    setProfileLoading(true);

    // Use cached profile immediately if available
    if (cachedProfile) {
      console.log('✅ Using cached profile');
      setProfile(cachedProfile);
      setProfileLoading(false);
      
      // Still fetch fresh data in background
      fetchFreshProfile();
      return;
    }

    // Fetch fresh profile
    await fetchFreshProfile();
  };

  const fetchFreshProfile = async () => {
    if (!user) return;

    try {
      console.log('🔄 Fetching fresh profile for user:', user.id);
      
      // Set 3 second timeout
      const timeoutId = setTimeout(() => {
        console.log('⏰ Profile fetch timeout - using fallback');
        createFallbackProfile();
      }, 3000);

      // Parallel queries for better performance
      const [profileResult, defaultOrg] = await Promise.all([
        supabase
          .from('profiles')
          .select(`*, organizations(*)`)
          .eq('id', user.id)
          .maybeSingle(),
        getDefaultOrg()
      ]);

      clearTimeout(timeoutId);
      
      const { data: profileData, error } = profileResult;
      
      if (error || !profileData) {
        console.log('📝 Creating fallback profile');
        createFallbackProfile();
        return;
      }

      // Handle missing organization data
      if (profileData.org_id && (!profileData.organizations || !Array.isArray(profileData.organizations) || profileData.organizations.length === 0)) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.org_id)
          .single();
        
        if (orgData) {
          (profileData as any).organizations = [orgData];
        }
      }

      // Ensure profile has org_id
      if (!profileData.org_id && defaultOrg) {
        profileData.org_id = defaultOrg.id;
        (profileData as any).organizations = [defaultOrg];
      }

      console.log('✅ Profile loaded successfully');
      setProfile(profileData);
      saveToCache(profileData, user.id);
      
    } catch (error) {
      console.error('💥 Profile fetch error:', error);
      createFallbackProfile();
    } finally {
      setProfileLoading(false);
    }
  };

  const createFallbackProfile = async () => {
    if (!user) return;

    const defaultOrg = await getDefaultOrg();
    const fallbackProfile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      role: 'user',
      org_id: defaultOrg.id,
      organizations: [defaultOrg],
      created_at: new Date().toISOString(),
      fallback: true // Flag to indicate this is a fallback
    };

    console.log('🚨 Using fallback profile');
    setProfile(fallbackProfile);
    setProfileLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔐 Auth state change:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Non-blocking profile fetch
          setTimeout(() => {
            if (mounted) refreshProfile();
          }, 0);
        } else {
          setProfile(null);
          clearCache();
          setProfileLoading(false);
        }
        
        // Auth loading is done
        setAuthLoading(false);
      }
    );

    // Check for existing session immediately
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Start profile loading immediately but non-blocking
          setTimeout(() => {
            if (mounted) refreshProfile();
          }, 0);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    clearCache();
    setProfile(null);
    setProfileLoading(false);
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    profile,
    authLoading,
    profileLoading,
    signOut,
    signInWithPassword,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}