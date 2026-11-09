'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CardRenderer, CARD_TEMPLATES } from '@/cards/templates/CardTemplateRegistry';
import {
  DEFAULT_CONFIG,
  DEFAULT_REPO,
  TEMPLATE_SIGNATURE_PATTERNS,
} from '@/studio/state/useCardStore';
import type { CardConfig, TemplateId } from '@/core/domain/schemas';
import { ScaledCard } from './ScaledCard';

const templates = Object.values(CARD_TEMPLATES);

function previewConfig(templateId: TemplateId): CardConfig {
  return {
    ...DEFAULT_CONFIG,
    templateId,
    backgroundPattern: {
      ...DEFAULT_CONFIG.backgroundPattern,
      id: TEMPLATE_SIGNATURE_PATTERNS[templateId] ?? DEFAULT_CONFIG.backgroundPattern.id,
    },
  };
}

export const ShowcaseSection: React.FC = () => {
  return (
    <section id="templates" className="relative border-t border-zinc-800/80 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">
              Templates
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Eight templates. All rendered live.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-400">
              Every preview below is rendered by the same card component the studio uses, not a
              mockup. Pick a layout, then fine-tune colors, backgrounds, and typography in the
              editor.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            Rendered with the production card engine
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {templates.map((template) => (
            <Link
              key={template.id}
              href={`/studio?template=${template.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-blue-500/40 hover:bg-zinc-900/70 hover:shadow-xl hover:shadow-blue-500/5 focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:outline-none"
            >
              <ScaledCard className="bg-zinc-950">
                <CardRenderer repo={DEFAULT_REPO} config={previewConfig(template.id)} />
              </ScaledCard>

              <div className="flex flex-1 items-center justify-between gap-3 border-t border-zinc-800/80 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-100">{template.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                    {template.recommendedFor}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
