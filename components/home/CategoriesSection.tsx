'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { ROUTES } from '@/lib/constants/routes';
import { categoryService } from '@/lib/services/categoryService';
import { professionalService } from '@/lib/services/professionalService';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

export const CategoriesSection: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryProfCount, setCategoryProfCount] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories
        const categoriesData = await categoryService.getCategories();

        const profStats = await professionalService.getProfessionalStats();
        
        const countMap: Record<number, number> = {};
        categoriesData.forEach(cat => {
          countMap[cat.id] = profStats.byCategory[cat.name] || 0;
        });
        
        setCategoryProfCount(countMap);
        setCategories(categoriesData.slice(0, 8)); // Show first 8
      } catch (error) {
        // console.error('Error fetching categories:', error);
        toast.error('Error fetching categories')
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 lg:py-20 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4">
              Explore Categories
            </h2>
            <p className="text-sm lg:text-lg text-white/80">
              Browse through our wide range of service categories and find the perfect professional for your needs.
            </p>
          </div>

          {/* Loading Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 h-40 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 md:py-20 lg:py-24 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/70">No categories available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4">
            Explore Categories
          </h2>
          <p className="text-sm lg:text-lg text-white/80">
            Browse through our wide range of service categories and find the perfect professional for your needs.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 mb-10">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`${ROUTES.SERVICES}?tab=categories&category=${category.slug}`}
            >
              <Card
                variant="purple-border"
                hoverable
                className="group h-full relative"
              >
                {/* Icon */}
                <div className="text-2xl lg:text-4xl mb-1 lg:mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>

                {/* Category Name */}
                <CardTitle variant="light" className="text-xs md:text-md lg:text-lg mb-1 group-hover:text-secondary transition-colors">
                  {category.name}
                </CardTitle>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-6 h-6 text-secondary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Browse All Button */}
        <div className="text-center text-xs md:text-md lg:text-lg">
          <Link href={`${ROUTES.SERVICES}?tab=categories`}>
            <Button 
              variant="primary" 
              size="md"
              rightIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              Browse All Categories
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};