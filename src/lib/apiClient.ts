// Centralized API client for NestJS backend with JWT token management

import { tokenStorage } from './auth/tokenStorage';
import type { RefreshTokenResponse } from '@/types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempts to refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data: RefreshTokenResponse = await response.json();
      tokenStorage.setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      tokenStorage.clearTokens();
      // Redirect to login if we're in the browser
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Core request method with automatic token management and refresh
 */
async function request<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, skipRefresh = false, ...fetchOptions } = options;

  // Build headers
  const headers = new Headers(fetchOptions.headers || {});
  
  // Set Content-Type if not already set and body exists
  if (fetchOptions.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Add Authorization header if not skipping auth
  if (!skipAuth) {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  // Build full URL (path may already include query params)
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  // Make the request
  let response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401 && !skipAuth && !skipRefresh) {
    const newAccessToken = await refreshAccessToken();
    
    if (newAccessToken) {
      // Retry the original request with new token
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(url, {
        ...fetchOptions,
        headers,
      });
    } else {
      // Refresh failed, tokens cleared, redirect will happen
      throw new Error('Authentication failed. Please login again.');
    }
  }

  // Handle non-OK responses
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let errorMessage = `API ${response.status} ${response.statusText}`;
    
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.message) {
        errorMessage = errorJson.message;
      } else if (errorJson.error) {
        errorMessage = errorJson.error;
      }
    } catch {
      if (errorText) {
        errorMessage = errorText;
      }
    }

    const error = new Error(errorMessage);
    (error as any).status = response.status;
    (error as any).statusText = response.statusText;
    throw error;
  }

  // Handle empty responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  // For non-JSON responses, return text or empty object
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

/**
 * API client with convenience methods
 */
export const apiClient = {
  /**
   * Generic request method
   */
  request<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, options);
  },

  /**
   * GET request
   */
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'GET' });
  },

  /**
   * POST request
   */
  post<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PUT request
   */
  put<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * PATCH request
   */
  patch<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  /**
   * DELETE request
   */
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: 'DELETE' });
  },
};

export default apiClient;

