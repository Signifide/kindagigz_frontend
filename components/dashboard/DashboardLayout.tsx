'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardGreeting } from './DashboardGreetings';
import { Overview } from './sections/Overview';
import { Bookings } from './sections/Bookings';
import { Schedule } from './sections/Schedule';
import { Messages } from './sections/Messages';
import { Clients } from './sections/Clients';
import { Reviews } from './sections/Reviews';
import { Payments } from './sections/Payments';
import { Analytics } from './sections/Analytics';
import { Settings } from './sections/Settings';
import type { Professional } from '@/types/auth';
import { Navbar } from '../layout/Navbar/Navbar';

interface DashboardLayoutProps {
  professional: Professional;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ professional }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <Overview professional={professional} />;
      case 'bookings':
        return <Bookings />;
      case 'schedule':
        return <Schedule professional={professional} />;
      case 'messages':
        return <Messages />;
      case 'clients':
        return <Clients />;
      case 'reviews':
        return <Reviews professional={professional} />;
      case 'payments':
        return <Payments />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings professional={professional} />;
      default:
        return <Overview professional={professional} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar
        professional={professional}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">
        <Navbar />
        {/* Greeting */}
        <div className="p-6">
          <DashboardGreeting professional={professional} />
        </div>

        {/* Section Content */}
        <div className="px-6 pb-12">
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
};