'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GitframeLogo } from '@/components/GitframeLogo';
import { APP_VERSION_TAG } from '@/lib/version';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const LandingNavbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
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
          <a
            href="#templates"
            className="whitespace-nowrap transition-colors duration-200 hover:text-zinc-100"
          >
            Templates
          </a>
          <a
            href="#workflow"
            className="whitespace-nowrap transition-colors duration-200 hover:text-zinc-100"
          >
            Workflow
          </a>
          <a
            href="#features"
            className="whitespace-nowrap transition-colors duration-200 hover:text-zinc-100"
          >
            Features
          </a>
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
