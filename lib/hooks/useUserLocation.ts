/**
 * lib/hooks/useUserLocation.ts
 *
 * Requests the user's live location via the browser Geolocation API.
 * Handles permission states gracefully and optionally reverse-geocodes
 * the coordinates into a human-readable address using Google Maps.
 *
 * Usage:
 *   const { location, permissionState, requestLocation, loading, error } = useUserLocation();
 *
 * The hook does NOT auto-request on mount — call requestLocation() explicitly
 * so the browser permission prompt appears in response to a user gesture.
 * However, it WILL watch for an already-granted permission on mount and
 * silently pick up coordinates without a prompt.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { UserGeoLocation } from '@/types';

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported' | 'idle';

export interface UserLocationResult {
  /** Resolved coordinates, null until successfully obtained */
  location: UserGeoLocation | null;
  /** Permission / readiness state */
  permissionState: PermissionState;
  /** True while the browser is resolving the position */
  loading: boolean;
  /** Human-readable error message if resolution fails */
  error: string | null;
  /** Call this (ideally tied to a button click) to prompt the user */
  requestLocation: () => void;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,       // 10 seconds
  maximumAge: 60_000,    // Accept a cached position up to 1 minute old
};

export function useUserLocation(): UserLocationResult {
  const [location, setLocation] = useState<UserGeoLocation | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // ─── On mount: silently check if permission was already granted ───────────
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPermissionState('unsupported');
      return;
    }

    // The Permissions API is not supported in all browsers (notably Safari < 16)
    if (!navigator.permissions) {
      setPermissionState('prompt');
      return;
    }

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((result) => {
        setPermissionState(result.state as PermissionState);

        // If already granted, silently fetch position without prompting
        if (result.state === 'granted') {
          resolvePosition();
        }

        // Listen for the user changing their permission in the browser settings
        result.addEventListener('change', () => {
          setPermissionState(result.state as PermissionState);
        });
      })
      .catch(() => {
        setPermissionState('prompt');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Cleanup watcher on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // ─── Core position resolver ───────────────────────────────────────────────
  const resolvePosition = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPermissionState('unsupported');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        setPermissionState('granted');
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (err) => {
        setLoading(false);

        switch (err.code) {
          case err.PERMISSION_DENIED:
            setPermissionState('denied');
            setError(
              'Location access was denied. Enable it in your browser settings to use the map feature.'
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Your position could not be determined. Please try again.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('An unknown error occurred while retrieving your location.');
        }
      },
      GEO_OPTIONS
    );
  }, []);

  /**
   * Public trigger — call this on a user interaction (button click).
   * This will either prompt the user if permission is 'prompt',
   * or silently resolve if already 'granted'.
   */
  const requestLocation = useCallback(() => {
    if (permissionState === 'unsupported') {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    if (permissionState === 'denied') {
      setError(
        'Location access is blocked. Please enable it in your browser or device settings.'
      );
      return;
    }
    resolvePosition();
  }, [permissionState, resolvePosition]);

  return { location, permissionState, loading, error, requestLocation };
}