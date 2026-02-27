'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import type { Professional } from '@/types/auth';

interface SettingsProps {
  professional: Professional;
}

export const Settings: React.FC<SettingsProps> = ({ professional }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'security'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'account', label: 'Account', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card padding="lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Business Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  defaultValue={professional.business_name}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  defaultValue={professional.tagline}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  About
                </label>
                <textarea
                  rows={4}
                  defaultValue={professional.about}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={`${professional.category.icon} ${professional.category.name}`}
                  disabled
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Services ({professional.services.length}/5)
                </label>
                <div className="flex flex-wrap gap-2">
                  {professional.services.map((service) => (
                    <span
                      key={service.id}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {service.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90">
                  Save Changes
                </button>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Branding</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  {professional.logo ? (
                    <img
                      src={professional.logo}
                      alt="Logo"
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No logo</span>
                    </div>
                  )}
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Upload New
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Banner Image
                </label>
                <div className="flex items-center gap-4">
                  {professional.banner_image ? (
                    <img
                      src={professional.banner_image}
                      alt="Banner"
                      className="w-32 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No banner</span>
                    </div>
                  )}
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Upload New
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'account' && (
        <Card padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={professional.user.email}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                defaultValue={professional.user.phone}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Languages
              </label>
              <div className="flex flex-wrap gap-2">
                {professional.languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90">
                Save Changes
              </button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card padding="lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { label: 'New Bookings', desc: 'Get notified when clients book your services' },
              { label: 'Messages', desc: 'Receive alerts for new client messages' },
              { label: 'Reviews', desc: 'Be notified of new reviews' },
              { label: 'Payment Updates', desc: 'Get updates on payment status' },
              { label: 'Marketing', desc: 'Receive tips and promotions' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
                <label className="relative inline-block w-12 h-6">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-full h-full bg-gray-300 peer-checked:bg-primary rounded-full peer transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition-transform"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card padding="lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-4">
                <button className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90">
                  Update Password
                </button>
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Two-Factor Authentication</h3>
            <p className="text-gray-600 mb-4">
              Add an extra layer of security to your account
            </p>
            <button className="px-6 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5">
              Enable 2FA
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};