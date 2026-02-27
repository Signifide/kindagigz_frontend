'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '../shared/EmptyState';
import { dashboardService } from '@/lib/services/dashboardService';
import type { AnalyticsData } from '@/types/dashboard';

export const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    const data = await dashboardService.getAnalytics();
    setAnalytics(data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <EmptyState
        icon="📈"
        title="Analytics Coming Soon"
        description="Detailed business insights and analytics will be available here"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              timeRange === 'week' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              timeRange === 'month' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-4 py-2 rounded-lg font-semibold ${
              timeRange === 'year' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Revenue Chart */}
      <Card padding="lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-700 font-semibold text-lg mb-2">
            Interactive Charts Coming Soon
          </p>
          <p className="text-sm text-gray-600">
            Revenue tracking with visual graphs
          </p>
          {analytics.revenue && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              {analytics.revenue.labels.map((label, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">{label}</p>
                  <p className="text-lg font-bold text-primary">
                    KES {analytics.revenue.data[idx].toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Bookings Chart */}
      <Card padding="lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Bookings Over Time</h3>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-700 font-semibold text-lg mb-2">
            Bookings Trend Chart
          </p>
          <p className="text-sm text-gray-600">
            Track your booking patterns
          </p>
          {analytics.bookings && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              {analytics.bookings.labels.map((label, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">{label}</p>
                  <p className="text-lg font-bold text-blue-600">
                    {analytics.bookings.data[idx]} bookings
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Top Services */}
      <Card padding="lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Services</h3>
        {analytics.topServices && analytics.topServices.length > 0 ? (
          <div className="space-y-3">
            {analytics.topServices.map((service, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{service.name}</span>
                    <span className="text-sm text-gray-600">{service.count} bookings</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(service.count / Math.max(...analytics.topServices.map(s => s.count))) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No service data available yet</p>
        )}
      </Card>

      {/* Client Growth */}
      <Card padding="lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Client Growth</h3>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <p className="text-gray-700 font-semibold text-lg mb-2">
            Client Growth Chart
          </p>
          <p className="text-sm text-gray-600">
            Track your expanding client base
          </p>
          {analytics.clientGrowth && (
            <div className="mt-6 grid grid-cols-4 gap-4">
              {analytics.clientGrowth.labels.map((label, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">{label}</p>
                  <p className="text-lg font-bold text-purple-600">
                    {analytics.clientGrowth.data[idx]} clients
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="lg">
          <h4 className="text-sm text-gray-600 mb-2">Conversion Rate</h4>
          <p className="text-3xl font-bold text-primary mb-1">--</p>
          <p className="text-xs text-gray-500">Coming soon</p>
        </Card>

        <Card padding="lg">
          <h4 className="text-sm text-gray-600 mb-2">Avg. Booking Value</h4>
          <p className="text-3xl font-bold text-green-600 mb-1">--</p>
          <p className="text-xs text-gray-500">Coming soon</p>
        </Card>

        <Card padding="lg">
          <h4 className="text-sm text-gray-600 mb-2">Client Retention</h4>
          <p className="text-3xl font-bold text-blue-600 mb-1">--</p>
          <p className="text-xs text-gray-500">Coming soon</p>
        </Card>
      </div>
    </div>
  );
};