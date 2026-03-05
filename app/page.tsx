import { CategoriesSection } from "@/components/home/CategoriesSection";
import { CTASection } from "@/components/home/CTASection";
import { HeroSection } from "@/components/home/HeroSection";
import { LiveMapSection } from "@/components/home/LiveMap";
import { ProfessionalsSection } from "@/components/home/ProfessionalsSection";
import { WhyKindaGigz } from "@/components/home/WhyKindaGigz";
import Image from "next/image";

export default function Home() {
  return (
      <main className="min-h-screen overflow-x-hidden w-full">
        <HeroSection />
        <WhyKindaGigz />
        <CategoriesSection />
        <ProfessionalsSection />
        <LiveMapSection />
        <CTASection />
      </main>
  );
}
