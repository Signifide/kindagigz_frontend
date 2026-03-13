/**
 * API Configuration
 * Central configuration for all API endpoints and base URLs
 */

// Environment-based base URL
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://kindagigz-backend.onrender.com'
    : 'http://localhost:8000');

// export const API_BASE_URL = 'https://kindagigz-backend.onrender.com';

interface ApiEndpoints {
  AUTH: {
    REGISTER: string;
    LOGIN: string;
    LOGOUT: string;
    REFRESH_TOKEN: string;
    CURRENT_USER: string;
    PROFILE: string;
    UPGRADE_TO_PROFESSIONAL: string;
  };
  PROFESSIONALS: {
    LIST: string;
    DETAIL: (id: string) => string;
    PROFILE: string;
  };
  SERVICES: {
    CATEGORIES: string;
    LIST: string;
    VALIDATE: string;
    PROFILE: string;
  };
}

// API Endpoints
export const API_ENDPOINTS: ApiEndpoints = {
  // Authentication
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/users/register/`,
    LOGIN: `${API_BASE_URL}/api/users/login/`,
    LOGOUT: `${API_BASE_URL}/api/users/logout/`,
    REFRESH_TOKEN: `${API_BASE_URL}/api/users/token/refresh/`,
    CURRENT_USER: `${API_BASE_URL}/api/users/me/`,
    PROFILE: `${API_BASE_URL}/api/users/profile/`,
    UPGRADE_TO_PROFESSIONAL: `${API_BASE_URL}/api/users/upgrade-to-professional/`,
  },
  
  PROFESSIONALS: {
    LIST: `${API_BASE_URL}/api/professionals`,
    DETAIL: (id: string) => `${API_BASE_URL}/api/professionals/${id}/`,
    PROFILE: `${API_BASE_URL}/api/professionals/profile`,
  },
  
  SERVICES: {
    CATEGORIES: `${API_BASE_URL}/api/services/categories`,
    LIST: `${API_BASE_URL}/api/services`,
    VALIDATE: `${API_BASE_URL}/api/services/validate`,
    PROFILE: `${API_BASE_URL}/api/professionals/profile`,
  },
} as const;

// API Configuration
export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
} as const;