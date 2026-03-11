'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Professional } from '@/types/auth';
import toast from 'react-hot-toast';

interface ProfessionalContactFormProps {
  professional: Professional;
}

export const ProfessionalContactForm: React.FC<ProfessionalContactFormProps> = ({ 
  professional 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredDate: '',
    preferredTime: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Please be patient as we work on the message feature');
    setIsSubmitting(false);
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
      preferredDate: '',
      preferredTime: '',
    });
  };

  return (
    <Card padding="lg">
      <h3 className="text-lg lg:text-xl font-bold mb-4 text-primary">Request Service</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
            Your Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full text-xs md:text-sm px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full text-xs md:text-sm px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
            placeholder="john@example.com"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
            Phone *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full text-xs md:text-sm px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
            placeholder="+254 712 345 678"
          />
        </div>

        {/* Preferred Date */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
            Preferred Date
          </label>
          <input
            type="date"
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full text-xs md:text-sm px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none"
          />
        </div>

        {/* Preferred Time */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
            Preferred Time
          </label>
          <select
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            className="w-full text-xs md:text-sm px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none bg-white"
          >
            <option value="">Select time...</option>
            <option value="morning">Morning (8AM - 12PM)</option>
            <option value="afternoon">Afternoon (12PM - 5PM)</option>
            <option value="evening">Evening (5PM - 8PM)</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            required
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            className="w-full text-xs md:text-sm px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-primary focus:outline-none resize-none"
            placeholder="Describe the service you need..."
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="w-full text-sm md:text-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send Request'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          {professional.business_name} typically responds within {professional.response_time}
        </p>
      </form>
    </Card>
  );
};