'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ROUTES, NAV_LINKS } from '@/lib/constants/routes';
import { Button } from '@/components/ui/Button';
import { ResourcesDropdown } from './ResourcesDropdown';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/services/authService';
import { LogoutModal } from '@/components/auth/LogoutModal';
import { cn } from '@/lib/utils/cn';
import Image from 'next/image';

interface NavbarProps {
  variant?: 'default' | 'transparent';
}

export const Navbar: React.FC<NavbarProps> = ({ variant = 'default' }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { user, isAuthenticated, isLoading, logout: contextLogout } = useAuth();

  const isTransparent = variant === 'transparent';

  // Toggle mobile dropdown - close others when opening one
  const toggleMobileDropdown = (dropdownName: string) => {
    setOpenMobileDropdown(prev => prev === dropdownName ? null : dropdownName);
  };

  // Get menu items for authenticated users
  const getUserMenuItems = () => {
    const items = [
      { label: 'Dashboard', href: ROUTES.DASHBOARD, icon: '📊' },
      { label: 'My Profile', href: ROUTES.PROFESSIONAL(user?.id.toString() || ''), icon: '👤' },
      { label: 'Settings', href: ROUTES.DASHBOARD_SETTINGS, icon: '⚙️' },
    ];

    if (user?.role === 'client') {
      items.push({
        label: 'Become a Service Provider',
        href: ROUTES.UPGRADE_TO_SERVICE_PROVIDER,
        icon: '⚡',
      });
    }

    return items;
  };

  // Handle logout
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsMobileMenuOpen(false);
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    const loadingToast = toast.loading('Logging out...');

    try {
      await authService.logout();

      // Clear auth context
      await contextLogout();

      toast.dismiss(loadingToast);
      toast.success('Logged out successfully', { duration: 2000 });
      setShowLogoutModal(false);

      setTimeout(() => {
        router.push(ROUTES.HOME);
      }, 300);

    } catch (error) {
      console.error('Logout error:', error);
      toast.dismiss(loadingToast);
      toast.error('Logout failed, but clearing session anyway');
      contextLogout();
      setShowLogoutModal(false);
      router.push(ROUTES.HOME);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <div className={cn(
        "z-50",
        isTransparent ? "absolute top-0 left-0 right-0 px-4 pt-4" : "sticky top-0 px-4 pt-4"
      )}>
        <nav className={cn(
          "border-2 shadow-md max-w-7xl mx-auto transition-all duration-200",
          // Dynamic border radius - full when closed, only top when mobile menu is open
          isMobileMenuOpen ? "rounded-lg" : "rounded-full",
          isTransparent
            ? "bg-secondary/80 backdrop-blur-lg border-secondary/30"
            : "bg-secondary border-black/10"
        )}>
          <div className="px-6 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link href={ROUTES.HOME} className="flex items-center space-x-2 shrink-0">
                <Image
                  src="/kinda-gigz-logo-zoomed.png"
                  alt="KindaGigz logo"
                  width={40}
                  height={40}
                  className="rounded-sm"
                  priority
                />
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {NAV_LINKS.map((link) => {
                  if (link.hasDropdown) {
                    return <ResourcesDropdown key={link.label} />;
                  }

                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                        isActive
                          ? 'text-primary bg-white/30 shadow-sm'
                          : 'text-primary/80 hover:text-primary hover:bg-white/20'
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>

              {/* Right Side - Auth Buttons or User Menu */}
              <div className="hidden md:flex items-center space-x-3 shrink-0">
                {isLoading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                ) : isAuthenticated && user ? (
                  <UserMenu user={user} />
                ) : (
                  <>
                    <Link href={ROUTES.LOGIN}>
                      <Button variant="ghost" size="sm">
                        Log In
                      </Button>
                    </Link>
                    <Link href={ROUTES.SIGNUP}>
                      <Button variant="secondary" size="sm">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-white/20 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-primary/10 bg-secondary/50 backdrop-blur-sm rounded-b-2xl">
              <div className="flex flex-col space-y-1 px-4">
                {/* Navigation Links */}
                {NAV_LINKS.map((link) => {
                  if (link.hasDropdown && link.dropdownItems) {
                    const isOpen = openMobileDropdown === link.label;

                    return (
                      <div key={link.label} className="space-y-1">
                        {/* Dropdown Header */}
                        <button
                          onClick={() => toggleMobileDropdown(link.label)}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm font-bold text-primary/70 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <span>{link.label}</span>
                          <svg
                            className={cn(
                              "w-4 h-4 transition-transform",
                              isOpen && "rotate-180"
                            )}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Dropdown Items */}
                        {isOpen && (
                          <div className="pl-2 space-y-1">
                            {link.dropdownItems.map((item) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                className="block px-6 py-2 text-sm text-primary hover:bg-white/20 rounded-lg transition-colors"
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setOpenMobileDropdown(null);
                                }}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={cn(
                        'block px-4 py-2 text-sm font-semibold rounded-lg transition-colors',
                        isActive
                          ? 'text-primary bg-white/30'
                          : 'text-primary/80 hover:bg-white/20 hover:text-primary'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* Mobile Auth/User Section */}
                <div className="pt-4 border-t border-primary/10 space-y-2">
                  {isAuthenticated && user ? (
                    <>
                      {/* User Info Header with Dropdown Toggle - UPDATED */}
                      <button
                        onClick={() => toggleMobileDropdown('userMenu')}
                        className="w-full px-4 py-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {user.profile_image ? (
                            <img
                              src={user.profile_image}
                              alt={user.first_name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-primary"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center border-2 border-white">
                              <span className="text-secondary text-sm font-bold">
                                {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 text-left">
                            <div className="text-sm font-bold text-primary">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-xs text-gray-600">{user.email}</div>
                          </div>
                          {/* Dropdown Icon */}
                          <svg
                            className={cn(
                              "w-5 h-5 text-primary transition-transform",
                              openMobileDropdown === 'userMenu' && "rotate-180"
                            )}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {/* User Menu Items */}
                      {openMobileDropdown === 'userMenu' && (
                        <div className="space-y-1 pl-2">
                          {getUserMenuItems().map((item) => (
                            <Link
                              key={item.label}
                              href={item.href}
                              className="flex items-center gap-2 px-6 py-2 text-sm text-primary hover:bg-white/20 rounded-lg transition-colors"
                              onClick={() => {
                                setIsMobileMenuOpen(false);
                                setOpenMobileDropdown(null);
                              }}
                            >
                              <span className="text-lg">{item.icon}</span>
                              <span>{item.label}</span>
                            </Link>
                          ))}

                          {/* Logout Button */}
                          <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center gap-2 px-6 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <span className="text-lg">🚪</span>
                            <span>Log Out</span>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-row items-center gap-2 sm:gap-3">
                      <Link href={ROUTES.LOGIN}>
                          {/* <button className="px-3 sm:px-4 py-2 text-sm font-semibold text-primary bg-white/90 hover:bg-white border-2 border-primary rounded-lg transition-all duration-200 hover:scale-105">
                            Log In
                          </button>
                        </Link>
                        <Link href={ROUTES.SIGNUP}>
                          <button className="px-3 sm:px-4 py-2 text-sm font-semibold text-primary bg-secondary hover:bg-secondary/90 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"></button> */}
                        <Button variant="ghost" size="md" className="w-full">
                          Log In
                        </Button>
                      </Link>
                      <Link href={ROUTES.SIGNUP}>
                        <Button variant="secondary" size="md" className="w-full">
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Logout Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
      />
    </>
  );
};