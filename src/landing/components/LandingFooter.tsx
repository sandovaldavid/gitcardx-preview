'use client';

import React from 'react';
import Link from 'next/link';
import { GitframeLogo } from '@/components/GitframeLogo';
import { APP_VERSION_TAG } from '@/lib/version';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950/60 py-10 text-xs text-zinc-500">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-zinc-300 transition-colors duration-200 hover:text-white"
          >
            <GitframeLogo className="h-5 w-5" />
            <span>Gitframe</span>
            <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] font-normal text-zinc-400">
              {APP_VERSION_TAG}
            </span>
          </Link>
          <span className="hidden text-zinc-700 sm:inline">·</span>
          <span>
            Development by{' '}
            <a
              href="https://github.com/sandovaldavid"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:text-white hover:decoration-white"
            >
              @sandovaldavid
            </a>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/studio" className="transition-colors duration-200 hover:text-zinc-300">
            Studio
          </Link>
          <a
            href="https://github.com/sandovaldavid/gitframe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors duration-200 hover:text-zinc-300"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            <span>Repository</span>
          </a>
          <a
            href="https://github.com/sandovaldavid/gitframe/blob/main/LICENSE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-200 hover:text-zinc-300"
          >
            FSL-1.1-MIT License
          </a>
        </div>
      </div>
    </footer>
  );
};
