import { API_ENDPOINTS } from '@/lib/config/api';
import { apiClient } from '../api/apiClient';
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
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Registration response status:', response.status);

      if (!response.ok) {
        console.error('Registration failed:', responseData);
        throw this.handleError({ response: { data: responseData, status: response.status } });
      }

      // Store user data
      if (responseData.user) {
        this.setUser(responseData.user);
      }

      return responseData;
    } catch (error) {
      if ((error as ApiError).message) {
        console.error('Registration error:', error);
        throw error;
      }
      console.error('Unexpected registration error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Register a professional with FormData
   */
  async registerProfessional(formData: FormData): Promise<AuthResponse> {
    try {
      console.log('Sending professional registration data');

      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        credentials: 'include', // Include cookies
        body: formData,
      });

      const responseData = await response.json();
      console.log('Professional registration response status:', response.status);

      if (!response.ok) {
        console.error('Professional registration failed:', responseData);
        throw this.handleError({ response: { data: responseData, status: response.status } });
      }

      // Store user data
      if (responseData.user) {
        this.setUser(responseData.user);
      }

      return responseData;
    } catch (error) {
      if ((error as ApiError).message) {
        console.error('Professional registration error:', error);
        throw error;
      }
      console.error('Unexpected professional registration error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(credentials),
      });

      const responseData = await response.json();
      console.log('Login response status:', response.status);

      if (!response.ok) {
        throw this.handleError({ response: { data: responseData, status: response.status } });
      }

      // Store user data
      if (responseData.user) {
        this.setUser(responseData.user);
      }

      return responseData;
    } catch (error) {
      if ((error as ApiError).message) {
        console.error('Login error:', error);
        throw error;
      }
      console.error('Unexpected login error:', error);
      throw this.handleError(error);
    }
  }

  async login(credentials: LoginCredentials) {
    return apiClient(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getCurrentUser() {
    return apiClient(API_ENDPOINTS.AUTH.CURRENT_USER, {
      method: 'GET',
    });
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      console.log('Attempting logout');

      const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.warn('Backend logout error:', responseData.error || 'Unknown logout error');
      } else {
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear user data
      this.clearUser();
    }
  }

  /**
   * Get current user from backend
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.CURRENT_USER, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user: Unauthorized');
      }

      const user = await response.json();
      this.setUser(user);
      
      return user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token (automatic via cookie)
   */
  async refreshAccessToken(): Promise<void> {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      console.log('Token refreshed successfully');
    } catch (error) {
      this.clearUser();
      throw this.handleError(error);
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