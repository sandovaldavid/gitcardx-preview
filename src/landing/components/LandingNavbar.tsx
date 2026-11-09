'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { GitframeLogo } from '@/components/GitframeLogo';
import { GithubIcon } from '@/components/icons';
import { APP_VERSION_TAG } from '@/lib/version';
import { SectionLink } from './SectionLink';

export const LandingNavbar: React.FC = () => {
  const pathname = usePathname();

  const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      pathname !== '/' ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    window.scrollTo({ top: 0, behavior });
    window.history.replaceState(null, '', '/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" onClick={handleBrandClick} className="flex items-center gap-2.5">
          <GitframeLogo className="h-7 w-7" />
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold tracking-tight text-white">Gitframe</span>
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-blue-400 uppercase">
              {APP_VERSION_TAG}
            </span>
          </div>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 text-sm font-medium text-zinc-400 md:flex"
        >
          <SectionLink
            sectionId="templates"
            className="whitespace-nowrap transition-colors duration-200 hover:text-zinc-100"
          >
            Templates
          </SectionLink>
          <SectionLink
            sectionId="workflow"
            className="whitespace-nowrap transition-colors duration-200 hover:text-zinc-100"
          >
            Workflow
          </SectionLink>
          <SectionLink
            sectionId="features"
            className="whitespace-nowrap transition-colors duration-200 hover:text-zinc-100"
          >
            Features
          </SectionLink>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/sandovaldavid/gitframe"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors duration-200 hover:border-zinc-700 hover:bg-zinc-800/60 hover:text-white sm:flex"
          >
            <GithubIcon className="h-4 w-4" />
            <span>GitHub</span>
          </a>

          <Link
            href="/studio"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/25 transition-colors duration-200 hover:bg-blue-500 active:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:outline-none"
          >
            <span>Open Studio</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};
