import { API_ENDPOINTS } from '@/lib/config/api';
import { apiGet, apiPost, apiPut, apiPatch } from '../api/apiClient';
import { Professional } from '@/types/auth';

// Paginated response type
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class ProfessionalService {
  /**
   * Fetch all professionals (verified and available only)
   */
  async getProfessionals(params?: {
    city?: string;
    category?: string;
    limit?: number;
  }): Promise<Professional[]> {
    try {
      const data = await apiGet<PaginatedResponse<Professional>>(
        API_ENDPOINTS.PROFESSIONALS.LIST,
        {
          params: params as Record<string, string>,
          // Next.js specific caching
          next: { revalidate: 60 }, 
          showToast: false, // Don't annoy users with toasts for background list loads
          customErrorMessages: {
            503: 'Professional listing is temporarily offline.',
          },
        }
      );

      let professionals = data.results || [];

      if (params?.limit && professionals.length > params.limit) {
        professionals = professionals.slice(0, params.limit);
      }

      return professionals;
    } catch (error) {
      console.error('Error fetching professionals:', error);
      return [];
    }
  }

  /**
   * Fetch a single professional by ID
   */
  async getProfessionalById(id: number): Promise<Professional | null> {
    try {
      const url = API_ENDPOINTS.PROFESSIONALS.DETAIL(id.toString());

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Professional not found:', errorData);
        // throw new Error('Professional not found');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching professiona by ID:', error);
      return null;
    }
  }

  /**
   * Fetch professionals in same category (for "You May Be Interested In")
   */
  async getSimilarProfessionals(
    categoryId: number,
    excludeId: number,
    limit: number = 3
  ): Promise<Professional[]> {
    try {
      const professionals = await this.getProfessionals();
      
      return professionals
        .filter(prof => 
          prof.category.id === categoryId && 
          prof.id !== excludeId
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching similar professionals:', error);
      return [];
    }
  }

  /**
   * Fetch featured professionals (highest rated, most jobs)
   */
  async getFeaturedProfessionals(limit: number = 6): Promise<Professional[]> {
    try {
      const professionals = await this.getProfessionals();
      
      // Sort by rating and total jobs
      const sorted = professionals.sort((a, b) => {
        const ratingDiff = parseFloat(b.average_rating) - parseFloat(a.average_rating);
        if (ratingDiff !== 0) return ratingDiff;
        return b.total_jobs - a.total_jobs;
      });
      
      return sorted.slice(0, limit);
    } catch (error) {
      console.error('Error fetching featured professionals:', error);
      return [];
    }
  }

  /**
   * Search professionals by name or business name
   */
  async searchProfessionals(query: string): Promise<Professional[]> {
    try {
      const professionals = await this.getProfessionals();
      
      const lowerQuery = query.toLowerCase();
      return professionals.filter(prof => 
        prof.business_name.toLowerCase().includes(lowerQuery) ||
        prof.user.first_name.toLowerCase().includes(lowerQuery) ||
        prof.user.last_name.toLowerCase().includes(lowerQuery) ||
        prof.about.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching professionals:', error);
      return [];
    }
  }

  /**
   * Get professional statistics
   */
  async getProfessionalStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byCity: Record<string, number>;
  }> {
    try {
      const professionals = await this.getProfessionals();
      
      const byCategory: Record<string, number> = {};
      const byCity: Record<string, number> = {};
      
      professionals.forEach(prof => {
        // Count by category
        const categoryName = prof.category.name;
        byCategory[categoryName] = (byCategory[categoryName] || 0) + 1;
        
        // Count by city
        const city = prof.user.city;
        byCity[city] = (byCity[city] || 0) + 1;
      });
      
      return {
        total: professionals.length,
        byCategory,
        byCity,
      };
    } catch (error) {
      console.error('Error getting professional stats:', error);
      return { total: 0, byCategory: {}, byCity: {} };
    }
  }
}

export const professionalService = new ProfessionalService();
