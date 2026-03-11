'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants/routes';
import { authService } from '@/lib/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginCredentials, ApiError } from '@/types/auth';

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const loadingToast = toast.loading('Logging in...');

    try {
      const response = await authService.login(formData);

      setUser(response.user);

      toast.dismiss(loadingToast);
      toast.success(`Welcome back, ${response.user.first_name}!`, {
        duration: 3000,
      });

      // Small delay for user to see the success message
      setTimeout(() => {
        if (response.user.role === 'professional') {
          router.push(ROUTES.DASHBOARD);
        } else {
          router.push(ROUTES.HOME);
        }
      }, 500);

    } catch (err: any) {
      toast.dismiss(loadingToast);
      const apiError = err as ApiError;

      if (apiError.message) {
        setError(apiError.message);
        toast.error(apiError.message, {
          duration: 5000,
        });
      } else {
        const errorMessage = 'Login failed. Please check your credentials and try again.';
        setError(errorMessage);
        toast.error(errorMessage, {
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

    if (error) {
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-primary mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="text-sm md:text-md w-full px-4 py-3 rounded-lg border-2 border-card-border focus:border-primary focus:outline-none transition-colors"
          placeholder="your@email.com"
          disabled={isLoading}
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="block text-sm font-semibold text-primary">
            Password
          </label>
          <Link href="/forgot-password" className="text-sm text-secondary hover:underline">
            Forgot?
          </Link>
        </div>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full text-sm md:text-md px-4 py-3 rounded-lg border-2 border-card-border focus:border-primary focus:outline-none transition-colors"
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      {/* Remember Me */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="remember"
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
          Remember me for 30 days
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full text-sm md:text-md"
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Log In'}
      </Button>
    </form>
  );
}