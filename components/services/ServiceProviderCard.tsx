import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Professional } from '@/types/auth';
import { ROUTES } from '@/lib/constants/routes';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

interface ServiceProviderCardProps {
  professional: Professional;
  className?: string;
}

export const ServiceProviderCard: React.FC<ServiceProviderCardProps> = ({
  professional,
  className,
}) => {
  const professionalName = `${professional.user.first_name} ${professional.user.last_name}`;
  const businessName = professional.business_name;
  const banner = professional.banner_image;
  const logo = professional.logo || professional.user.profile_image;
  const description = professional.tagline || professional.about;
  const categoryName = professional.category.name;
  const categoryIcon = professional.category.icon;

  return (
    <Link href={ROUTES.PROFESSIONAL(professional.id.toString())} className="block">
      <Card
        variant="default"
        padding="none"
        hoverable
        className={cn('overflow-hidden flex flex-col h-full border-gray-200', className)}
      >
        {/* Banner Image */}
        <div className="relative h-22 md:h-27 lg:h-32 bg-slate-500 overflow-hidden">
          <Image
            src={banner || '/placeholder-banner.jpg'}
            alt="banner"
            fill
            className="object-cover"
          />
        </div>

        {/* Overlapping Logo */}
        <div className="relative px-4">
          <div className="absolute -top-8 md:-top-9 lg:-top-10 left-2 md:left-3 lg:left-4 w-14 md:w-17 lg:w-20 h-14 md:h-17 lg:h-20 rounded-full border bg-slate-500 overflow-hidden shadow-sm">
            <Image
              src={logo || '/placeholder-logo.jpg'}
              alt="logo"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-8 md:pt-10 lg:pt-12 p-2 md:p-3 lg:p-4 flex flex-col flex-1">
          <h3 className="text-sm md:text-md lg:text-xl font-bold text-black mb-1">
            {businessName}
          </h3>
          <p className="text-xs md:text-sm lg:text-sm text-gray-600 mb-2 md:mb-6 line-clamp-2">
            {description}
          </p>

          {/* Footer (Category & Bookmark) */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {categoryIcon && (
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm md:text-base">
                  {categoryIcon}
                </div>
              )}
              {/* <span className="text-sm text-black">
                {categoryName}
              </span> */}
            </div>

            {/* Services - Show first 2 */}
            {professional.services.length > 0 && (
              <div className="flex flex-wrap gap-1 w-full">
                {professional.services.slice(0, 2).map((service) => (
                  <span
                    key={service.id}
                    className="inline-block px-1.5 py-0.5 text-[9px] md:text-xs bg-gray-100 text-gray-700 rounded-md"
                  >
                    {service.name}
                  </span>
                ))}
                {professional.services.length > 2 && (
                  <span className="inline-block px-1.5 py-0.5 text-[9px] md:text-xs bg-gray-100 text-gray-500 rounded-md">
                    +{professional.services.length - 2} more
                  </span>
                )}
              </div>
            )}

            <button
              onClick={(e) => {
                e.preventDefault();
                toast.dismiss('Working on bookmark feature')
              }}
              className="text-gray-800 hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
};