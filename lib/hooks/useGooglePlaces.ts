/**
 *
 * Dynamically loads the Google Maps JavaScript API (Places library) once and
 * exposes an autocomplete function that returns place predictions with their
 * human-readable name, formatted address, latitude, and longitude.
 *
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface PlacePrediction {
  place_id: string;
  /** Short label shown in the dropdown (e.g. "Galleria Mall") */
  main_text: string;
  /** Full human-readable address (e.g. "Galleria Mall, Ngong Road, Nairobi, Kenya") */
  secondary_text: string;
  description: string;
}

export interface PlaceDetails {
  place_id: string;
  place_name: string;
  address: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

// Module-level promise so the script is only injected once across all component mounts
let googleMapsLoadPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    // If already loaded (e.g. Next.js hot reload), resolve immediately
    if (typeof window !== 'undefined' && window.google?.maps?.places) {
      resolve();
      return;
    }

    const callbackName = '__googleMapsCallback__';
    (window as any)[callbackName] = () => resolve();

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });

  return googleMapsLoadPromise;
}

export function useGooglePlaces() {
  const [isReady, setIsReady] = useState(false);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  console.log("API KEY:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  console.log("API KEY 2:", apiKey);


  useEffect(() => {
    if (!apiKey) {
      setError('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set.');
      return;
    }

    loadGoogleMapsScript(apiKey)
      .then(() => {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();

        // PlacesService requires a DOM element or map instance — we use a hidden div
        const dummyEl = document.createElement('div');
        placesServiceRef.current = new window.google.maps.places.PlacesService(dummyEl);

        // New session token per mount
        sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();

        setIsReady(true);
      })
      .catch(() => {
        setError('Could not load Google Maps. Check your API key and network connection.');
      });
  }, [apiKey]);

  /**
   * Fetch autocomplete predictions for the given input string.
   * Debounced by 300ms to avoid hammering the API on every keystroke.
   */
  const fetchPredictions = useCallback(
    (input: string) => {
      if (!isReady || !autocompleteServiceRef.current) return;

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      if (!input.trim()) {
        setPredictions([]);
        return;
      }

      debounceTimer.current = setTimeout(() => {
        setLoading(true);
        autocompleteServiceRef.current!.getPlacePredictions(
          {
            input,
            sessionToken: sessionTokenRef.current ?? undefined,
            // Bias towards Africa; omit `componentRestrictions` to allow any country
            // but prioritise the African continent via location bias
            locationBias: new window.google.maps.LatLngBounds(
              new window.google.maps.LatLng(-35, -20), // SW corner of Africa
              new window.google.maps.LatLng(38, 55),   // NE corner of Africa
            ),
          },
          (results, status) => {
            setLoading(false);
            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              results
            ) {
              setPredictions(
                results.map((r) => ({
                  place_id: r.place_id,
                  main_text: r.structured_formatting.main_text,
                  secondary_text: r.structured_formatting.secondary_text || '',
                  description: r.description,
                }))
              );
            } else {
              setPredictions([]);
            }
          }
        );
      }, 300);
    },
    [isReady]
  );

  /**
   * Fetch full place details (including lat/lng) for a selected prediction.
   * Uses a session token to batch the autocomplete + details call for billing efficiency.
   */
  const fetchPlaceDetails = useCallback(
    (placeId: string): Promise<PlaceDetails> => {
      return new Promise((resolve, reject) => {
        if (!isReady || !placesServiceRef.current) {
          reject(new Error('Places service not ready'));
          return;
        }

        placesServiceRef.current!.getDetails(
          {
            placeId,
            fields: ['place_id', 'name', 'formatted_address', 'geometry', 'address_components'],
            sessionToken: sessionTokenRef.current ?? undefined,
          },
          (place, status) => {
            // Rotate session token after a getDetails call (billing best practice)
            sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();

            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
              const lat = place.geometry?.location?.lat() ?? 0;
              const lng = place.geometry?.location?.lng() ?? 0;

              // Extract city and country from address_components
              let city = '';
              let country = '';

              place.address_components?.forEach((component) => {
                if (component.types.includes('locality')) {
                  city = component.long_name;
                } else if (component.types.includes('administrative_area_level_1') && !city) {
                  city = component.long_name;
                }
                if (component.types.includes('country')) {
                  country = component.long_name;
                }
              });

              resolve({
                place_id: placeId,
                place_name: place.name || '',
                address: place.formatted_address || '',
                latitude: lat,
                longitude: lng,
                city,
                country,
              });
            } else {
              reject(new Error(`Place details failed: ${status}`));
            }
          }
        );
      });
    },
    [isReady]
  );

  const clearPredictions = useCallback(() => setPredictions([]), []);

  return {
    isReady,
    predictions,
    loading,
    error,
    fetchPredictions,
    fetchPlaceDetails,
    clearPredictions,
  };
}

