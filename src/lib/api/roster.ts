// Roster API functions
import { apiRequest } from './client';
import { handleApiError } from './handleApiError';

// Types
export interface RosterEntry {
  id: string;
  date: string; // ISO or YYYY-MM-DD
  startTime: string; // "09:00"
  endTime: string; // "11:00"
  studentId?: string;
  studentName?: string;
  instructorId: string;
  instructorName: string;
  aircraftId?: string;
  aircraftRegistration?: string;
  lessonCode?: string; // e.g., "PPL-CL-01"
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  type: 'GROUND' | 'FLIGHT' | 'SIM';
  notes?: string;
}

export interface MasterRosterResponse {
  success: true;
  data: {
    entries: RosterEntry[];
  };
}

export interface MyRosterResponse {
  success: true;
  data: {
    entries: RosterEntry[];
  };
}

export interface CreateRosterPayload {
  instituteId: string;
  date: string; // "2025-11-25"
  startTime: string; // "09:00"
  endTime: string; // "11:00"
  type: 'GROUND' | 'FLIGHT' | 'SIM';
  studentId?: string;
  instructorId: string;
  aircraftId?: string;
  lessonCode?: string;
  notes?: string;
}

export interface CreateRosterResponse {
  success: true;
  data: RosterEntry;
}

export interface UpdateRosterPayload {
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: 'GROUND' | 'FLIGHT' | 'SIM';
  studentId?: string | null;
  instructorId?: string;
  aircraftId?: string | null;
  lessonCode?: string | null;
  status?: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string | null;
}

export interface UpdateRosterResponse {
  success: true;
  data: RosterEntry;
}

export interface DeleteRosterResponse {
  success: true;
  message: string;
}

export interface AiRosterSuggestion {
  tempId: string; // client-side-only id
  date: string;
  startTime: string;
  endTime: string;
  type: 'GROUND' | 'FLIGHT' | 'SIM';
  studentId?: string;
  studentName?: string;
  instructorId: string;
  instructorName: string;
  aircraftId?: string;
  aircraftRegistration?: string;
  lessonCode?: string;
  confidenceScore: number; // 0-1 or 0-100
  conflictFlags?: string[]; // ["WX_RISK", "MAINT_DUE", "DUTY_LIMIT"]
}

export interface GenerateAiRosterPayload {
  instituteId: string;
  startDate: string; // "2025-11-20"
  endDate: string; // "2025-11-25"
  instructorIds?: string[];
  studentIds?: string[];
  aircraftIds?: string[];
  lessonCodes?: string[];
}

export interface GenerateAiRosterResponse {
  success: true;
  data: {
    suggestions: AiRosterSuggestion[];
  };
}

export interface WeatherData {
  icao: string;
  metar: string;
  conditionsSummary: string; // e.g. "VFR", "MVFR"
  wind: {
    direction: number | null;
    speedKt: number | null;
    gustKt?: number | null;
  };
  visibilityMeters?: number | null;
  ceilingFeet?: number | null;
}

export interface WeatherResponse {
  success: true;
  data: WeatherData;
}

export interface Notam {
  id: string;
  summary: string;
  from: string; // ISO
  to: string; // ISO
  isCritical: boolean;
}

export interface NotamsResponse {
  success: true;
  data: {
    icao: string;
    notams: Notam[];
  };
}

// API Functions

/**
 * Fetch master roster for an institute over a date range
 */
export async function fetchMasterRoster(params: {
  instituteId: string;
  startDate: string;
  endDate: string;
}): Promise<MasterRosterResponse> {
  try {
    const queryParams = new URLSearchParams({
      instituteId: params.instituteId,
      startDate: params.startDate,
      endDate: params.endDate,
    });
    
    const response = await apiRequest<MasterRosterResponse>(
      `/roster/master?${queryParams.toString()}`,
      { method: 'GET' }
    );
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

/**
 * Fetch roster entries for current logged-in user
 */
export async function fetchMyRoster(params: {
  startDate: string;
  endDate: string;
}): Promise<MyRosterResponse> {
  try {
    const queryParams = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    
    const response = await apiRequest<MyRosterResponse>(
      `/roster/my?${queryParams.toString()}`,
      { method: 'GET' }
    );
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

/**
 * Create a roster entry
 */
export async function createRosterEntry(
  payload: CreateRosterPayload
): Promise<CreateRosterResponse> {
  try {
    const response = await apiRequest<CreateRosterResponse>(
      '/roster/create',
      {
        method: 'POST',
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
 * Update an existing roster entry
 */
export async function updateRosterEntry(
  id: string,
  payload: UpdateRosterPayload
): Promise<UpdateRosterResponse> {
  try {
    const response = await apiRequest<UpdateRosterResponse>(
      `/roster/${id}`,
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
 * Delete a roster entry
 */
export async function deleteRosterEntry(
  id: string
): Promise<DeleteRosterResponse> {
  try {
    const response = await apiRequest<DeleteRosterResponse>(
      `/roster/${id}`,
      { method: 'DELETE' }
    );
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

/**
 * Generate AI roster suggestions
 */
export async function generateAiRoster(
  payload: GenerateAiRosterPayload
): Promise<GenerateAiRosterResponse> {
  try {
    const response = await apiRequest<GenerateAiRosterResponse>(
      '/ai/roster/generate',
      {
        method: 'POST',
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
 * Get current weather summary for an ICAO
 */
export async function fetchLiveWeather(
  icao: string
): Promise<WeatherResponse> {
  try {
    const response = await apiRequest<WeatherResponse>(
      `/weather/live?icao=${encodeURIComponent(icao)}`,
      { method: 'GET' }
    );
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

/**
 * Get NOTAM summary for an ICAO
 */
export async function fetchNotams(icao: string): Promise<NotamsResponse> {
  try {
    const response = await apiRequest<NotamsResponse>(
      `/notams?icao=${encodeURIComponent(icao)}`,
      { method: 'GET' }
    );
    return response;
  } catch (error) {
    const apiError = handleApiError(error);
    throw apiError;
  }
}

