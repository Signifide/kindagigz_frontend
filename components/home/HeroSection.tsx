'use client';

// ============================================
// HOMEPAGE HERO SECTION
// ============================================

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants/routes';
import { Navbar } from '../layout/Navbar/Navbar';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-primary text-white overflow-hidden min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Mobile Hero Image - Background Overlay Effect */}
      <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/90 to-primary z-10" />
        <Image
          src="/images/hero-section-image-without-bg.png"
          alt="KindaGigz professionals"
          width={800}
          height={800}
          className="absolute top-0 right-0 w-full h-full object-cover object-right opacity-20 scale-110"
          priority
        />
      </div>

      {/* Integrated Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 lg:space-y-8 ">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-secondary/30">
              <span className="text-secondary mr-2">✨</span>
              <span className="text-sm font-semibold">Connecting Africa's Workforce</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Find Top Tier Service Pros & Real Jobs.
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-secondary via-secondary to-white">
                Get the job done—locally, reliably
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg lg:text-xl text-white/80 max-w-xl leading-relaxed">
              Connect with verified professionals in your area for any job, big or small. 
              From carpenters to cleaners, find skilled workers ready to help—instantly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 flex-wrap">
              <Link href={ROUTES.SERVICES} className="flex-1 min-w-[160px] sm:flex-none">
                <Button 
                  variant="primary" 
                  size="lg"
                  className="w-full sm:w-auto text-sm sm:text-base px-4 sm:px-6 py-3"
                  rightIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                >
                  Find a Service Pro
                </Button>
              </Link>

              <Link href={ROUTES.SIGNUP} className="flex-1 min-w-[160px] sm:flex-none">
                <Button 
                  variant="tertiary" 
                  size="lg"
                  className="w-full sm:w-auto"
                  rightIcon={
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                >
                  Join as Service Pro
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            {/* <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-secondary">10,000+</div>
                <div className="text-sm text-white/70 mt-1">Active Professionals</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-secondary">50,000+</div>
                <div className="text-sm text-white/70 mt-1">Jobs Completed</div>
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-bold text-secondary">4.8★</div>
                <div className="text-sm text-white/70 mt-1">Average Rating</div>
              </div>
            </div> */}
          </div> 

          {/* Right Content - Hero Image with Floating Animation */}
          <div className="hidden lg:block relative">
            {/* Main Hero Image Container with Float Animation */}
            <div className="relative animate-float">
              <Image
                src="/images/hero-section-image-without-bg.png"
                alt="KindaGigz hero section"
                width={600}
                height={600}
                className="w-full h-auto rounded-2xl"
                priority
              />
            </div>

            {/* Floating Badge 1 - Top Right */}
            {/* <div className="absolute -top-4 -right-4 animate-float-delayed-1">
              <div className="bg-secondary text-primary px-4 py-2 rounded-full font-bold shadow-xl border-2 border-white/20">
                ✓ Verified
              </div>
            </div> */}

            {/* Floating Badge 2 - Bottom Left */}
            {/* <div className="absolute -bottom-4 -left-4 animate-float-delayed-2">
              <div className="bg-green-400 text-primary px-4 py-2 rounded-full font-bold shadow-xl border-2 border-white/20">
                🟢 Available Now
              </div>
            </div> */}

            {/* Floating Badge 3 - Top Left */}
            {/* <div className="absolute top-1/4 -left-6 animate-float-delayed-3">
              <div className="bg-white/90 backdrop-blur-sm text-primary px-3 py-2 rounded-lg shadow-lg border border-secondary/30">
                <div className="text-xs font-semibold">Response Time</div>
                <div className="text-lg font-bold">2 hours</div>
              </div>
            </div> */}

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed-1 {
          0%, 100% {
            transform: translateY(0px) rotate(-3deg);
          }
          50% {
            transform: translateY(-15px) rotate(3deg);
          }
        }

        @keyframes float-delayed-2 {
          0%, 100% {
            transform: translateY(0px) rotate(3deg);
          }
          50% {
            transform: translateY(-18px) rotate(-3deg);
          }
        }

        @keyframes float-delayed-3 {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-12px) scale(1.05);
          }
        }

        :global(.animate-float) {
          animation: float 6s ease-in-out infinite;
        }

        :global(.animate-float-delayed-1) {
          animation: float-delayed-1 5s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        :global(.animate-float-delayed-2) {
          animation: float-delayed-2 5.5s ease-in-out infinite;
          animation-delay: 1s;
        }

        :global(.animate-float-delayed-3) {
          animation: float-delayed-3 4.5s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </section>
  );
};