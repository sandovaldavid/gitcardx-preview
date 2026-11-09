import type { Metadata } from 'next';
import { LandingNavbar } from '@/landing/components/LandingNavbar';
import { HeroGenerator } from '@/landing/components/HeroGenerator';
import { ShowcaseSection } from '@/landing/components/ShowcaseSection';
import { WorkflowSection } from '@/landing/components/WorkflowSection';
import { FeaturesSection } from '@/landing/components/FeaturesSection';
import { LandingCta } from '@/landing/components/LandingCta';
import { LandingFooter } from '@/landing/components/LandingFooter';

export const metadata: Metadata = {
  title: 'Gitframe — Instant GitHub Social Preview & Open Graph Card Studio',
  description:
    'Generate pixel-perfect GitHub social preview cards (1280×640) in 5 seconds. 8 Satori-safe templates, real live previews, generative SVG backgrounds, and a dynamic README endpoint.',
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <LandingNavbar />
      <main className="flex-1">
        <HeroGenerator />
        <ShowcaseSection />
        <WorkflowSection />
        <FeaturesSection />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
