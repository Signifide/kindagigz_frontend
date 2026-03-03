'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '../ui/LocationPicker';
import type { Professional } from '@/types/auth';
import type { Category } from '@/types';
import type { PlaceDetails } from '@/lib/hooks/useGooglePlaces';
import { toast } from 'react-hot-toast';

interface FiltersPanelProps {
  onFilterChange: (filters: any) => void;
  onShowMap: () => void;
  showMapView: boolean;
  professionals: Professional[];
}

export const FiltersPanel: React.FC<FiltersPanelProps> = ({ 
  onFilterChange, 
  onShowMap,
  showMapView,
  professionals 
}) => {
  const [activeTab, setActiveTab] = useState<'filters' | 'categories'>('filters');
  const [filters, setFilters] = useState({
    keywords: '',
    category: '',
    address: '',
    lat: null as number | null,
    lng: null as number | null,
    proximity: 10, // Default km
    price_range: [0, 100000] as [number, number],
    rating: 0,
    availability: 'all' as 'all' | 'available',
  });

  // Extract unique categories from professionals
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Get unique categories from professionals
    const uniqueCategories = professionals.reduce((acc, prof) => {
      const exists = acc.find(cat => cat.id === prof.category.id);
      if (!exists) {
        acc.push(prof.category);
      }
      return acc;
    }, [] as Category[]);

    setCategories(uniqueCategories);
  }, [professionals]);

  const handleLocationSelect = (details: PlaceDetails) => {
    const newFilters = { 
      ...filters, 
      address: details.address,
      lat: details.latitude,
      lng: details.longitude 
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const loadingToast = toast.loading("Fetching your location...");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss(loadingToast);
        const { latitude, longitude } = position.coords;
        const newFilters = { 
          ...filters, 
          address: 'Current Location', 
          lat: latitude, 
          lng: longitude 
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
        toast.success("Location updated!");
      },
      (error) => {
        toast.dismiss(loadingToast);
        let message = "An unknown error occurred while fetching location.";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please enable it in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "The request to get user location timed out.";
            break;
        }
        toast.error(message);
        console.error("Geolocation Error:", error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Get professional count per category
  const getCategoryCount = (categoryId: number) => {
    return professionals.filter(prof => prof.category.id === categoryId).length;
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      keywords: '',
      category: '',
      address: '',
      lat: null as number | null,
      lng: null as number | null,
      proximity: 10,
      price_range: [0, 100000] as [number, number],
      rating: 0,
      availability: 'all' as 'all' | 'available',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Card variant="default" padding="lg" className="sticky top-24">
      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
            activeTab === 'filters'
              ? 'bg-secondary text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Filters
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
            activeTab === 'categories'
              ? 'bg-secondary text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Categories
        </button>
      </div>

      {activeTab === 'filters' ? (
        <div className="space-y-6">
          {/* Keywords Search */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              What are you looking for?
            </label>
            <input
              type="text"
              value={filters.keywords}
              onChange={(e) => handleFilterChange('keywords', e.target.value)}
              placeholder="e.g., plumber, electrician..."
              className="w-full px-4 py-2 rounded-lg border-2 border-card-border focus:border-primary focus:outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border-2 border-card-border focus:border-primary focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.icon} {cat.name} ({getCategoryCount(cat.id)})
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <div className="">
              <LocationPicker
                label="Where to look"
                value={filters.address}
                onLocationSelect={handleLocationSelect}
                placeholder="Search city or area..."
              />
              <Button
                className="mt-6"
                variant="outline"
                size="sm"
                title='Use My Location'
                onClick={handleLiveLocation}
              >
                📍Use My Location
              </Button>
            </div>
          </div>

          {/* Proximity */}
          {filters.lat && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-semibold text-primary mb-2">
                Proximity: {filters.proximity} km
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={filters.proximity}
                onChange={(e) => handleFilterChange('proximity', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1km</span>
                <span>100km</span>
              </div>
            </div>
          )}

          {/* Price Range */}
          {/* <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Price Range (KES)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={filters.price_range[0]}
                onChange={(e) => handleFilterChange('price_range', [parseInt(e.target.value), filters.price_range[1]])}
                placeholder="Min"
                className="px-4 py-2 rounded-lg border-2 border-card-border focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                value={filters.price_range[1]}
                onChange={(e) => handleFilterChange('price_range', [filters.price_range[0], parseInt(e.target.value)])}
                placeholder="Max"
                className="px-4 py-2 rounded-lg border-2 border-card-border focus:border-primary focus:outline-none"
              />
            </div>
          </div> */}

          {/* Rating */}
          {/* <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Minimum Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleFilterChange('rating', rating)}
                  className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                    filters.rating === rating
                      ? 'border-secondary bg-secondary/10 text-primary font-semibold'
                      : 'border-card-border hover:border-secondary/50'
                  }`}
                >
                  {rating}⭐
                </button>
              ))}
            </div>
          </div> */}

          {/* Availability */}
          {/* <div>
            <label className="block text-sm font-semibold text-primary mb-2">
              Availability
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange('availability', 'all')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  filters.availability === 'all'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-card-border hover:border-primary/50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleFilterChange('availability', 'available')}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                  filters.availability === 'available'
                    ? 'border-primary bg-primary/5 text-primary font-semibold'
                    : 'border-card-border hover:border-primary/50'
                }`}
              >
                🟢 Available Now
              </button>
            </div>
          </div> */}

          {/* Action Buttons */}
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleSearch}
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={handleReset}
            >
              Reset Filters
            </Button>
            <Button
              variant="tertiary"
              size="md"
              className="w-full"
              onClick={onShowMap}
            >
              {showMapView ? '📋 Hide Map' : '🗺️ Show on Map'}
            </Button>
          </div>
        </div>
      ) : (
        // Categories Tab
        <div className="space-y-3">
          {categories.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No categories available
            </p>
          ) : (
            categories.map((category) => {
              const count = getCategoryCount(category.id);
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    handleFilterChange('category', category.slug);
                    setActiveTab('filters');
                  }}
                  className="w-full p-4 rounded-lg border-2 border-card-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform">
                      {category.icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-primary">{category.name}</div>
                      <div className="text-sm text-gray-600">
                        {count} professional{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </Card>
  );
};