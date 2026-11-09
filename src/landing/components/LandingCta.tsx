'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionLink } from './SectionLink';

export const LandingCta: React.FC = () => {
  return (
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal relative overflow-hidden rounded-3xl border border-blue-500/20 bg-linear-to-br from-blue-950/40 via-zinc-900 to-zinc-950 px-6 py-14 text-center shadow-2xl shadow-blue-500/5 sm:px-12">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[100px]" />

          <h2 className="relative mx-auto max-w-2xl text-3xl leading-tight font-extrabold tracking-tight text-white sm:text-5xl">
            Your next repo deserves a better first impression.
          </h2>

          <p className="relative mx-auto mt-4 max-w-xl text-base text-zinc-400">
            Open the studio, load any public repository, and export a card in seconds.
          </p>

          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/studio"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-600/20 transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-blue-500 active:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none sm:w-auto"
            >
              Launch Studio
              <ArrowRight className="h-4 w-4" />
            </Link>

            <SectionLink
              sectionId="templates"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-6 py-3.5 text-sm font-semibold text-zinc-300 transition-colors duration-200 hover:bg-zinc-800 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:outline-none sm:w-auto"
            >
              Browse templates
            </SectionLink>
          </div>

          <p className="relative mt-6 text-[11px] text-zinc-500">
            Free · No sign-up · No credit card
          </p>
        </div>
      </div>
    </section>
  );
};
