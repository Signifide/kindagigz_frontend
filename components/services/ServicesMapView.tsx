'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InteractiveMap } from '../map/InteractiveMap';
import type { Professional } from '@/types/auth';

interface ServicesMapViewProps {
  professionals: Professional[];
  onClose: () => void;
}

export const ServicesMapView: React.FC<ServicesMapViewProps> = ({ 
  professionals,
  onClose 
}) => {
  const router = useRouter();
  const [selectedProfId, setSelectedProfId] = useState<number | null>(null);

  // Transform Professional data into Map Markers
  const mapMarkers = professionals
    .filter(p => p.latitude && p.longitude)
    .map(p => ({
      id: p.id,
      lat: parseFloat(p.latitude!),
      lng: parseFloat(p.longitude!),
      icon: p.logo || p.user.profile_image || '/default-avatar.png', 
      data: p
    }));

  return (
    <div className="bg-white rounded-2xl p-4 sticky top-24 h-[600px] border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-primary">Map View</h3>
          <p className="text-xs text-gray-500">
            Showing {professionals.length} professional{professionals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close map"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1">
        <InteractiveMap
          height="520px"
          markers={mapMarkers}
          selectedId={selectedProfId}
          onMarkerClick={(marker) => setSelectedProfId(marker.id as number)}
          onCloseInfoWindow={() => setSelectedProfId(null)}
          renderInfoWindow={(marker) => {
            const prof = marker.data as Professional;
            return (
              <div 
                onClick={() => router.push(`/professionals/${prof.id}`)}
                className="min-w-[180px] p-1 cursor-pointer group"
              >
                <img 
                  src={prof.banner_image || '/api/placeholder/400/200'} 
                  className="w-full h-20 object-cover rounded-lg mb-2" 
                  alt=""
                />
                <h4 className="font-bold text-sm text-primary group-hover:text-secondary truncate">
                  {prof.business_name}
                </h4>
                <div className="flex items-center gap-1 mt-1 text-xs">
                  <span className="text-yellow-500">★</span>
                  <span className="font-bold">{parseFloat(prof.average_rating).toFixed(1)}</span>
                  <span className="text-gray-400">({prof.total_reviews})</span>
                </div>
                <button className="w-full mt-2 py-1.5 bg-primary text-white text-[10px] rounded-md font-bold uppercase tracking-wider group-hover:bg-secondary transition-colors">
                  View Profile
                </button>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
};