import { API_ENDPOINTS } from '@/lib/config/api';
import { apiClient, apiPost, apiGet } from '../api/apiClient';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  ApiError,
} from '@/types/auth';

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiPost<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data,
        {
          customErrorMessages: {
            400: 'Invalid registration data. Please check all fields.',
            429: 'Too many registration attempts. Please try again later.',
          },
        }
      );

      if (response.user) {
        this.setUser(response.user);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register a professional with FormData
   */
  async registerProfessional(formData: FormData): Promise<AuthResponse> {
    try {
      const response = await apiClient<AuthResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        {
          method: 'POST',
          body: formData,
          
          customErrorMessages: {
            400: 'Invalid professional registration data. Please check all required fields.',
            413: 'Uploaded files are too large. Please use smaller images.',
            429: 'Too many registration attempts. Please try again later.',
          },
        }
      );

      if (response.user) {
        this.setUser(response.user);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiPost<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials,
        {
          customErrorMessages: {
            400: 'Invalid email or password.',
            401: 'Invalid credentials. Please try again.',
            429: 'Too many login attempts. Please wait before trying again.',
            503: 'Login service is temporarily unavailable. Please try again in a few minutes.',
          },
        }
      );

      if (response.user) {
        this.setUser(response.user);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiPost(
        API_ENDPOINTS.AUTH.LOGOUT,
        {},
        {
          customErrorMessages: {
            401: 'Session already expired.',
          },
          showToast: false, // Don't show error toast for logout
          throwOnError: false, // Don't throw error for logout
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearUser();
    }
  }

  /**
   * Get current user from backend
   */
  async getCurrentUser(): Promise<User> {
    try {
      const user = await apiGet<User>(API_ENDPOINTS.AUTH.CURRENT_USER, {
        customErrorMessages: {
          401: 'Please log in to continue.',
          403: 'Access denied.',
        },
      });

      this.setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token (automatic via cookie)
   */
  async refreshAccessToken(): Promise<void> {
    try {
      await apiPost(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        {},
        {
          customErrorMessages: {
            401: 'Session expired. Please log in again.',
          },
          showToast: false, // Silent refresh
        }
      );
    } catch (error) {
      this.clearUser();
      throw error;
    }
  }

  /**
   * User Storage
   */
  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  clearUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  }

  /**
   * Clear entire session
   */
  clearSession(): void {
    this.clearUser();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  /**
   *  Check if user has specific role
   */
  hasRole(role: 'client' | 'professional'): boolean {
    const user = this.getUser();
    return user?.role === role;
  }

  /**
   * Error handling
   */
  private handleError(error: any): ApiError {
    if (error.response) {
      const { data, status } = error.response;

      let message = 'An error occurred';
      let errors: Record<string, string[]> | undefined;

      if (data.detail) {
        message = typeof data.detail === 'string' ? data.detail : 'An error occurred';
      } else if (data.non_field_errors) {
        message = Array.isArray(data.non_field_errors)
          ? data.non_field_errors[0]
          : data.non_field_errors;
      } else if (typeof data === 'object') {
        const firstErrorField = Object.keys(data)[0];
        if (firstErrorField && data[firstErrorField]) {
          const fieldErrors = data[firstErrorField];
          message = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
        }
        errors = data;
      }

      return { message, errors };
    }

    if (error instanceof Error) {
      return { message: error.message || 'An unexpected error occurred' };
    }

    return { message: 'An unexpected error occurred' };
  }
}

export const authService = new AuthService();