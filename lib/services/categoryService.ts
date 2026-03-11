import { API_ENDPOINTS } from '@/lib/config/api';
import { Category, Service } from '@/types';

// Response types for paginated data
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

class CategoryService {
  /**
   * Fetch all categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(API_ENDPOINTS.SERVICES.CATEGORIES, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data: PaginatedResponse<Category> = await response.json();
      
      // Extract the results array from paginated response
      return data.results || [];
    } catch (error) {
      // console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Fetch all services (optionally filtered by category)
   */
  async getServices(categoryId?: number): Promise<Service[]> {
    try {
      const url = categoryId 
        ? `${API_ENDPOINTS.SERVICES.LIST}?category=${categoryId}`
        : API_ENDPOINTS.SERVICES.LIST;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data: PaginatedResponse<Service> = await response.json();
      
      // Extract the results array from paginated response
      return data.results || [];
    } catch (error) {
      // console.error('Error fetching services:', error);
      throw error;
    }
  }

  /**
   * Fetch all pages of data (for large datasets)
   * This recursively fetches all pages if there are more results
   */
  async getAllPaginated<T>(url: string): Promise<T[]> {
    const allResults: T[] = [];
    let nextUrl: string | null = url;

    while (nextUrl) {
      try {
        const response = await fetch(nextUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch paginated data');
        }

        const data: PaginatedResponse<T> = await response.json();
        allResults.push(...data.results);
        nextUrl = data.next;
      } catch (error) {
        // console.error('Error fetching paginated data:', error);
        break;
      }
    }

    return allResults;
  }

  /**
   * Fetch services for a specific category
   */
  async getCategoryWithServices(categoryId: number): Promise<{ 
    category: Category; 
    services: Service[] 
  }> {
    try {
      const response = await fetch(
        `${API_ENDPOINTS.SERVICES.CATEGORIES}/${categoryId}/services/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch category services');
      }

      const data = await response.json();
      
      return {
        category: data,
        services: data.services || [],
      };
    } catch (error) {
      // console.error('Error fetching category with services:', error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();