// User & Authentication Types

import { Service, Category, GalleryItem, WorkingHours, TimeSlot, Location } from ".";

export type UserRole = 'client' | 'professional';

export interface User {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: UserRole;
  profile_image: string | null;
  preferred_language: string;
  city: string;
  country: string;
  is_verified: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  created_at: string;
  last_active: string;
  profile: UserProfile;
}

export interface UserProfile {
  bio: string;
  date_of_birth: string | null;
  website: string;
  facebook_url: string;
  twitter_url: string;
  linkedin_url: string;
  tiktok_url: string;
  instagram_url: string;
}

export interface Professional {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    city: string;
    country: string;
    profile_image: string | null;
  };
  business_name: string;
  tagline: string;
  about: string;
  category: Category;
  services: Service[];
  status: 'online' | 'offline' | 'busy';
  currency: string;
  banner_image: string | null;
  logo: string | null;
  location_name: string;
  address: string;
  latitude: string;
  longitude: string;
  service_radius_km: number;
  location: Location;
  is_available: boolean;
  response_time: string;
  working_hours: WorkingHours;
  languages: string[];
  average_rating: string;
  total_reviews: number;
  total_jobs: number;
  completed_jobs: number;
  badges?: Array<{ id: string; name: string; icon: string; level: number }>; // For Skills Boost
  verification_status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  verified_at: string | null;
  gallery?: GalleryItem[];
  created_at: string;
  updated_at: string;
  distance_km?: number | null;
  timezone: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ServiceProOnboardingData {
  business_name: string;
  about: string;
  tagline?: string;
  category_id: number;
  service_ids: number[]; // Array of service IDs (max 5)
  logo?: File;
  banner_image?: File;
  location_name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  service_radius_km?: number;
  languages?: string[];
  agreeToTerms: boolean;
}

export interface RegisterData {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  role: UserRole;
  city?: string;
  country?: string;
  preferred_language?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface CompleteProfessionalRegistration extends RegisterData {
  professional_data?: ServiceProOnboardingData;
}