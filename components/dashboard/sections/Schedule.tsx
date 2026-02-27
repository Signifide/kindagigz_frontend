'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { Professional } from '@/types/auth';
import type { DayOfWeek } from '@/types';

interface ScheduleProps {
  professional: Professional;
}

export const Schedule: React.FC<ScheduleProps> = ({ professional }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Schedule & Availability</h2>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90">
          Update Hours
        </button>
      </div>

      {/* Calendar Placeholder */}
      <Card padding="lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Calendar</h3>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-700 font-semibold text-lg mb-2">
            Calendar Integration Coming Soon
          </p>
          <p className="text-sm text-gray-600">
            View and manage your bookings in a calendar view
          </p>
        </div>
      </Card>

      {/* Working Hours */}
      <Card padding="lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Working Hours</h3>
        <div className="space-y-3">
          {daysOfWeek.map((day) => {
            const hours = professional.working_hours[day];
            return (
              <div
                key={day}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-900 capitalize w-32">
                  {day}
                </span>
                {hours ? (
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-gray-700">
                      {hours.open} - {hours.close}
                    </span>
                    <span className="text-green-600 text-sm">✓ Open</span>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Closed</span>
                )}
                <button className="text-primary text-sm font-semibold hover:underline">
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Availability Status */}
      <Card padding="lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Availability Status</h3>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${professional.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <p className="font-semibold text-gray-900">
                {professional.is_available ? 'Available for Bookings' : 'Unavailable'}
              </p>
              <p className="text-sm text-gray-600">
                {professional.is_available ? 'Clients can book your services' : 'New bookings are paused'}
              </p>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90">
            {professional.is_available ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </Card>
    </div>
  );
};