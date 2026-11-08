'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { CARD_TEMPLATES, type TemplateDefinition } from '@/cards/templates/CardTemplateRegistry';

export const TemplateGallery: React.FC = () => {
  const templates = Object.values(CARD_TEMPLATES);

  return (
    <section id="templates" className="py-20 md:py-28 border-t border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Satori-Safe Design Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
            8 Purpose-Built Archetypes
          </h2>
          <p className="mt-4 text-base text-zinc-400">
            Engineered exclusively with SVG and Flexbox primitives guaranteed to render identically
            in Satori, Resvg, browser DOM, and social media feed crawlers.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {templates.map((tpl: TemplateDefinition) => (
            <div
              key={tpl.id}
              className="flex flex-col justify-between rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-6 hover:border-zinc-700 hover:bg-zinc-900/70 transition-all group"
            >
              <div>
                {/* Archetype Icon / Preview Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {tpl.id}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                </div>

                <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {tpl.name}
                </h3>

                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">{tpl.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex flex-col gap-3">
                <div className="text-[11px] text-zinc-500">
                  <span className="text-zinc-400 font-medium">Best for: </span>
                  {tpl.recommendedFor}
                </div>

                <Link
                  href={`/studio?template=${tpl.id}`}
                  className="flex items-center justify-between text-xs font-semibold text-blue-400 hover:text-blue-300 pt-1 group/btn"
                >
                  <span>Use in Studio</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
