import { API_ENDPOINTS } from '@/lib/config/api';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  AuthTokens,
  ApiError,
} from '@/types/auth';

class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user';
  
  // Token will be refreshed 5 minutes before expiry
  private readonly REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes in ms

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Sending registration data:', data);
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log('Registration response status:', response.status);

      if (!response.ok) {
        console.error('Registration failed:', responseData);
        throw this.handleError({ response: { data: responseData, status: response.status } });
      }

      // Store tokens and user
      if (responseData.tokens) {
        this.setTokens(responseData.tokens);
      }
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
   * Register a professional with FormData (includes files)
   */
  async registerProfessional(formData: FormData): Promise<AuthResponse> {
    try {
      console.log('Sending professional registration data');

      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();
      console.log('Professional registration response status:', response.status);

      if (!response.ok) {
        console.error('Professional registration failed:', responseData);
        throw this.handleError({ response: { data: responseData, status: response.status } });
      }

      // Store tokens and user
      if (responseData.tokens) {
        this.setTokens(responseData.tokens);
      }
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
        body: JSON.stringify(credentials),
      });

      const responseData = await response.json();
      console.log('Login response status:', response.status);

      if (!response.ok) {
        throw this.handleError({ response: { data: responseData, status: response.status } });
      }

      // ✅ Store tokens and user immediately after successful login
      if (responseData.tokens) {
        this.setTokens(responseData.tokens);
      }
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

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      console.log('Attempting logout');

      const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.warn('Backend logout error:', responseData.error || 'Unknown error');
      } else {
        console.log('Logout successful');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local session
      this.clearSession();
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
          'Authorization': `Bearer ${this.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const user = await response.json();
      
      // Update stored user
      this.setUser(user);
      
      return user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<AuthTokens> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setTokens(data);
      return data;
    } catch (error) {
      this.clearSession();
      throw this.handleError(error);
    }
  }

  /**
   * ✅ Check if token is expired or about to expire
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      // Check if token will expire in next 5 minutes
      return expiryTime - currentTime < this.REFRESH_BUFFER;
    } catch (error) {
      return true;
    }
  }

  /**
   * ✅ Get valid access token (auto-refresh if needed)
   */
  async getValidAccessToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    // Check if token is expired or about to expire
    if (this.isTokenExpired(accessToken)) {
      try {
        const tokens = await this.refreshAccessToken();
        return tokens.access;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    }

    return accessToken;
  }

  /**
   * Token Management
   */
  setTokens(tokens: { access: string; refresh: string }): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh);
    }
  }

  getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  /**
   * User Storage
   */
  setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(this.USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  clearUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * ✅ Clear entire session
   */
  clearSession(): void {
    this.clearTokens();
    this.clearUser();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getUser();
  }

  /**
   * ✅ Check if user has specific role
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