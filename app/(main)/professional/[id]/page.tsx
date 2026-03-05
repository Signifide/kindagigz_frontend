import React from 'react';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar/Navbar';
import { ProfessionalHeroClient } from '@/components/professionals/ProfessionalHeroClient';
import { ProfessionalSimilarServices } from '@/components/professionals/ProfessionalSimilarServices';
import { professionalService } from '@/lib/services/professionalService';

export default async function ProfessionalPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params; // Unwrapping the promise

    // Convert string to number for API call
    const professionalId = parseInt(id, 10);
    
    // Validate ID is a valid number
    if (isNaN(professionalId)) {
        notFound();
    }

    // Fetch professional data
    const professional = await professionalService.getProfessionalById(professionalId);
    
    // Show 404 if not found
    if (!professional) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-primary pb-12 overflow-x-hidden w-full">
            <Navbar variant="transparent" />
            {/* This is the boundary. We pass DATA (professional) 
         but NOT functions/event-handlers. 
      */}
            <ProfessionalHeroClient professional={professional} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <ProfessionalSimilarServices
                    categoryId={professional.category.id}
                    currentProfessionalId={professional.id}
                />
            </div>
        </div>
    );
}


/*
PROFESSIONAL PAGE STRUCTURE:
============================

1. Hero Section
   - Banner image
   - Profile image (overlapping banner)
   - Name, title, verification badge
   - Stats (rating, jobs, response time)
   - Action buttons (Contact, Request Quote, Save)
   - Navigation tabs (Profile, Reviews)

2. Main Content Section (based on active tab)
   a. Profile Tab:
      - About section
      - Gallery (photos of work)
      - Operational hours
      - Location map
      - Contact form
   
   b. Reviews Tab:
      - Review statistics
      - Filter/sort options
      - List of reviews
      - Pagination

3. Similar Services Section
   - "You May Be Interested In"
   - 3-4 similar service providers
   - Same category or location

4. Footer (from layout)

NEXT STEPS:
===========
Create these component files:
- components/professional/ProfessionalProfile.tsx
- components/professional/ProfessionalReviews.tsx
- components/professional/SimilarServices.tsx
*/