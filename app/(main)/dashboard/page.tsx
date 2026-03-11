'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { professionalService } from '@/lib/services/professionalService';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ROUTES } from '@/lib/constants/routes';
import type { Professional } from '@/types/auth';
import { API_ENDPOINTS } from '@/lib/config/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [professional, setProfessional] = React.useState<Professional | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // toast.error('Not authenticated, redirecting to login');
      router.push(ROUTES.LOGIN);
      return;
    }

    if (user?.role !== 'professional') {
      toast.error("Not a professional, redirecting to home page")
      router.push(ROUTES.HOME);
      return;
    }

    const fetchProfessional = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ENDPOINTS.PROFESSIONALS.PROFILE, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', 
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 401) {
            router.push(ROUTES.LOGIN);
            return;
          }
          
          if (response.status === 404) {
            toast.error('Professional profile not found. Please complete your profile setup.');
            return;
          }
          
          throw new Error('Failed to fetch professional profile', errorData);
        }

        const prof = await response.json();
        setProfessional(prof);
      } catch (error) {
        // console.error('Error fetching professional:', error);
        toast.error('Failed to load dashboard. Please try again.');
        router.push(ROUTES.HOME);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessional();
  }, [user, isLoading, isAuthenticated, router]);

  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!professional) {
    return null;
  }

  return <DashboardLayout professional={professional} />;
}