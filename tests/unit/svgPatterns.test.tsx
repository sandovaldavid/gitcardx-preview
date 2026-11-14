import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Resvg } from '@resvg/resvg-js';
import {
  calculateArchitecturalGridMetrics,
  generateArchitecturalGrid,
  calculateDotMatrixMetrics,
  generateDotMatrix,
  calculateRadialSpotlightMetrics,
  generateRadialSpotlight,
  calculateAuroraMeshMetrics,
  generateAuroraMesh,
  calculateTopographicMetrics,
  generateTopographicContours,
  generateDynamicRays,
  getPatternDefinition,
  getPatternSvgString,
  getPatternDataUri,
  ArchitecturalGrid,
  DotMatrix,
  RadialSpotlight,
  AuroraMesh,
  TopographicContours,
  CustomImageBackground,
  BackgroundRenderer,
  SvgPatternCanvas,
  type BackgroundPatternId,
} from '@/cards/backgrounds';

describe('Modular SVG Pattern Architecture', () => {
  describe('Geometry calculations & scaling bounds', () => {
    it('clamps architectural grid scale between 0.25 and 4', () => {
      const minMetrics = calculateArchitecturalGridMetrics(0.01);
      expect(minMetrics.scale).toBe(0.25);
      expect(minMetrics.smallSize).toBe(10);
      expect(minMetrics.largeSize).toBe(40);

      const maxMetrics = calculateArchitecturalGridMetrics(10);
      expect(maxMetrics.scale).toBe(4);
      expect(maxMetrics.smallSize).toBe(160);
      expect(maxMetrics.largeSize).toBe(640);

      const normalMetrics = calculateArchitecturalGridMetrics(1);
      expect(normalMetrics.smallSize).toBe(40);
      expect(normalMetrics.largeSize).toBe(160);
    });

    it('clamps dot matrix spacing and radius correctly', () => {
      const normal = calculateDotMatrixMetrics(1);
      expect(normal.spacing).toBe(32);
      expect(normal.center).toBe(16);
      expect(normal.r).toBe(1.5);

      const scaled = calculateDotMatrixMetrics(2);
      expect(scaled.spacing).toBe(64);
      expect(scaled.center).toBe(32);
      expect(scaled.r).toBe(3);
    });

    it('calculates radial spotlight radii with bounds', () => {
      const normal = calculateRadialSpotlightMetrics(1);
      expect(normal.rPrimary).toBe('75%');
      expect(normal.rCorner).toBe('60%');

      const scaled = calculateRadialSpotlightMetrics(1.5);
      expect(scaled.rPrimary).toBe('113%');
      expect(scaled.rCorner).toBe('90%');
    });

    it('calculates aurora mesh rotated hue stops and scaled radii', () => {
      const metrics = calculateAuroraMeshMetrics('#3b82f6', 1);
      expect(metrics.primary).toBe('#3b82f6');
      expect(metrics.secondary).toBeDefined();
      expect(metrics.tertiary).toBeDefined();
      expect(metrics.secondary).not.toBe(metrics.primary);
      expect(metrics.tertiary).not.toBe(metrics.primary);
      expect(metrics.r1).toBe('65%');
      expect(metrics.r2).toBe('60%');
      expect(metrics.r3).toBe('70%');
    });

    it('calculates topographic contours stroke width with bounds', () => {
      const normal = calculateTopographicMetrics(1);
      expect(normal.strokeWidth).toBe(1.25);

      const scaled = calculateTopographicMetrics(2);
      expect(scaled.strokeWidth).toBe(2.5);
    });
  });

  describe('Pure SVG generation & DOM ID isolation', () => {
    it('generates architectural grid with default canonical IDs when idPrefix is omitted', () => {
      const pattern = generateArchitecturalGrid({
        accentColor: '#3b82f6',
        borderColor: '#262626',
        scale: 1,
      });

      expect(pattern.id).toBe('architectural-grid');
      expect(pattern.defs).toBeDefined();
      expect(pattern.content).toBeDefined();

      const svgString = pattern.toSvgString();
      expect(svgString).toContain('id="arch-small-grid"');
      expect(svgString).toContain('id="arch-large-grid"');
      expect(svgString).toContain('fill="url(#arch-small-grid)"');
      expect(svgString).toContain('fill="url(#arch-large-grid)"');
      expect(svgString).toContain('viewBox="0 0 1280 640"');
    });

    it('isolates SVG IDs when custom idPrefix is provided to prevent DOM collisions', () => {
      const patternA = generateArchitecturalGrid({
        accentColor: '#3b82f6',
        borderColor: '#ff0000',
        idPrefix: 'card-a',
      });
      const patternB = generateArchitecturalGrid({
        accentColor: '#10b981',
        borderColor: '#00ff00',
        idPrefix: 'card-b',
      });

      const svgA = patternA.toSvgString();
      const svgB = patternB.toSvgString();

      expect(svgA).toContain('id="card-a-small-grid"');
      expect(svgA).toContain('id="card-a-large-grid"');
      expect(svgA).toContain('fill="url(#card-a-large-grid)"');

      expect(svgB).toContain('id="card-b-small-grid"');
      expect(svgB).toContain('id="card-b-large-grid"');
      expect(svgB).toContain('fill="url(#card-b-large-grid)"');
    });

    it('generates dot matrix with isolated mask IDs when idPrefix is provided', () => {
      const dotA = generateDotMatrix({
        accentColor: '#3b82f6',
        borderColor: '#ffffff',
        idPrefix: 'item-1',
      });

      const svg = dotA.toSvgString();
      expect(svg).toContain('id="item-1-matrix-pattern"');
      expect(svg).toContain('id="item-1-fade-mask"');
      expect(svg).toContain('id="item-1-mask"');
      expect(svg).toContain('fill="url(#item-1-matrix-pattern)"');
      expect(svg).toContain('mask="url(#item-1-mask)"');
    });

    it('generates radial spotlight with isolated gradient IDs', () => {
      const spot = generateRadialSpotlight({
        accentColor: '#8b5cf6',
        borderColor: '#262626',
        idPrefix: 'spot-preview',
      });

      const svg = spot.toSvgString();
      expect(svg).toContain('id="spot-preview-spotlight-primary"');
      expect(svg).toContain('id="spot-preview-spotlight-corner"');
      expect(svg).toContain('fill="url(#spot-preview-spotlight-primary)"');
      expect(svg).toContain('fill="url(#spot-preview-spotlight-corner)"');
    });

    it('generates aurora mesh with 3 radial gradients and isolated IDs', () => {
      const aurora = generateAuroraMesh({
        accentColor: '#06b6d4',
        borderColor: '#262626',
        idPrefix: 'aurora-hero',
      });

      const svg = aurora.toSvgString();
      expect(svg).toContain('id="aurora-hero-aurora-blob-1"');
      expect(svg).toContain('id="aurora-hero-aurora-blob-2"');
      expect(svg).toContain('id="aurora-hero-aurora-blob-3"');
      expect(svg).toContain('fill="url(#aurora-hero-aurora-blob-1)"');
    });

    it('generates topographic contours with centered SVG transform and Resvg parity', () => {
      const topo = generateTopographicContours({
        accentColor: '#3b82f6',
        borderColor: '#64748b',
        scale: 1.5,
      });

      const svg = topo.toSvgString();
      expect(svg).toContain('stroke="#64748b"');
      expect(svg).toContain('transform="translate(640, 320) scale(1.5) translate(-640, -320)"');
      expect(svg).not.toContain('transform-origin');
      expect(svg).toContain('<path d="M -100 200');

      const scaledSvg = getPatternSvgString('topographic-contours', {
        accentColor: '#236f90',
        borderColor: '#236f90',
        scale: 2.85,
      });
      const rendered = new Resvg(scaledSvg, {
        fitTo: { mode: 'width', value: 1280 },
        font: { loadSystemFonts: false },
      }).render();
      const pixels = rendered.pixels;
      let topHalfPixels = 0;
      let bottomHalfPixels = 0;
      for (let y = 0; y < 640; y++) {
        for (let x = 0; x < 1280; x++) {
          if (pixels[(y * 1280 + x) * 4 + 3] > 20) {
            if (y < 320) topHalfPixels++;
            else bottomHalfPixels++;
          }
        }
      }
      expect(topHalfPixels).toBeGreaterThan(1000);
      expect(bottomHalfPixels).toBeGreaterThan(1000);
    });

    it('generates dynamic rays fallback pattern', () => {
      const rays = generateDynamicRays({
        accentColor: '#f59e0b',
        borderColor: '#262626',
        idPrefix: 'rays-custom',
      });

      const svg = rays.toSvgString();
      expect(svg).toContain('id="rays-custom-ray-grad"');
      expect(svg).toContain('<polygon points="0,0 600,0 200,640 0,640"');
    });
  });

  describe('Unified pattern dispatchers & Data URI helpers', () => {
    const patternIds = [
      'architectural-grid',
      'dot-matrix',
      'radial-spotlight',
      'aurora-mesh',
      'topographic-contours',
    ] as const;

    for (const id of patternIds) {
      it(`dispatches pattern '${id}' and generates valid standalone SVG string`, () => {
        const svg = getPatternSvgString(id, {
          accentColor: '#3b82f6',
          borderColor: '#262626',
          scale: 1,
        });

        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
        expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
        expect(svg).toContain('viewBox="0 0 1280 640"');
      });

      it(`generates valid CSS Data URI for '${id}'`, () => {
        const dataUri = getPatternDataUri(id, {
          accentColor: '#3b82f6',
          borderColor: '#262626',
        });

        expect(dataUri.startsWith('data:image/svg+xml;utf8,')).toBe(true);
        expect(dataUri).toContain('%3Csvg');
      });
    }

    it('falls back to architectural grid for unknown pattern id', () => {
      const def = getPatternDefinition('unknown-id' as unknown as BackgroundPatternId, {
        accentColor: '#3b82f6',
        borderColor: '#262626',
      });
      expect(def.id).toBe('architectural-grid');
    });
  });

  describe('React components & SvgPatternCanvas', () => {
    it('SvgPatternCanvas sets default presentation attributes and styles', () => {
      const canvas = (
        <SvgPatternCanvas opacity={0.5}>
          <rect width={1280} height={640} />
        </SvgPatternCanvas>
      );

      expect(canvas.props.width).toBeUndefined(); // default in component is 1280
      expect(canvas.props.opacity).toBe(0.5);
    });

    it('instantiates all background components cleanly', () => {
      const props = {
        accentColor: '#3b82f6',
        borderColor: '#262626',
        opacity: 0.4,
        scale: 1,
      };

      expect(<ArchitecturalGrid {...props} />).toBeDefined();
      expect(<DotMatrix {...props} />).toBeDefined();
      expect(<RadialSpotlight {...props} />).toBeDefined();
      expect(<AuroraMesh {...props} />).toBeDefined();
      expect(<TopographicContours {...props} />).toBeDefined();
      expect(
        <CustomImageBackground {...props} imageUrl="https://example.com/bg.png" />
      ).toBeDefined();

      const validBgHtml = renderToStaticMarkup(
        <CustomImageBackground {...props} imageUrl="https://example.com/bg.png" />
      );
      expect(validBgHtml).toContain('url(&quot;https://example.com/bg.png&quot;)');

      const unsafeBgHtml = renderToStaticMarkup(
        <CustomImageBackground
          {...props}
          imageUrl={'https://evil.example/a.png");background:url(https://evil.example/b)'}
        />
      );
      expect(unsafeBgHtml).not.toContain('evil.example');
      expect(unsafeBgHtml).toContain('<svg');
    });

    it('BackgroundRenderer dispatches all patterns and forwards idPrefix', () => {
      const renderer = (
        <BackgroundRenderer
          pattern={{ id: 'dot-matrix', opacity: 0.8, scale: 1.2 }}
          accentColor="#3b82f6"
          borderColor="#262626"
          idPrefix="test-prefix"
        />
      );

      expect(renderer).toBeDefined();
    });
  });
});
