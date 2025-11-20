import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { apiClient } from '@/lib/apiClient';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import type { User, AuthResponse, LoginDto, RegisterTenantDto } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  registerTenant: (dto: RegisterTenantDto) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthBackend() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthBackend must be used within an AuthBackendProvider');
  }
  return context;
}

interface AuthBackendProviderProps {
  children: ReactNode;
}

export function AuthBackendProvider({ children }: AuthBackendProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch current user from /api/auth/me
   */
  const fetchCurrentUser = async (token?: string): Promise<User | null> => {
    try {
      const currentToken = token || tokenStorage.getAccessToken();
      if (!currentToken) {
        return null;
      }

      const userData = await apiClient.get<User>('/auth/me', {
        skipRefresh: true, // Don't trigger refresh in this call
      });

      return userData;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      // If 401, tokens are likely expired
      if ((error as any)?.status === 401) {
        tokenStorage.clearTokens();
        setAccessToken(null);
      }
      return null;
    }
  };

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = tokenStorage.getAccessToken();
      
      if (storedToken) {
        setAccessToken(storedToken);
        // Try to fetch user data
        const userData = await fetchCurrentUser(storedToken);
        if (userData) {
          setUser(userData);
        } else {
          // Token might be invalid, clear it
          tokenStorage.clearTokens();
          setAccessToken(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      
      const loginDto: LoginDto = { email, password };
      const response = await apiClient.post<AuthResponse>('/auth/login', loginDto, {
        skipAuth: true, // This is a public endpoint
      });

      // Store tokens
      tokenStorage.setAccessToken(response.accessToken);
      if (response.refreshToken) {
        tokenStorage.setRefreshToken(response.refreshToken);
      }

      // Update state
      setAccessToken(response.accessToken);
      setUser(response.user);

      return {};
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 401) {
        errorMessage = 'Invalid email or password.';
      }

      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new tenant with admin user
   */
  const registerTenant = async (dto: RegisterTenantDto): Promise<{ error?: string }> => {
    try {
      setLoading(true);
      
      const response = await apiClient.post<AuthResponse>('/auth/register-tenant', dto, {
        skipAuth: true, // This is a public endpoint
      });

      // Store tokens
      tokenStorage.setAccessToken(response.accessToken);
      if (response.refreshToken) {
        tokenStorage.setRefreshToken(response.refreshToken);
      }

      // Update state
      setAccessToken(response.accessToken);
      setUser(response.user);

      return {};
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 409) {
        errorMessage = 'A tenant with this information already exists, or you have reached the maximum number of users for this role.';
      } else if (error.status === 400) {
        errorMessage = 'Invalid registration data. Please check all fields.';
      }

      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout - clear tokens and reset state
   */
  const logout = async (): Promise<void> => {
    tokenStorage.clearTokens();
    setAccessToken(null);
    setUser(null);
  };

  /**
   * Refresh user data from server
   */
  const refreshUser = async (): Promise<void> => {
    const userData = await fetchCurrentUser();
    if (userData) {
      setUser(userData);
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    loading,
    login,
    registerTenant,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

