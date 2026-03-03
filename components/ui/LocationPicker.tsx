/**
 * components/ui/LocationPicker.tsx
 *
 * A polished autocomplete location input powered by Google Places API.
 * When the user selects a prediction, this component resolves the full
 * place details (including latitude and longitude) and calls the
 * onLocationSelect callback with the complete location data.
 *
 * Props:
 *   value           — controlled display value (the formatted address string)
 *   onLocationSelect — called with full PlaceDetails when user selects a place
 *   error           — validation error string from the parent form
 *   placeholder     — optional input placeholder text
 *   required        — whether the field is required
 *   disabled        — whether the input is disabled
 */

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { useGooglePlaces, type PlaceDetails } from '@/lib/hooks/useGooglePlaces';
import { MapPinIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MapPinIcon as MapPinSolid } from '@heroicons/react/24/solid';

export interface LocationPickerProps {
  value: string;
  onLocationSelect: (details: PlaceDetails) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  label?: string;
}

export function LocationPicker({
  value,
  onLocationSelect,
  error,
  placeholder = 'e.g. Galleria Mall, Ngong Road, ABC Place…',
  required = false,
  disabled = false,
  label = 'Business Location',
}: LocationPickerProps) {
  const inputId = useId();
  const listboxId = useId();

  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isResolvingDetails, setIsResolvingDetails] = useState(false);
  const [hasSelection, setHasSelection] = useState(!!value);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isReady,
    predictions,
    loading: isPredicting,
    error: placesError,
    fetchPredictions,
    fetchPlaceDetails,
    clearPredictions,
  } = useGooglePlaces();

  // Keep local input value in sync with controlled `value` prop
  useEffect(() => {
    setInputValue(value);
    setHasSelection(!!value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      setHasSelection(false); // user is typing again, clear previous selection

      if (val.length >= 2 && isReady) {
        fetchPredictions(val);
        setIsOpen(true);
      } else {
        clearPredictions();
        setIsOpen(false);
      }
      setActiveIndex(-1);
    },
    [isReady, fetchPredictions, clearPredictions]
  );

  const handleSelect = useCallback(
    async (placeId: string, description: string, mainText: string) => {
      setInputValue(description);
      setIsOpen(false);
      clearPredictions();
      setActiveIndex(-1);
      setIsResolvingDetails(true);

      try {
        const details = await fetchPlaceDetails(placeId);
        setHasSelection(true);
        onLocationSelect(details);
      } catch {
        // Fallback: provide what we know without coordinates
        onLocationSelect({
          place_id: placeId,
          place_name: mainText,
          address: description,
          latitude: 0,
          longitude: 0,
          city: '',
          country: '',
        });
      } finally {
        setIsResolvingDetails(false);
      }
    },
    [fetchPlaceDetails, onLocationSelect, clearPredictions]
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    setHasSelection(false);
    clearPredictions();
    setIsOpen(false);
    inputRef.current?.focus();
    // Notify parent that location was cleared
    onLocationSelect({
      place_id: '',
      place_name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      city: '',
      country: '',
    });
  }, [clearPredictions, onLocationSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || predictions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, predictions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && predictions[activeIndex]) {
            const p = predictions[activeIndex];
            handleSelect(p.place_id, p.description, p.main_text);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setActiveIndex(-1);
          break;
      }
    },
    [isOpen, predictions, activeIndex, handleSelect]
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  const isBusy = isPredicting || isResolvingDetails;
  const showDropdown = isOpen && predictions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Label */}
      <label
        htmlFor={inputId}
        className="block text-sm font-semibold text-primary mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input wrapper */}
      <div
        className={[
          'relative flex items-center rounded-lg border-2 transition-colors bg-white',
          error
            ? 'border-red-400 focus-within:border-red-500'
            : hasSelection
            ? 'border-green-400 focus-within:border-green-500'
            : 'border-card-border focus-within:border-primary',
          disabled ? 'opacity-60 cursor-not-allowed' : '',
        ].join(' ')}
      >
        {/* Left icon */}
        <span className="pl-3 shrink-0 text-gray-400">
          {hasSelection ? (
            <MapPinSolid className="w-5 h-5 text-green-500" />
          ) : (
            <MapPinIcon className="w-5 h-5" />
          )}
        </span>

        {/* Input */}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showDropdown}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
          }}
          disabled={disabled || !isReady}
          placeholder={!isReady ? 'Loading location search…' : placeholder}
          className="flex-1 px-3 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400 disabled:cursor-not-allowed"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Right: loading spinner or clear button */}
        <span className="pr-3 shrink-0">
          {isBusy ? (
            <svg
              className="w-4 h-4 animate-spin text-primary"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : inputValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
              aria-label="Clear location"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          ) : (
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-300" />
          )}
        </span>
      </div>

      {/* Dropdown predictions */}
      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Location suggestions"
          className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-card-border shadow-lg overflow-hidden max-h-64 overflow-y-auto"
        >
          {predictions.map((prediction, index) => (
            <li
              key={prediction.place_id}
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={[
                'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors text-sm',
                index === activeIndex
                  ? 'bg-primary/5 text-primary'
                  : 'hover:bg-gray-50 text-gray-700',
                index < predictions.length - 1 ? 'border-b border-gray-100' : '',
              ].join(' ')}
              onMouseDown={(e) => {
                // Use mousedown instead of click to fire before onBlur
                e.preventDefault();
                handleSelect(
                  prediction.place_id,
                  prediction.description,
                  prediction.main_text
                );
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <MapPinIcon className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate">{prediction.main_text}</p>
                {prediction.secondary_text && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {prediction.secondary_text}
                  </p>
                )}
              </div>
            </li>
          ))}

          {/* Google attribution — required by Google Maps ToS */}
          <li className="px-4 py-2 flex justify-end border-t border-gray-100 pointer-events-none">
            <img
              src="https://maps.gstatic.com/mapfiles/api-3/images/powered-by-google-on-white3.png"
              alt="Powered by Google"
              className="h-4 opacity-60"
            />
          </li>
        </ul>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Success hint */}
      {/* {hasSelection && !error && (
        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
          <span>✓</span> Location confirmed with coordinates
        </p>
      )} */}

      {/* Places API load error */}
      {placesError && (
        <p className="mt-1.5 text-xs text-amber-600">
          ⚠ {placesError} — you can still type your address manually.
        </p>
      )}
    </div>
  );
}