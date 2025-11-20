// Auth API functions
import { apiRequest } from './client';
import { handleApiError, type ApiError } from './handleApiError';

// Types
export interface LoginPasswordRequest {
  identifier: string;
  method: 'password';
  password: string;
}

export interface LoginOtpRequest {
  identifier: string;
  method: 'otp';
}

export interface LoginPasswordResponse {
  success: true;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
    user: User;
  };
}

export interface LoginOtpResponse {
  success: true;
  message: string;
  data: {
    otpRequired: true;
    identifier: string;
    otpChannel: 'sms' | 'email';
    expiresInSeconds: number;
  };
}

export interface VerifyOtpRequest {
  identifier: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: true;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
    user: User;
  };
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  roles: ('ADMIN' | 'INSTRUCTOR' | 'STUDENT')[];
  primaryRole: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  isOnboardingComplete: boolean;
}

export interface CurrentUserResponse {
  success: true;
  data: User;
}

export interface LogoutResponse {
  success: true;
  message: string;
}

export interface VerifyInstituteRequest {
  code?: string;
  emailDomain?: string;
}

export interface Institute {
  instituteId: string;
  name: string;
  logoUrl?: string;
  country: string;
  timezone: string;
  type: 'FLIGHT_SCHOOL' | 'GROUND_SCHOOL' | 'UNIVERSITY';
}

export interface VerifyInstituteResponse {
  success: true;
  data: Institute;
}

export interface UpdateProfileRequest {
  name: string;
  country: string;
  timezone: string;
  roleSelection: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  instituteId: string;
  licenseNumber?: string;
  studentId?: string;
  experienceHours?: number;
}

export interface UpdateProfileResponse {
  success: true;
  data: {
    id: string;
    name: string;
    roles: ('ADMIN' | 'INSTRUCTOR' | 'STUDENT')[];
    primaryRole: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
    isOnboardingComplete: true;
  };
}

export interface UserRolesResponse {
  success: true;
  data: {
    roles: ('ADMIN' | 'INSTRUCTOR' | 'STUDENT')[];
    primaryRole: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
  };
}

// API Functions

/**
 * Login with password
 */
export async function loginWithPassword(
  identifier: string,
  password: string
): Promise<LoginPasswordResponse> {
  try {
    const response = await apiRequest<LoginPasswordResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        method: 'password',
        password,
      }),
      skipAuth: true,
    });
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

/**
 * Request OTP for login
 */
export async function loginWithOtp(
  identifier: string
): Promise<LoginOtpResponse> {
  try {
    const response = await apiRequest<LoginOtpResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        method: 'otp',
      }),
      skipAuth: true,
    });
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

/**
 * Verify OTP and complete login
 */
export async function verifyOtp(
  identifier: string,
  otp: string
): Promise<VerifyOtpResponse> {
  try {
    const response = await apiRequest<VerifyOtpResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        identifier,
        otp,
      }),
      skipAuth: true,
    });
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

/**
 * Get current authenticated user
 */
export async function fetchCurrentUser(): Promise<CurrentUserResponse> {
  try {
    const response = await apiRequest<CurrentUserResponse>('/auth/me', {
      method: 'GET',
    });
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

/**
 * Logout
 */
export async function logout(): Promise<LogoutResponse> {
  try {
    const response = await apiRequest<LogoutResponse>('/auth/logout', {
      method: 'POST',
    });
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

/**
 * Verify institute by code or email domain
 */
export async function verifyInstitute(
  payload: VerifyInstituteRequest
): Promise<VerifyInstituteResponse> {
  try {
    const response = await apiRequest<VerifyInstituteResponse>(
      '/institutes/verify',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        skipAuth: true,
      }
    );
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

/**
 * Update user profile (complete onboarding)
 */
export async function updateProfile(
  payload: UpdateProfileRequest
): Promise<UpdateProfileResponse> {
  try {
    const response = await apiRequest<UpdateProfileResponse>(
      '/users/profile/update',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

/**
 * Get user roles
 */
export async function fetchRoles(): Promise<UserRolesResponse> {
  try {
    const response = await apiRequest<UserRolesResponse>('/users/roles', {
      method: 'GET',
    });
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

