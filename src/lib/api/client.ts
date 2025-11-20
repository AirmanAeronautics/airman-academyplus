// API client for auth and onboarding (using fetch to match existing codebase)
import { tokenStorage } from './auth/tokenStorage';

const BASE_API_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Make an API request with automatic token handling
 */
export async function apiRequest<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { skipAuth = false, ...fetchConfig } = config;
  
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_API_URL}${endpoint}`;
  
  const headers = new Headers(fetchConfig.headers || {});
  headers.set('Content-Type', 'application/json');
  
  if (!skipAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  const response = await fetch(url, {
    ...fetchConfig,
    headers,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    let errorData: any = {};
    
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText || `HTTP ${response.status} ${response.statusText}` };
    }
    
    const error: any = new Error(errorData.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.response = { data: errorData, status: response.status };
    throw error;
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  
  return {} as T;
}

export default { request: apiRequest };

