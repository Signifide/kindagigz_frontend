'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '../shared/EmptyState';
import { dashboardService } from '@/lib/services/dashboardService';
import type { Booking } from '@/types/dashboard';

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === activeFilter));
    }
  }, [activeFilter, bookings]);

  const fetchBookings = async () => {
    setIsLoading(true);
    const data = await dashboardService.getBookings();
    setBookings(data);
    setFilteredBookings(data);
    setIsLoading(false);
  };

  const filters = [
    { id: 'all', label: 'All', count: bookings.length },
    { id: 'pending', label: 'Pending', count: bookings.filter(b => b.status === 'pending').length },
    { id: 'confirmed', label: 'Confirmed', count: bookings.filter(b => b.status === 'confirmed').length },
    { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in_progress': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Bookings</h2>
        <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">
          + New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              activeFilter === filter.id
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No bookings found"
          description={`You don't have any ${activeFilter === 'all' ? '' : activeFilter} bookings yet`}
          action={{
            label: 'Create Booking',
            onClick: () => console.log('Create booking'),
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} padding="lg" hoverable>
              <div className="flex items-start justify-between">
                {/* Left Side - Client & Service Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Client Avatar */}
                  {booking.client.avatar ? (
                    <img
                      src={booking.client.avatar}
                      alt={booking.client.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {booking.client.name.charAt(0)}
                      </span>
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">
                      {booking.client.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {booking.service.name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        📅 {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        🕐 {booking.time}
                      </span>
                      <span className="flex items-center gap-1">
                        📞 {booking.client.phone}
                      </span>
                    </div>
                    {booking.notes && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        💬 {booking.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Side - Status & Price */}
                <div className="text-right">
                  <p className="text-xl font-bold text-primary mb-2">
                    KES {booking.price}
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                    {booking.status.replace('_', ' ').toUpperCase()}
                  </span>
                  
                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <button className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                          Accept
                        </button>
                        <button className="text-xs px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                          Decline
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button className="text-xs px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Start Job
                      </button>
                    )}
                    {booking.status === 'in_progress' && (
                      <button className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};