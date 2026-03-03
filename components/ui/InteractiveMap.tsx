'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGooglePlaces } from '@/lib/hooks/useGooglePlaces';

interface MapMarker {
  id: number | string;
  lat: number;
  lng: number;
  icon?: string;
  data: any;
}

interface InteractiveMapProps {
  markers: MapMarker[];
  center?: { lat: number; lng: number };
  onMarkerClick: (marker: MapMarker) => void;
  selectedId?: number | string | null;
  renderInfoWindow?: (marker: MapMarker) => React.ReactNode;
  onCloseInfoWindow?: () => void;
  height?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  markers,
  center,
  onMarkerClick,
  selectedId,
  renderInfoWindow,
  onCloseInfoWindow,
  height = "500px"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMap = useRef<google.maps.Map | null>(null);
  const mapMarkers = useRef<Record<string, google.maps.Marker>>({});
  const infoWindow = useRef<google.maps.InfoWindow | null>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Use your existing hook to check if the Google script is loaded
  const { isReady } = useGooglePlaces();

  // 1. Initialize Map
  useEffect(() => {
    if (isReady && mapRef.current && !googleMap.current) {
      const defaultCenter = center || { lat: -1.2921, lng: 36.8219 };
      
      googleMap.current = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        disableDefaultUI: false,
        clickableIcons: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
        ]
      });

      infoWindow.current = new google.maps.InfoWindow();
      
      // Close state when InfoWindow is closed manually
      infoWindow.current.addListener('closeclick', () => {
        onCloseInfoWindow?.();
      });

      setIsMapInitialized(true);
    }
  }, [isReady, center]);

  // 2. Synchronize Markers
  useEffect(() => {
    if (!isMapInitialized || !googleMap.current) return;

    // Remove old markers that aren't in the new list
    Object.keys(mapMarkers.current).forEach((id) => {
      if (!markers.find((m) => String(m.id) === id)) {
        mapMarkers.current[id].setMap(null);
        delete mapMarkers.current[id];
      }
    });

    // Add or update markers
    markers.forEach((markerData) => {
      const markerId = String(markerData.id);
      
      if (!mapMarkers.current[markerId]) {
        const marker = new google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map: googleMap.current,
          title: markerId,
          icon: markerData.icon ? {
            url: markerData.icon,
            scaledSize: new google.maps.Size(42, 42),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(21, 21),
          } : undefined
        });

        marker.addListener('click', () => onMarkerClick(markerData));
        mapMarkers.current[markerId] = marker;
      }
    });
  }, [markers, isMapInitialized]);

  // 3. Handle External Selection (InfoWindow)
  useEffect(() => {
    if (selectedId && mapMarkers.current[String(selectedId)] && infoWindow.current) {
      const marker = mapMarkers.current[String(selectedId)];
      const contentString = `<div id="info-window-portal"></div>`;
      
      infoWindow.current.setContent(contentString);
      infoWindow.current.open(googleMap.current, marker);
    } else if (!selectedId && infoWindow.current) {
      infoWindow.current.close();
    }
  }, [selectedId]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Since InfoWindow is inside the Google Map canvas, we use a 
         "Portal" technique to render your React components inside the InfoWindow 
      */}
      {selectedId && renderInfoWindow && (
        <InfoWindowPortal>
          {renderInfoWindow(markers.find(m => m.id === selectedId)!)}
        </InfoWindowPortal>
      )}
    </div>
  );
};

/**
 * Helper component to teleport React content into the Google Maps InfoWindow div
 */
const InfoWindowPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const node = document.getElementById('info-window-portal');
      if (node) {
        setPortalNode(node);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  if (!portalNode) return null;
  return (
    <div className="react-info-window-content">
      {children}
    </div>
  );
};