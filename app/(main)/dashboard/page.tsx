'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { professionalService } from '@/lib/services/professionalService';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ROUTES } from '@/lib/constants/routes';
import type { Professional } from '@/types/auth';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [professional, setProfessional] = React.useState<Professional | null>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    // Wait for auth to initialize
    if (isLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push(ROUTES.LOGIN);
      return;
    }

    // Redirect if not a professional
    if (user?.role !== 'professional') {
      console.log('Not a professional, redirecting to home');
      router.push(ROUTES.HOME);
      return;
    }

    // Fetch professional profile
    const fetchProfessional = async () => {
      try {
        setLoading(true);
        const prof = await professionalService.getProfessionalById(user.id);
        
        if (!prof) {
          console.error('Professional profile not found');
          router.push(ROUTES.HOME);
          return;
        }

        setProfessional(prof);
      } catch (error) {
        console.error('Error fetching professional:', error);
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

  // Don't render until we have professional data
  if (!professional) {
    return null;
  }

  return <DashboardLayout professional={professional} />;
}