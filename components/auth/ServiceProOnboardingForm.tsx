'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LocationPicker } from '../ui/LocationPicker';
import { categoryService } from '@/lib/services/categoryService';
import { MultiSelect } from '../ui/MultiSelect';
import type { RegisterData, ServiceProOnboardingData } from '@/types/auth';
import type { PlaceDetails } from '@/lib/hooks/useGooglePlaces';
import type { Category, Service } from '@/types';
import toast from 'react-hot-toast';

interface ServiceProOnboardingFormProps {
  basicData: RegisterData;
  onBack: () => void;
  onComplete: (data: ServiceProOnboardingData) => void;
}

function roundCoord(value: number | null | undefined): number | null {
  if (value === null || value === undefined || value === 0) return null;
  return parseFloat(value.toFixed(6));
}

export function ServiceProOnboardingForm({
  basicData,
  onBack,
  onComplete,
}: ServiceProOnboardingFormProps) {
  const [formData, setFormData] = useState<ServiceProOnboardingData>({
    business_name: '',
    about: '',
    tagline: '',
    category_id: 0,
    service_ids: [],
    location_name: '',
    address: basicData.city || '',
    latitude: null,
    longitude: null,
    service_radius_km: 10,
    languages: ['English'],
    agreeToTerms: false,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Fetch categories and ALL services once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await categoryService.getCategories(); 
        
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        } else {
          // console.error('Categories data is not an array:', categoriesData);
          toast.error('Choose a valid Category')
          setCategories([]);
        }
        setIsLoadingCategories(false);

        // Fetch ALL services at once
        setIsLoadingServices(true);
        const servicesData = await categoryService.getServices();
        
        if (Array.isArray(servicesData)) {
          setAllServices(servicesData);
        } else {
          // console.error('Services data is not an array:', servicesData);
          toast.error('Choose a valid Service')
          setAllServices([]);
        }
        setIsLoadingServices(false);
      } catch (error) {
        // console.error('Error fetching data:', error);
        setCategories([]);
        setAllServices([]); 
        setIsLoadingCategories(false);
        setIsLoadingServices(false);
      }
    };

    fetchData();
  }, []);

  // Filter services when category changes (client-side)
  useEffect(() => {
    if (formData.category_id > 0 && Array.isArray(allServices)) {
      const filtered = allServices.filter(
        service => service.category === formData.category_id
      );
      setFilteredServices(filtered);
      setFormData(prev => ({ ...prev, service_ids: [] }));
    } else {
      setFilteredServices([]);
    }
  }, [formData.category_id, allServices]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required';
    }

    if (!formData.about.trim()) {
      newErrors.about = 'Business description is required';
    }

    if (formData.about.length > 500) {
      newErrors.about = 'Description must be 500 characters or less';
    }

    if (formData.category_id === 0) {
      newErrors.category_id = 'Please select a category';
    }

    if (formData.service_ids.length === 0) {
      newErrors.service_ids = 'Please select at least 1 service';
    }

    if (formData.service_ids.length > 5) {
      newErrors.service_ids = 'Maximum 5 services allowed';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Business location is required — please select from the suggestions';
    }

    if (formData.latitude === null || formData.longitude === null) {
      newErrors.latitude =
        'Please select your location from the dropdown suggestions so we can pin your exact position on the map.';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstKey = Object.keys(newErrors)[0];
      document
        .getElementById(firstKey)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onComplete(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category_id' || name === 'service_radius_km' 
        ? parseInt(value) || 0 
        : value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleLocationSelect = (details: PlaceDetails) => {
    setFormData((prev) => ({
      ...prev,
      location_name: details.place_name,
      address: details.address,
      latitude:  roundCoord(details.latitude),
      longitude: roundCoord(details.longitude),
    }));

    if (errors.address) {
      setErrors((prev) => ({ ...prev, address: '', latitude: '' }));
    }
  };

  const handleServiceToggle = (serviceId: number) => {
    setFormData(prev => {
      const isSelected = prev.service_ids.includes(serviceId);
      
      if (isSelected) {
        // Remove service
        return {
          ...prev,
          service_ids: prev.service_ids.filter(id => id !== serviceId)
        };
      } else {
        // Add service (max 5)
        if (prev.service_ids.length >= 5) {
          setErrors(prev => ({
            ...prev,
            service_ids: 'Maximum 5 services allowed'
          }));
          return prev;
        }
        return {
          ...prev,
          service_ids: [...prev.service_ids, serviceId]
        };
      }
    });

    // Clear service error when user selects services
    if (errors.service_ids) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.service_ids;
        return newErrors;
      });
    }
  };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, logo: file }));
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, banner_image: file }));
    setBannerPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'banner_image') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [field]: 'File size must be less than 5MB'
        }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          [field]: 'File must be an image'
        }));
        return;
      }

      setFormData(prev => ({ ...prev, [field]: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'logo') {
          setLogoPreview(reader.result as string);
        } else {
          setBannerPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const selectedCategory = Array.isArray(categories) 
    ? categories.find(cat => cat.id === formData.category_id) 
    : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl md:text-3xl font-bold text-primary">Professional Details</h3>
        <p className="text-sm text-gray-600 mt-1">
          Tell us about your business and services
        </p>
      </div>

      {/* Business Name */}
      <div>
        <label htmlFor="business_name" className="block text-sm font-semibold text-primary mb-2">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="business_name"
          name="business_name"
          value={formData.business_name}
          onChange={handleChange}
          required
          className="text-sm md:text-md w-full px-4 py-3 rounded-lg border-2 border-card-border focus:border-primary focus:outline-none transition-colors"
          placeholder="e.g., John's Plumbing Services"
        />
        {errors.business_name && (
          <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
        )}
      </div>

      {/* Tagline */}
      <div>
        <label htmlFor="tagline" className="block text-sm font-semibold text-primary mb-2">
          Tagline <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <input
          type="text"
          id="tagline"
          name="tagline"
          value={formData.tagline}
          onChange={handleChange}
          maxLength={100}
          className="text-sm md:text-md w-full px-4 py-3 rounded-lg border-2 border-card-border focus:border-primary focus:outline-none transition-colors"
          placeholder="e.g., Quality plumbing services you can trust"
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.tagline?.length || 0}/100 characters
        </p>
      </div>

      {/* Category Selection */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-semibold text-primary mb-2">
          Service Category <span className="text-red-500">*</span>
        </label>
        {isLoadingCategories ? (
          <div className="text-sm md:text-md w-full px-4 py-3 rounded-lg border-2 border-card-border bg-gray-50 animate-pulse">
            <p className="text-gray-400">Loading categories...</p>
          </div>
        ) : !Array.isArray(categories) || categories.length === 0 ? (
          <div className="text-sm md:text-md w-full px-4 py-3 rounded-lg border-2 border-red-200 bg-red-50">
            <p className="text-red-600">Failed to load categories. Please refresh the page.</p>
          </div>
        ) : (
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            className="text-sm md:text-md w-full px-4 py-3 rounded-lg border-2 border-card-border focus:border-primary focus:outline-none transition-colors bg-white"
          >
            <option value={0}>Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name} ({category.services_count} services)
              </option>
            ))}
          </select>
        )}
        {errors.category_id && (
          <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
        )}
        {selectedCategory && (
          <p className="mt-2 text-sm text-gray-600">
            {selectedCategory.description}
          </p>
        )}
      </div>

      {/* Services Selection */}
      {formData.category_id > 0 && (
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">
            Services Offered <span className="text-red-500">*</span>
          </label>

          {isLoadingServices ? (
            <div className="text-sm md:text-md w-full px-4 py-3 rounded-lg border-2 border-card-border bg-gray-50 animate-pulse">
              <p className="text-gray-400">Loading services...</p>
            </div>
          ) : !Array.isArray(filteredServices) || filteredServices.length === 0 ? (
            <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 text-center">
              <p className="text-gray-500">No services available for this category</p>
            </div>
          ) : (
            <MultiSelect
              options={filteredServices.map(service => ({
                id: service.id,
                name: service.name
              }))}
              selected={formData.service_ids}
              onChange={(selectedIds) => {
                setFormData(prev => ({ ...prev, service_ids: selectedIds }));
                // Clear error when user selects services
                if (errors.service_ids) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.service_ids;
                    return newErrors;
                  });
                }
              }}
              placeholder="Click to select services..."
              maxSelections={5}
              error={errors.service_ids}
            />
          )}

          {/* Show selected services details */}
          {formData.service_ids.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                Selected Services:
              </p>
              <ul className="space-y-1">
                {filteredServices
                  .filter(service => formData.service_ids.includes(service.id))
                  .map(service => (
                    <li key={service.id} className="text-sm text-blue-800">
                      • {service.name}
                      {service.suggested_price_min && service.suggested_price_max && (
                        <span className="text-xs text-blue-600 ml-2">
                          (KES {service.suggested_price_min} - {service.suggested_price_max})
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* About/Bio */}
      <div>
        <label htmlFor="about" className="block text-sm font-semibold text-primary mb-2">
          About Your Business <span className="text-red-500">*</span>
        </label>
        <textarea
          id="about"
          name="about"
          value={formData.about}
          onChange={handleChange}
          required
          rows={4}
          maxLength={500}
          className="text-sm md:text-md w-full px-4 py-3 rounded-lg border-2 border-card-border focus:border-primary focus:outline-none transition-colors resize-none"
          placeholder="Describe your business, experience, and what makes you stand out..."
        />
        <p className="mt-1 text-xs text-gray-500">
          {formData.about.length}/500 characters
        </p>
        {errors.about && (
          <p className="mt-1 text-sm text-red-600">{errors.about}</p>
        )}
      </div>

      {/* Address - Location Picker */}
      <div id="address">
        <LocationPicker
          label="Business Location"
          value={formData.address}
          onLocationSelect={handleLocationSelect}
          error={errors.address || errors.latitude}
          placeholder="e.g., Galleria Mall, Ngong Road, ABC Place, Manda Hill…"
          required
        />
      </div>

      {/* Service Radius */}
      <div>
        <label htmlFor="service_radius_km" className="block text-sm font-semibold text-primary mb-2">
          Service Radius (km)
        </label>
        <select
          id="service_radius_km"
          name="service_radius_km"
          value={formData.service_radius_km}
          onChange={handleChange}
          className="text-sm md:text-md w-full px-4 py-3 rounded-lg border-2 border-card-border focus:border-primary focus:outline-none transition-colors bg-white"
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={15}>15 km</option>
          <option value={20}>20 km</option>
          <option value={30}>30 km</option>
          <option value={50}>50 km</option>
          <option value={100}>100 km</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          How far are you willing to travel for jobs?
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2">
          Business Logo <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <div className="flex items-start gap-4">
          {logoPreview && (
            <img
              src={logoPreview}
              alt="Logo preview"
              className="w-16 h-16 object-cover rounded-lg border-2 border-card-border"
            />
          )}
          <label className="cursor-pointer flex-1">
            <div className="border-2 border-dashed border-card-border rounded-lg px-4 py-3 text-sm text-gray-500 hover:border-primary transition-colors text-center">
              {formData.logo ? formData.logo.name : 'Click to upload logo'}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </label>
        </div>
        {errors.logo && (
          <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
        )}
      </div>

      {/* Banner Upload */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2">
          Banner Image <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <div className="space-y-3">
          {bannerPreview && (
            <img
              src={bannerPreview}
              alt="Banner preview"
              className="w-full h-24 object-cover rounded-lg border-2 border-card-border mb-2"
            />
          )}
          <label className="cursor-pointer">
            <div className="border-2 border-dashed border-card-border rounded-lg px-4 py-3 text-sm text-gray-500 hover:border-primary transition-colors text-center">
              {formData.banner_image
                ? formData.banner_image.name
                : 'Click to upload banner'}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
          </label>
        </div>
        {errors.banner_image && (
          <p className="mt-1 text-sm text-red-600">{errors.banner_image}</p>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Note:</strong> Your profile will be reviewed by our team before going live. You'll receive an email notification once approved.
        </p>
      </div>

      {/* Terms Agreement */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={(e) => setFormData(prev => ({ ...prev, agreeToTerms: e.target.checked }))}
          required
          className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="agreeToTerms" className="text-sm text-gray-600">
          I agree to the{' '}
          <Link href="/terms-of-service" className="text-primary hover:underline font-semibold">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy-policy" className="text-primary hover:underline font-semibold">
            Privacy Policy
          </Link>
          , and confirm that all information provided is accurate.
        </label>
      </div>
      {errors.agreeToTerms && (
        <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="text-sm md:text-md flex-1 px-1 py-3"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="flex-1 text-sm md:text-md px-6 py-3"
        >
          Create Account
        </Button>
      </div>
    </form>
  );
}