// Error handling utility for API errors

export interface ApiError {
  message: string;
  errorCode?: string;
  status?: number;
  fieldErrors?: Record<string, string>;
}

export function handleApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    
    if (response?.data) {
      const data = response.data as any;
      
      return {
        message: data.message || (error as Error).message || 'An error occurred',
        errorCode: data.errorCode,
        status: response.status,
        fieldErrors: data.fieldErrors || data.errors,
      };
    }
    
    return {
      message: (error as Error).message || 'An error occurred',
      status: response?.status,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message || 'An error occurred',
    };
  }
  
  return {
    message: 'An unexpected error occurred',
  };
}

