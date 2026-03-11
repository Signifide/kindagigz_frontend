import toast from 'react-hot-toast';
import { getCookie } from '../utils/cookies';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  customErrorMessages?: {
    400?: string;
    401?: string;
    403?: string;
    404?: string;
    413?: string;
    429?: string;
    500?: string;
    503?: string;
    network?: string;
  };
  showToast?: boolean;
  throwOnError?: boolean;
}

interface ApiError {
  status?: number;
  message: string;
  errors?: Record<string, string[]>;
  correlationId?: string;
}

/**
 * Generate unique correlation ID for request tracking
 */
const generateCorrelationId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Universal API client with enhanced error handling
 */
export const apiClient = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    params,
    customErrorMessages = {},
    showToast = true,
    throwOnError = true,
    ...customConfig
  } = options;

  const correlationId = generateCorrelationId();

  // 1. Build URL
  const url = endpoint.startsWith('http') 
    ? new URL(endpoint) 
    : new URL(endpoint, window.location.origin);
    
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }

  // 2. Setup headers
  const method = customConfig.method?.toUpperCase() || 'GET';
  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  const headers: Record<string, string> = {
    ...((customConfig.headers as Record<string, string>) || {}),
    'X-Correlation-ID': correlationId,
  };

  // Only set Content-Type if not already set and not FormData
  if (!headers['Content-Type'] && !(customConfig.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // 3. Add CSRF token for unsafe methods
  if (unsafeMethods.includes(method)) {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers,
    credentials: 'include',
  };

  try {
    const response = await fetch(url.toString(), config);

    // ✅ Handle HTTP errors
    if (!response.ok) {
      const error = await handleErrorResponse(
        response,
        correlationId,
        customErrorMessages,
        showToast
      );
      
      if (throwOnError) {
        throw error;
      }
      return error as any;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    // ✅ Check if this is a network error (not an HTTP error we already handled)
    const isNetworkError = 
      !error.status && // Not an HTTP error we created
      (error.message === 'Failed to fetch' || 
       error.name === 'TypeError' ||
       error.message?.includes('NetworkError'));

    if (isNetworkError) {
      const networkError: ApiError = {
        message: customErrorMessages.network || 'Network error. Please check your connection.',
        correlationId,
      };

      if (showToast) {
        toast.error(networkError.message, { 
          id: `network-${correlationId}`,
          duration: 5000,
        });
      }

      if (throwOnError) {
        throw networkError;
      }
      return networkError as any;
    }

    // ✅ Re-throw HTTP errors (already handled by handleErrorResponse)
    throw error;
  }
};

/**
 * Handle error responses based on status code
 * Returns an ApiError object instead of throwing
 */
async function handleErrorResponse(
  response: Response,
  correlationId: string,
  customMessages: RequestOptions['customErrorMessages'] = {},
  showToast: boolean
): Promise<ApiError> {
  const status = response.status;
  let errorData: any = {};

  try {
    errorData = await response.json();
  } catch {
    // Response body might not be JSON
  }

  let errorMessage: string;
  let toastDuration = 5000;

  // ✅ Status-specific error handling
  switch (status) {
    case 400: // Bad Request
      errorMessage = customMessages[400] || extractErrorMessage(errorData) || 'Invalid request. Please check your input.';
      break;

    case 401: // Unauthorized
      errorMessage = customMessages[401] || extractErrorMessage(errorData) || 'Session expired. Please log in again.';
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      break;

    case 403: // Forbidden
      errorMessage = customMessages[403] || 'You don\'t have permission to perform this action.';
      break;

    case 404: // Not Found
      errorMessage = customMessages[404] || 'The requested resource was not found.';
      break;

    case 413: // File upload error
      errorMessage = customMessages[413] || 'Issue with a file uploaded.';
      break;

    case 429: // Too Many Requests
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? ` Try again in ${retryAfter} seconds.` : ' Please try again shortly.';
      errorMessage = customMessages[429] || `Too many requests.${waitTime}`;
      toastDuration = 7000;
      break;

    case 500: // Internal Server Error
      errorMessage = customMessages[500] || 'Server error. Our team has been notified.';
      // console.error(`[${correlationId}] Server error:`, errorData);
      toastDuration = 7000;
      break;

    case 503: // Service Unavailable
      errorMessage = customMessages[503] || 'Service temporarily unavailable. Please try again later.';
      toastDuration = 7000;
      break;

    default:
      errorMessage = extractErrorMessage(errorData) || `An error occurred (${status}).`;
  }

  // Show toast notification
  if (showToast) {
    toast.error(errorMessage, {
      id: `error-${correlationId}`,
      duration: toastDuration,
    });
  }

  // Return error object
  return {
    status,
    message: errorMessage,
    errors: errorData.errors || errorData,
    correlationId,
  };
}

/**
 * Extract error message from Django REST Framework error response
 */
function extractErrorMessage(errorData: any): string | null {
  if (errorData.detail) {
    return typeof errorData.detail === 'string' ? errorData.detail : null;
  }

  if (errorData.non_field_errors) {
    return Array.isArray(errorData.non_field_errors)
      ? errorData.non_field_errors[0]
      : errorData.non_field_errors;
  }

  if (typeof errorData === 'object') {
    const firstKey = Object.keys(errorData)[0];
    if (firstKey && errorData[firstKey]) {
      const fieldErrors = errorData[firstKey];
      return Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
    }
  }

  return null;
}

/**
 * Specialized GET request
 */
export const apiGet = <T = any>(
  endpoint: string,
  options: Omit<RequestOptions, 'method' | 'body'> = {}
): Promise<T> => {
  return apiClient<T>(endpoint, { ...options, method: 'GET' });
};

/**
 * Specialized POST request
 */
export const apiPost = <T = any>(
  endpoint: string,
  body: any,
  options: Omit<RequestOptions, 'method' | 'body'> = {}
): Promise<T> => {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
};

/**
 * Specialized PUT request
 */
export const apiPut = <T = any>(
  endpoint: string,
  body: any,
  options: Omit<RequestOptions, 'method' | 'body'> = {}
): Promise<T> => {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

/**
 * Specialized PATCH request
 */
export const apiPatch = <T = any>(
  endpoint: string,
  body: any,
  options: Omit<RequestOptions, 'method' | 'body'> = {}
): Promise<T> => {
  return apiClient<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  });
};

/**
 * Specialized DELETE request
 */
export const apiDelete = <T = any>(
  endpoint: string,
  options: Omit<RequestOptions, 'method' | 'body'> = {}
): Promise<T> => {
  return apiClient<T>(endpoint, { ...options, method: 'DELETE' });
};