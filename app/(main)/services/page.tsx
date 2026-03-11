'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { FiltersPanel } from '@/components/services/FilterPanel';
import { ServicesList } from '@/components/services/ServicesList';
import { ServicesMapView } from '@/components/services/ServicesMapView';
import { Professional } from '@/types/auth';
import { professionalService } from '@/lib/services/professionalService';
import { getDistanceKm } from '@/lib/utils/location';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const [showMapView, setShowMapView] = useState(false);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeFilters, setActiveFilters] = useState<{
    keywords?: string;
    category?: string;
    lat?: number | null,
    lng?: number | null,
    proximity?: number;
    minRating?: number;
    priceRange?: [number, number];
  }>({});

  // Fetch professionals on mount
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setIsLoading(true);
        const data = await professionalService.getProfessionals();
        setProfessionals(data);
        setFilteredProfessionals(data);
      } catch (error) {
        // console.error('Error fetching professionals:', error);
        toast.error('Error fetching available service providers');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = [...professionals];

    // 1. Keyword Search (Name or Service)
    if (activeFilters.keywords) {
      const query = activeFilters.keywords.toLowerCase().trim();
      
      filtered = filtered.filter(prof => {
        // Human Name checks (nested in user object)
        const firstName = prof.user?.first_name?.toLowerCase() || '';
        const lastName = prof.user?.last_name?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`;

        // Business Info checks
        const bizName = prof.business_name?.toLowerCase() || '';
        const tagline = prof.tagline?.toLowerCase() || '';
        const aboutText = prof.about?.toLowerCase() || '';

        // Services check (matching the name of any service they offer)
        const serviceMatch = prof.services?.some(s => 
          s.name.toLowerCase().includes(query) || 
          s.category_name?.toLowerCase().includes(query)
        );

        return (
          bizName.includes(query) ||
          fullName.includes(query) ||
          tagline.includes(query) ||
          aboutText.includes(query) ||
          serviceMatch
        );
      });
    }

    // 2. Category Filter
    if (activeFilters.category) {
      filtered = filtered.filter(prof => 
        prof.category.slug === activeFilters.category
      );
    }

    // 3. Proximity & Location Logic
    if (activeFilters.lat && activeFilters.lng) {
      filtered = filtered.filter(prof => {
        if (!prof.latitude || !prof.longitude) return false;
        
        const distance = getDistanceKm(
          activeFilters.lat!, 
          activeFilters.lng!, 
          parseFloat(prof.latitude), 
          parseFloat(prof.longitude)
        );

        prof.distance_km = distance; 

        return distance <= (activeFilters.proximity || 25);
      });

      // Sort by nearest
      filtered.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    }

    setFilteredProfessionals(filtered);
    setVisibleCount(6);
  }, [activeFilters, professionals]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden sticky top-0 z-30 bg-primary/95 backdrop-blur-sm px-4 py-3 border-b border-white/10 flex justify-between items-center">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-transform"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Filters {Object.keys(activeFilters).length > 0 && `(${Object.keys(activeFilters).length})`}
        </button>
        
        <button 
          onClick={() => setShowMapView(!showMapView)}
          className="px-4 py-2 bg-white/10 text-white text-sm border border-secondary rounded-full"
        >
          {showMapView ? 'List View' : 'Map View'}
        </button>
      </div>

      <main className="max-w-full mx-auto px-4 lg:px-8 py-8 pt-4 md:pt-16">
        <header className="mb-8 hidden lg:block">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">Explore Services</h1>
          <p className="text-white/70 text-sm md:text-lg">
            {isLoading 
              ? 'Loading professionals...' 
              : `Connecting you with ${filteredProfessionals.length} verified experts.`
            }
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Responsive Filters Panel Wrapper */}
         
          <div 
            className={cn(
              "fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity duration-300",
              isFilterOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
            onClick={() => setIsFilterOpen(false)}
          />
          {/* Filters */}
          <aside className={cn(
            "lg:col-span-3 transition-all duration-300 ease-in-out z-50",
            // Mobile Styles
            "fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white p-4 lg:static lg:bg-transparent lg:p-0 lg:w-auto rounded-tr-2xl rounded-br-2xl",
            isFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}>
            <div className="flex items-center justify-between mb-6 lg:hidden">
              <h3 className="text-xl font-bold text-primary">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 text-gray-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FiltersPanel 
              onFilterChange={(filters) => {
                setActiveFilters(filters);
              }} 
              onShowMap={() => setShowMapView(!showMapView)} 
              showMapView={showMapView} 
              professionals={professionals}
            />
          </aside>

          {/* Results */}
          <section className={cn(
            "transition-all duration-500",
            showMapView ? 'lg:col-span-5' : 'lg:col-span-9'
          )}>
            <div className="bg-white rounded-3xl p-6 shadow-xl min-h-175">
              <div className="flex items-center justify-between mb-4 lg:mb-8 pb-4 border-b border-gray-100">
                <h2 className="text-lg md:text-2xl font-bold text-primary">
                  Results {!isLoading && `(${filteredProfessionals.length})`}
                </h2>
              </div>

              <ServicesList 
                professionals={filteredProfessionals}
                visibleCount={visibleCount}
                onLoadMore={handleLoadMore}
                isLoading={isLoading} 
                showMapView={showMapView} 
                onClearFilters={() => setActiveFilters({})} 
              />
            </div>
          </section>

          {/* Map View */}
          {showMapView && (
            <aside className="fixed inset-0 lg:relative lg:inset-auto lg:col-span-4 z-20">
              <ServicesMapView 
                professionals={filteredProfessionals}
                onClose={() => setShowMapView(false)} 
              />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}