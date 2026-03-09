'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants/routes';
import { ServiceProviderCard } from '../services/ServiceProviderCard';
import { professionalService } from '@/lib/services/professionalService';
import type { Professional } from '@/types/auth';

export const ExploreServicesSection: React.FC = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setIsLoading(true);
        // Get featured professionals (top 6)
        const featured = await professionalService.getFeaturedProfessionals(6);
        setProfessionals(featured);
      } catch (error) {
        console.error('Error fetching professionals:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
              Featured Professionals
            </h2>
            <p className="text-lg text-gray-600">
              Discover top-rated professionals ready to help you with your needs.
            </p>
          </div>

          {/* Loading Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-100 rounded-2xl p-6 h-80 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (professionals.length === 0) {
    return (
      <section className="py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary mb-4">
            Featured Professionals
          </h2>
          <p className="text-gray-600">No professionals available yet. Check back soon!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-4">
            Explore Services
          </h2>
          <p className="text-sm lg:text-lg text-gray-600">
            Browse through our wide range of service categories and find the perfect professional for your needs.
          </p>
        </div>

        {/* Service Providers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-8 lg:mb-12">
          {professionals.map((professional) => (
              <ServiceProviderCard 
                key={professional.id} 
                professional={professional} 
              />
          ))}
        </div>

        {/* Browse All Button */}
        <div className="text-center">
          <Link href={ROUTES.SERVICES}>
            <Button 
              variant="primary" 
              size="lg"
              rightIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              Explore More Services
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};