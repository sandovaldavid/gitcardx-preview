import type { Metadata } from 'next';
import { LandingNavbar } from '@/landing/components/LandingNavbar';
import { HeroGenerator } from '@/landing/components/HeroGenerator';
import { ComparisonSection } from '@/landing/components/ComparisonSection';
import { TemplateGallery } from '@/landing/components/TemplateGallery';
import { UrlTrickSection } from '@/landing/components/UrlTrickSection';
import { ReadmeApiSection } from '@/landing/components/ReadmeApiSection';
import { FeaturesSection } from '@/landing/components/FeaturesSection';
import { LandingCta } from '@/landing/components/LandingCta';
import { LandingFooter } from '@/landing/components/LandingFooter';

export const metadata: Metadata = {
  title: 'GitCardX — Instant GitHub Social Preview & Open Graph Card Studio',
  description:
    'Generate pixel-perfect GitHub social preview cards (1280×640) in 5 seconds. 8 Satori-safe templates, generative SVG backgrounds, social simulator, zero mandatory sign-up.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      <LandingNavbar />
      <main className="flex-1">
        <HeroGenerator />
        <ComparisonSection />
        <TemplateGallery />
        <UrlTrickSection />
        <ReadmeApiSection />
        <FeaturesSection />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
