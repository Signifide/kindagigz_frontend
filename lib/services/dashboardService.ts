import { API_ENDPOINTS } from '@/lib/config/api';
import { authService } from './authService';
import { apiGet, apiPatch } from '../api/apiClient';
import type { DashboardStats, Booking, Message, Client, Review, Payment, AnalyticsData } from '@/types/dashboard';
import { Professional } from '@/types/auth';

class DashboardService {
  /**
   * Get auth headers - NO TOKEN NEEDED (cookies sent automatically)
   */
  private getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get dashboard overview stats
   */
  async getDashboardStats(): Promise<any> {
    return apiGet(`${API_ENDPOINTS.PROFESSIONALS.PROFILE}/stats/`, {
      customErrorMessages: {
        401: 'Session expired. Please log in to see your earnings.',
        403: 'This area is reserved for verified professionals.',
      },
    });
  }

  /**
   * Update professional profile (AUTHENTICATED)
   */
  async updateProfile(profileId: number, data: Partial<Professional>): Promise<Professional> {
    return apiPatch<Professional>(
      API_ENDPOINTS.PROFESSIONALS.DETAIL(profileId.toString()),
      data,
      {
        customErrorMessages: {
          400: 'Invalid profile data. Please check all fields.',
          401: 'Please log in to update your profile.',
          403: 'You don\'t have permission to update this profile.',
          404: 'Profile not found.',
        },
      }
    );
  }

  /**
   * Get bookings
   */
  async getBookings(status?: string): Promise<Booking[]> {
    try {
      const url = status
        ? `${API_ENDPOINTS.PROFESSIONALS.PROFILE}/bookings/?status=${status}`
        : `${API_ENDPOINTS.PROFESSIONALS.PROFILE}/bookings/`;

      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
        credentials: 'include', // Send cookies
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  /**
   * Get messages
   */
  async getMessages(): Promise<Message[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.PROFESSIONALS.PROFILE}/messages/`, {
        headers: this.getAuthHeaders(),
        credentials: 'include', // Send cookies
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Get clients
   */
  async getClients(): Promise<Client[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.PROFESSIONALS.PROFILE}/clients/`, {
        headers: this.getAuthHeaders(),
        credentials: 'include', // Send cookies
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      return [];
    }
  }

  /**
   * Get reviews
   */
  async getReviews(): Promise<Review[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.PROFESSIONALS.PROFILE}/reviews/`, {
        headers: this.getAuthHeaders(),
        credentials: 'include', // Send cookies
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  /**
   * Get payments
   */
  async getPayments(): Promise<Payment[]> {
    try {
      const response = await fetch(`${API_ENDPOINTS.PROFESSIONALS.PROFILE}/payments/`, {
        headers: this.getAuthHeaders(),
        credentials: 'include', // Send cookies
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  /**
   * Get analytics data
   */
  async getAnalytics(): Promise<AnalyticsData | null> {
    try {
      const response = await fetch(`${API_ENDPOINTS.PROFESSIONALS.PROFILE}/analytics/`, {
        headers: this.getAuthHeaders(),
        credentials: 'include', // Send cookies
      });

      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }
}

export const dashboardService = new DashboardService();