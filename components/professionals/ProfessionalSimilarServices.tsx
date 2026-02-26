'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { professionalService } from '@/lib/services/professionalService';
import type { Professional } from '@/types/auth';
import { ServiceProviderCard } from '@/components/services/ServiceProviderCard';

interface ProfessionalSimilarServicesProps {
  categoryId: number;
  currentProfessionalId: number;
}

export const ProfessionalSimilarServices: React.FC<ProfessionalSimilarServicesProps> = ({
  categoryId,
  currentProfessionalId,
}) => {
  const [similarProfessionals, setSimilarProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        setIsLoading(true);
        const similar = await professionalService.getSimilarProfessionals(
          categoryId,
          currentProfessionalId,
          3
        );
        setSimilarProfessionals(similar);
      } catch (error) {
        console.error('Error fetching similar professionals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilar();
  }, [categoryId, currentProfessionalId]);

  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-primary mb-6">
          You May Be Interested In
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (similarProfessionals.length === 0) {
    return null;
  }
  return (
    <section className="py-12 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-10 text-secondary">You May Be Interested In</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {similarProfessionals.map((professional) => (
          <ServiceProviderCard key={professional.id} professional={professional} />
        ))}
      </div>
    </section>
  );
};