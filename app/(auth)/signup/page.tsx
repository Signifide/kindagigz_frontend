'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { SignupForm } from '@/components/auth/SignupForm';
import { ROUTES } from '@/lib/constants/routes';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      
      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* Signup Form Component */}
          <SignupForm />

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm md:text-md text-gray-600">
              Already have an account?{' '}
              <Link href={ROUTES.LOGIN} className="font-semibold text-primary hover:text-primary/80">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}