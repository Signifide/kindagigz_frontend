'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '../shared/StatCard';
import { EmptyState } from '../shared/EmptyState';
import { dashboardService } from '@/lib/services/dashboardService';
import type { Professional } from '@/types/auth';
import type { DashboardStats, Booking } from '@/types/dashboard';

interface OverviewProps {
  professional: Professional;
}

export const Overview: React.FC<OverviewProps> = ({ professional }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Fetch stats
      const statsData = await dashboardService.getStats();
      if (statsData) {
        setStats(statsData);
      } else {
        // Fallback to professional data
        setStats({
          totalBookings: professional.total_jobs || 0,
          completedJobs: professional.completed_jobs || 0,
          activeClients: 0,
          totalEarnings: '0',
          averageRating: professional.average_rating || '0',
          totalReviews: professional.total_reviews || 0,
          responseRate: '0',
          completionRate: '0',
        });
      }

      // Fetch recent bookings
      const bookings = await dashboardService.getBookings();
      setRecentBookings(bookings.slice(0, 5));
      
      setIsLoading(false);
    };

    fetchData();
  }, [professional]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          color="primary"
        />

        <StatCard
          label="Completed Jobs"
          value={stats?.completedJobs || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="green"
        />

        <StatCard
          label="Average Rating"
          value={`${parseFloat(stats?.averageRating || '0').toFixed(1)} ⭐`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          color="orange"
        />

        <StatCard
          label="Total Earnings"
          value={`KES ${stats?.totalEarnings || '0'}`}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
            <button className="text-primary text-sm font-semibold hover:underline">
              View All
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <EmptyState
              icon="📅"
              title="No bookings yet"
              description="Your recent bookings will appear here"
            />
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold">
                        {booking.client.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{booking.client.name}</p>
                      <p className="text-xs text-gray-600">{booking.service.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">{booking.date}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-left">
              <div className="text-2xl mb-2">📅</div>
              <p className="font-semibold text-sm">View Schedule</p>
            </button>
            <button className="p-4 bg-secondary text-primary rounded-lg hover:bg-secondary/90 transition-colors text-left">
              <div className="text-2xl mb-2">💬</div>
              <p className="font-semibold text-sm">Messages</p>
            </button>
            <button className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-left">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="font-semibold text-sm">Settings</p>
            </button>
            <button className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-left">
              <div className="text-2xl mb-2">📊</div>
              <p className="font-semibold text-sm">Analytics</p>
            </button>
          </div>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card padding="lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">
              {stats?.responseRate || '0'}%
            </div>
            <p className="text-sm text-gray-600">Response Rate</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">
              {stats?.completionRate || '0'}%
            </div>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-primary mb-1">
              {professional.total_reviews}
            </div>
            <p className="text-sm text-gray-600">Total Reviews</p>
          </div>
        </div>
      </Card>
    </div>
  );
};