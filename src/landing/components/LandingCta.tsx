'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const LandingCta: React.FC = () => {
  return (
    <section className="py-20 md:py-28 border-t border-zinc-800/80 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-75 bg-linear-to-r from-blue-600/10 via-indigo-600/15 to-violet-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Instant & 100% Free</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
          Ready to give your project an iconic visual identity?
        </h2>

        <p className="mt-4 text-base text-zinc-400 max-w-xl mx-auto">
          No credit card, no sign-up, no configuration. Open the studio, enter your repository name,
          and export in seconds.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/studio"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold shadow-xl shadow-blue-600/20 transition-all hover:scale-105"
          >
            <span>Launch Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="https://github.com/sandovaldavid/gitframe"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-sm font-semibold transition-colors"
          >
            <span>Star on GitHub</span>
          </a>
        </div>
      </div>
    </section>
  );
};
