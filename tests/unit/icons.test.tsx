import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GithubIcon } from '@/components/icons';
import {
  MetricIcon,
  StarMetricIcon,
  ForkMetricIcon,
  ReleaseMetricIcon,
  LicenseMetricIcon,
} from '@/cards/icons/metricIcons';
import { MetricPill } from '@/cards/primitives/MetricPill';

describe('Icons & SVG extraction', () => {
  describe('GithubIcon (Web UI)', () => {
    it('renders a valid GitHub SVG with default classes', () => {
      const html = renderToString(<GithubIcon />);
      expect(html).toContain('<svg');
      expect(html).toContain('viewBox="0 0 24 24"');
      expect(html).toContain('class="w-4 h-4"');
      expect(html).toContain('aria-hidden="true"');
      expect(html).toContain('fill="currentColor"');
    });

    it('accepts custom className and size props', () => {
      const html = renderToString(<GithubIcon className="h-6 w-6 text-white" size={24} />);
      expect(html).toContain('class="h-6 w-6 text-white"');
      expect(html).toContain('width="24"');
      expect(html).toContain('height="24"');
    });
  });

  describe('MetricIcons (Satori compatible)', () => {
    it('renders StarMetricIcon with polygon and color', () => {
      const html = renderToString(<StarMetricIcon color="#eab308" size={18} />);
      expect(html).toContain('<svg');
      expect(html).toContain('width="18"');
      expect(html).toContain('fill="#eab308"');
      expect(html).toContain('<polygon');
    });

    it('renders ForkMetricIcon with lines, circles, and stroke', () => {
      const html = renderToString(<ForkMetricIcon color="#94a3b8" size={18} />);
      expect(html).toContain('<svg');
      expect(html).toContain('stroke="#94a3b8"');
      expect(html).toContain('<circle');
      expect(html).toContain('<line');
    });

    it('renders ReleaseMetricIcon with tag path and color', () => {
      const html = renderToString(<ReleaseMetricIcon color="#3b82f6" size={18} />);
      expect(html).toContain('<svg');
      expect(html).toContain('stroke="#3b82f6"');
      expect(html).toContain('<path');
    });

    it('renders LicenseMetricIcon with shield path and stroke', () => {
      const html = renderToString(<LicenseMetricIcon color="#94a3b8" size={18} />);
      expect(html).toContain('<svg');
      expect(html).toContain('stroke="#94a3b8"');
      expect(html).toContain('<path');
    });

    it('dispatches the correct icon for each metric type via MetricIcon', () => {
      const starHtml = renderToString(
        <MetricIcon type="stars" textColor="#ffffff" accentColor="#eab308" />
      );
      expect(starHtml).toContain('fill="#eab308"');

      const forkHtml = renderToString(
        <MetricIcon type="forks" textColor="#94a3b8" accentColor="#eab308" />
      );
      expect(forkHtml).toContain('stroke="#94a3b8"');

      const releaseHtml = renderToString(
        <MetricIcon type="release" textColor="#ffffff" accentColor="#3b82f6" />
      );
      expect(releaseHtml).toContain('stroke="#3b82f6"');

      const licenseHtml = renderToString(
        <MetricIcon type="license" textColor="#64748b" accentColor="#3b82f6" />
      );
      expect(licenseHtml).toContain('stroke="#64748b"');
    });
  });

  describe('MetricPill with extracted MetricIcon', () => {
    it('renders metric pill with stars and formatted value', () => {
      const html = renderToString(
        <MetricPill
          type="stars"
          value={12500}
          textColor="#ffffff"
          borderColor="#334155"
          accentColor="#fbbf24"
        />
      );
      expect(html).toContain('12.5k');
      expect(html).toContain('fill="#fbbf24"');
    });

    it('renders metric pill with text value for license', () => {
      const html = renderToString(
        <MetricPill
          type="license"
          value="MIT"
          textColor="#94a3b8"
          borderColor="#334155"
          accentColor="#3b82f6"
        />
      );
      expect(html).toContain('MIT');
      expect(html).toContain('stroke="#94a3b8"');
    });
  });
});
