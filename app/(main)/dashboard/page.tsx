import React from 'react';
import { redirect } from 'next/navigation';
import { authService } from '@/lib/services/authService';
import { professionalService } from '@/lib/services/professionalService';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ROUTES } from '@/lib/constants/routes';

export default async function DashboardPage() {
  // Get current user
  const user = authService.getUser();

  // Redirect if not authenticated
  if (!user) {
    redirect(ROUTES.LOGIN);
  }

  // Redirect if not a professional
  if (user.role !== 'professional') {
    redirect(ROUTES.HOME);
  }

  // Fetch professional profile
  const professional = await professionalService.getProfessionalById(user.id);

  if (!professional) {
    redirect(ROUTES.HOME);
  }

  return <DashboardLayout professional={professional} />;
}