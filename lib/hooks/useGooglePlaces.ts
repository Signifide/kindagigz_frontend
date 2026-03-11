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

// ─── Africa/Kenya bias constants ──────────────────────────────────────────────
// Centre point: Nairobi, Kenya
const BIAS_LAT    = -1.2921;
const BIAS_LNG    = 36.8219;
// 4 500 km radius covers the entire African continent comfortably
const BIAS_RADIUS = 4_500_000; // metres
// CLDR region code — biases name disambiguation toward Kenya
const BIAS_REGION = 'ke';

// Module-level promise so the script is only injected once across all component mounts
let googleMapsLoadPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleMapsLoadPromise) return googleMapsLoadPromise;

  googleMapsLoadPromise = new Promise((resolve, reject) => {
    // If already loaded (e.g. Next.js hot reload), resolve immediately
    if (typeof window === 'undefined') { reject(new Error('SSR')); return; }
    if (window.google?.maps?.places)  { resolve(); return; }

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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

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

        // Bias centre point (Nairobi)
        const biasCentre = new window.google.maps.LatLng(BIAS_LAT, BIAS_LNG);

        autocompleteServiceRef.current!.getPlacePredictions(
          {
            input,
            sessionToken: sessionTokenRef.current ?? undefined,

            // ── Three complementary bias signals ─────────────────────────
            //
            // 1. Point + radius — Google strongly favours results inside
            //    the 4 500 km circle centred on Nairobi (covers all Africa)
            location: biasCentre,
            radius: BIAS_RADIUS,
            //
            // 2. Origin — Google ranks by distance from this point, so
            //    Nairobi results score much better than Dubai results
            origin: biasCentre,
            //
            // 3. Region code — biases name disambiguation toward Kenya
            region: BIAS_REGION,
            // ─────────────────────────────────────────────────────────────
          },
          (results, status) => {
            setLoading(false);

            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              results
            ) {
              setPredictions(
                results.map((r) => ({
                  place_id:       r.place_id,
                  main_text:      r.structured_formatting.main_text,
                  secondary_text: r.structured_formatting.secondary_text || '',
                  description:    r.description,
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
              const rawLat = place.geometry?.location?.lat() ?? 0;
              const rawLng = place.geometry?.location?.lng() ?? 0;
              
              const latitude  = parseFloat(rawLat.toFixed(6));
              const longitude = parseFloat(rawLng.toFixed(6));

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
                latitude,
                longitude,
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

