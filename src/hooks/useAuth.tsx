import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useProfileCache } from './useProfileCache';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: any;
  loading: boolean;
  profileTimeout: boolean;
  signOut: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [profileTimeout, setProfileTimeout] = useState(false);
  
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
      return null;
    }
  };

  const refreshProfile = async (retryCount = 0) => {
    if (!user) {
      console.log('❌ No user found, cannot fetch profile');
      return;
    }

    // Use cached profile immediately if available
    if (cachedProfile && retryCount === 0) {
      console.log('✅ Using cached profile');
      setProfile(cachedProfile);
      setLoading(false);
      
      // Still fetch fresh data in background
      setTimeout(() => refreshProfile(1), 100);
      return;
    }

    try {
      console.log('🔄 Fetching profile for user:', user.id, 'attempt:', retryCount + 1);
      
      // Set timeout for profile loading
      const timeoutId = setTimeout(() => {
        if (loading && retryCount === 0) {
          console.log('⏰ Profile loading timeout reached');
          setProfileTimeout(true);
        }
      }, 3000);

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          organizations!inner(*)
        `)
        .eq('id', user.id)
        .maybeSingle();

      clearTimeout(timeoutId);
      
      console.log('📊 Profile query result:', { data, error });
      
      if (error) {
        console.error('❌ Error fetching profile:', error);
        
        // Fallback: try without organization join
        const { data: basicProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (basicProfile) {
          // If missing org_id, assign default organization
          if (!basicProfile.org_id) {
            const defaultOrg = await getDefaultOrg();
            if (defaultOrg) {
              basicProfile.org_id = defaultOrg.id;
              (basicProfile as any).organizations = [defaultOrg];
            }
          }
          
          console.log('✅ Using basic profile with fallback');
          setProfile(basicProfile);
          saveToCache(basicProfile, user.id);
        }
        
        setLoading(false);
        return;
      }
      
      // If no profile found and we haven't retried too many times
      if (!data && retryCount < 2) {
        console.log(`⏳ No profile found, retrying... (attempt ${retryCount + 1})`);
        setTimeout(() => {
          refreshProfile(retryCount + 1);
        }, 1000);
        return;
      }
      
      if (!data) {
        console.error('❌ Profile not found after retries');
        
        // Final fallback: create minimal profile with default org
        const defaultOrg = await getDefaultOrg();
        const fallbackProfile = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || null,
          role: 'user',
          org_id: defaultOrg?.id || null,
          organizations: defaultOrg ? [defaultOrg] : []
        };
        
        console.log('🚨 Using fallback profile');
        setProfile(fallbackProfile);
        setLoading(false);
        return;
      }
      
      // Handle case where organization data is null but org_id exists
      if (data.org_id && (!data.organizations || !Array.isArray(data.organizations) || data.organizations.length === 0)) {
        console.log('🔧 Fixing missing organization data');
        const { data: orgData } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', data.org_id)
          .single();
          
        if (orgData) {
          (data as any).organizations = [orgData];
        }
      }
      
      console.log('✅ Profile loaded successfully:', data);
      setProfile(data);
      saveToCache(data, user.id);
      setLoading(false);
      setProfileTimeout(false);
      
    } catch (error) {
      console.error('💥 Exception in refreshProfile:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Reset timeout state for new session
          setProfileTimeout(false);
          // Fetch user profile when user logs in
          setTimeout(() => {
            refreshProfile();
          }, 100);
        } else {
          setProfile(null);
          clearCache();
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          refreshProfile();
        }, 100);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    clearCache();
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    profile,
    loading,
    profileTimeout,
    signOut,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}