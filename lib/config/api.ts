/**
 * API Configuration
 * Central configuration for all API endpoints and base URLs
 */

// Environment-based base URL
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://api.kindagigz.com'
    : 'http://127.0.0.1:8000');


// API Endpoints
export const API_ENDPOINTS = {
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
    PROFILE: (id: string) => `${API_BASE_URL}/api/professionals/profile/${id}/`,
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