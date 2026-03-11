import React from 'react';
import { ServiceProviderCard } from './ServiceProviderCard';
import { Professional } from '@/types/auth';
import { cn } from '@/lib/utils/cn';

interface ServicesListProps {
  professionals: Professional[];
  visibleCount: number;
  onLoadMore: () => void;
  isLoading: boolean;
  showMapView: boolean;
  onClearFilters: () => void;
}

export const ServicesList: React.FC<ServicesListProps> = ({ 
  professionals, 
  visibleCount,
  onLoadMore,
  isLoading,
  showMapView, 
  onClearFilters
}) => {
  const displayedProfessionals = professionals.slice(0, visibleCount);
  const hasMore = professionals.length > visibleCount;

  if (isLoading) {
    return (
      <div className={cn(
        "grid gap-6",
        showMapView ? "grid-cols-2 xl:grid-cols-2" : "grid-cols-2 md:grid-cols-2 xl:grid-cols-3"
      )}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  if (professionals.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-2xl md:text-4xl lg:text-6xl mb-4">🔍</div>
        <h3 className="md:text-xl font-bold text-gray-900 mb-2">No professionals found</h3>
        <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
        <button 
          onClick={onClearFilters} 
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className={cn(
        "grid gap-6",
        showMapView ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      )}>
        {displayedProfessionals.map((professional) => (
          <ServiceProviderCard key={professional.id} professional={professional} />
        ))}
      </div>
      
      {hasMore && (
        <div className="text-center md:pt-8">
          <button 
            onClick={onLoadMore}
            className="text-sm px-8 py-3 border-2 border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all font-bold shadow-sm"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};