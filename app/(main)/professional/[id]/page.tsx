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
    const { id } = await params;

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
        <div className="min-h-screen bg-primary md:pb-8 overflow-x-hidden w-full">
            <Navbar variant="transparent" />
            <ProfessionalHeroClient professional={professional} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-12">
                <ProfessionalSimilarServices
                    categoryId={professional.category.id}
                    currentProfessionalId={professional.id}
                />
            </div>
        </div>
    );
}