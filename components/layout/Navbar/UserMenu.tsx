'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ROUTES } from '@/lib/constants/routes';
import { authService } from '@/lib/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { LogoutModal } from '@/components/auth/LogoutModal';
import { User } from '@/types/auth';

interface UserMenuProps {
  user: User;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const router = useRouter();
  const { logout: contextLogout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: '📊' },
    { label: 'My Profile', href: ROUTES.PROFESSIONAL(user.id.toString()), icon: '👤' },
    { label: 'Settings', href: ROUTES.DASHBOARD_SETTINGS, icon: '⚙️' },
  ];

  // Add "Become a Professional" for clients only
  if (user.role === 'client') {
    menuItems.push({
      label: 'Become a Professional',
      href: ROUTES.UPGRADE_TO_SERVICE_PROVIDER,
      icon: '⚡',
    });
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    setIsOpen(false);
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

  const initials = `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          className="flex items-center space-x-2 px-3 py-2 rounded-full hover:bg-white/20 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
        >
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-8 h-8 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-white">
              <span className="text-secondary text-sm font-bold">{initials}</span>
            </div>
          )}
          <span className="text-sm font-semibold text-primary hidden lg:block">
            {user.first_name}
          </span>
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border-2 border-card-border py-2 z-50">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-card-border">
              <div className="text-sm font-bold text-primary">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-xs text-gray-500">{user.email}</div>
              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary text-primary">
                  {user.role === 'professional' ? 'Professional' : 'Client'}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 hover:bg-secondary/10 transition-colors group"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm font-semibold text-primary group-hover:text-primary/80">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-card-border py-1">
              <button
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors group text-left"
                onClick={handleLogoutClick}
              >
                <span className="text-xl">🚪</span>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-red-600">
                  Log Out
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

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