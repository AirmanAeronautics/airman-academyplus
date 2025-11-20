// AuthContext for auth and onboarding
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  loginWithPassword,
  loginWithOtp,
  verifyOtp,
  fetchCurrentUser,
  logout as logoutApi,
  type User,
  type LoginPasswordResponse,
  type LoginOtpResponse,
  type VerifyOtpResponse,
} from '@/lib/api/auth';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { handleApiError } from '@/lib/api/handleApiError';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
  loginWithOtp: (identifier: string) => Promise<void>;
  verifyOtp: (identifier: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  /**
   * Get dashboard route based on user role
   */
  const getDashboardRoute = useCallback((primaryRole: string): string => {
    switch (primaryRole) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'INSTRUCTOR':
        return '/instructor/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      default:
        return '/';
    }
  }, []);

  /**
   * Handle successful login - store tokens, update state, redirect
   */
  const handleLoginSuccess = useCallback((response: LoginPasswordResponse | VerifyOtpResponse) => {
    const { accessToken: token, refreshToken, user: userData } = response.data;
    
    // Store tokens
    tokenStorage.setAccessToken(token);
    if (refreshToken) {
      tokenStorage.setRefreshToken(refreshToken);
    }
    
    // Update state
    setAccessToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    
    // Redirect based on onboarding status (using window.location for reliability)
    if (userData.isOnboardingComplete) {
      window.location.href = getDashboardRoute(userData.primaryRole);
    } else {
      window.location.href = '/onboarding/start';
    }
  }, [getDashboardRoute]);

  /**
   * Fetch current user on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = tokenStorage.getAccessToken();
      
      if (storedToken) {
        setAccessToken(storedToken);
        try {
          const response = await fetchCurrentUser();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token invalid, clear it
          tokenStorage.clearTokens();
          setAccessToken(null);
          setIsAuthenticated(false);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login with password
   */
  const handleLoginWithPassword = async (identifier: string, password: string): Promise<void> => {
    try {
      const response = await loginWithPassword(identifier, password);
      handleLoginSuccess(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw apiError;
    }
  };

  /**
   * Request OTP for login
   */
  const handleLoginWithOtp = async (identifier: string): Promise<void> => {
    try {
      const response = await loginWithOtp(identifier);
      // Navigate to OTP verification page
      window.location.href = `/auth/verify-otp?identifier=${encodeURIComponent(identifier)}`;
    } catch (error) {
      const apiError = handleApiError(error);
      throw apiError;
    }
  };

  /**
   * Verify OTP and complete login
   */
  const handleVerifyOtp = async (identifier: string, otp: string): Promise<void> => {
    try {
      const response = await verifyOtp(identifier, otp);
      handleLoginSuccess(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw apiError;
    }
  };

  /**
   * Logout
   */
  const handleLogout = async (): Promise<void> => {
    try {
      if (accessToken) {
        await logoutApi();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenStorage.clearTokens();
      setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/auth';
    }
  };

  /**
   * Refresh current user data
   */
  const refreshMe = async (): Promise<void> => {
    try {
      const response = await fetchCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.status === 401) {
        tokenStorage.clearTokens();
        setAccessToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
      throw apiError;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
    loginWithPassword: handleLoginWithPassword,
    loginWithOtp: handleLoginWithOtp,
    verifyOtp: handleVerifyOtp,
    logout: handleLogout,
    refreshMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

