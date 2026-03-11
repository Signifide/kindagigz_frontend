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
import { LogoutModal } from '../auth/LogoutModal';
import { cn } from '@/lib/utils/cn';
import { authService } from '@/lib/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import toast from 'react-hot-toast';

const DASHBOARD_SECTIONS = [
  { id: 'overview', name: 'Overview', icon: '📊' },
  { id: 'bookings', name: 'Bookings', icon: '📅' },
  { id: 'schedule', name: 'Schedule', icon: '🗓️' },
  { id: 'messages', name: 'Messages', icon: '💬' },
  { id: 'clients', name: 'Clients', icon: '👥' },
  { id: 'reviews', name: 'Reviews', icon: '⭐' },
  { id: 'payments', name: 'Payments', icon: '💰' },
  { id: 'analytics', name: 'Analytics', icon: '📈' },
  { id: 'settings', name: 'Settings', icon: '⚙️' },
];

interface DashboardLayoutProps {
  professional: Professional;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ professional }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { logout: contextLogout } = useAuth();
  const router = useRouter();

  const currentSection = DASHBOARD_SECTIONS.find(s => s.id === activeSection);

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      await contextLogout();
      toast.success('Logged out successfully');
      router.push(ROUTES.HOME);
    } catch (error) {
      contextLogout();
      router.push(ROUTES.HOME);
    } finally {
      setIsLoggingOut(false);
    }
  };

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
    <div className="relative flex min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay*/}
      <div 
        className={cn(
          "fixed inset-0 bg-primary/40 backdrop-blur-sm z-60 lg:hidden transition-opacity duration-300",
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar (Desktop Sidebar + Mobile Drawer) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-70 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <DashboardSidebar
          professional={professional}
          activeSection={activeSection}
          sections={DASHBOARD_SECTIONS}
          onSectionChange={(section) => {
            setActiveSection(section);
            setIsSidebarOpen(false);
          }}
          onLogoutRequest={() => setShowLogoutModal(true)}
          onClose={() => setIsSidebarOpen(false)}
        />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#ececf4]">
        <Navbar />

        {/* Mobile Sticky Header */}
        <div className="lg:hidden sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl shadow-md active:scale-95 transition-all"
          >
            <span className="text-md">{currentSection?.icon}</span>
            <span className="font-bold text-xs uppercase tracking-wide">{currentSection?.name}</span>
            <svg className="w-4 h-4 ml-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Greeting */}
          <div className="p-4 md:p-6">
            <DashboardGreeting professional={professional} />
          </div>

          {/* Section Content */}
          <div className="px-4 md:px-6 pb-12">
            <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-gray-100">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </div>
  );
};