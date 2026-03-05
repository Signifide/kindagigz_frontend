'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ROUTES } from '@/lib/constants/routes';
import { authService } from '@/lib/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { Professional } from '@/types/auth';
import { LogoutModal } from '../auth/LogoutModal';

interface DashboardSidebarProps {
  professional: Professional;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  professional,
  activeSection,
  onSectionChange,
}) => {
  const { logout: contextLogout } = useAuth();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const sections = [
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

  // Handle logout
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    const loadingToast = toast.loading('Logging out...');

    try {
      await authService.logout();

      // Clear auth context
      await contextLogout();

      // Dismiss loading and show success
      toast.dismiss(loadingToast);
      toast.success('Logged out successfully', {
        duration: 2000,
      });

      // Close modal and redirect
      setShowLogoutModal(false);

      setTimeout(() => {
        router.push(ROUTES.HOME);
      }, 300);

    } catch (error) {
      console.error('Logout error:', error);
      toast.dismiss(loadingToast);
      toast.error('Logout failed, but clearing session anyway');

      // Clear anyway
      contextLogout();
      setShowLogoutModal(false);
      router.push(ROUTES.HOME);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <aside className="w-64 bg-primary min-h-screen flex flex-col">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-white/70 text-sm mt-1">{professional.business_name}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === section.id
                ? 'bg-secondary text-primary font-semibold shadow-lg'
                : 'text-white hover:bg-white/10'
                }`}
            >
              <span className="text-xl">{section.icon}</span>
              <span>{section.name}</span>
            </button>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            {professional.logo || professional.user.profile_image ? (
              <img
                src={professional.logo || professional.user.profile_image || ''}
                alt={professional.user.first_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-primary font-bold">
                  {professional.user.first_name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">
                {professional.user.first_name} {professional.user.last_name}
              </p>
              <p className="text-white/70 text-xs">{professional.user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <span>🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </>
  );
};