import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ComparisonSection } from '@/landing/components/ComparisonSection';

describe('ComparisonSection (Real Project Comparison)', () => {
  it('renders section title and before/after headings', () => {
    const html = renderToString(<ComparisonSection />);
    expect(html).toContain('Default GitHub Preview vs. Gitframe');
    expect(html).toContain('Default GitHub Social Preview');
    expect(html).toContain('Gitframe Social Preview');
    expect(html).toContain('Real Project Comparison');
  });

  it('renders real project selection buttons', () => {
    const html = renderToString(<ComparisonSection />);
    expect(html).toContain('shadcn-ui/ui');
    expect(html).toContain('tailwindlabs/tailwindcss');
    expect(html).toContain('astral-sh/uv');
  });

  it('points to the authentic GitHub default opengraph asset for the active project', () => {
    const html = renderToString(<ComparisonSection />);
    expect(html).toContain('https://opengraph.githubassets.com/1/shadcn-ui/ui');
  });

  it('renders archetype selector buttons', () => {
    const html = renderToString(<ComparisonSection />);
    expect(html).toContain('OSS Credibility');
    expect(html).toContain('SDK Package');
    expect(html).toContain('Blueprint Grid');
    expect(html).toContain('Aurora Mesh');
    expect(html).toContain('CLI Terminal');
    expect(html).toContain('Release Spotlight');
  });

  it('renders interactive before/after split slider container with accessible role and attributes', () => {
    const html = renderToString(<ComparisonSection />);
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuemin="0"');
    expect(html).toContain('aria-valuemax="100"');
    expect(html).toContain('aria-valuenow="50"');
    expect(html).toContain('100% GitHub');
    expect(html).toContain('50/50 Split');
    expect(html).toContain('100% Gitframe');
    expect(html).toContain('clip-path:inset(0 50% 0 0)');
  });

  it('renders Studio customization link targeting the real project and template', () => {
    const html = renderToString(<ComparisonSection />);
    expect(html).toContain('/studio?repo=shadcn-ui/ui&amp;template=oss-credibility');
    expect(html).toMatch(/Customize.+ui.+in Studio/);
  });
});
