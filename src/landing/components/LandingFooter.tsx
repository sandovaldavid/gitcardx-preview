'use client';

import React from 'react';
import Link from 'next/link';
import { GitframeLogo } from '@/components/GitframeLogo';
import { GithubIcon } from '@/components/icons';
import { APP_VERSION_TAG } from '@/lib/version';

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
          <span className="hidden text-zinc-700 sm:inline">·</span>
          <span>
            Powered by{' '}
            <a
              href="https://github.com/vercel/satori"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:text-white hover:decoration-white"
            >
              Satori
            </a>{' '}
            &{' '}
            <a
              href="https://github.com/thx/resvg-js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 underline decoration-zinc-700 underline-offset-4 transition-colors duration-200 hover:text-white hover:decoration-white"
            >
              resvg
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
