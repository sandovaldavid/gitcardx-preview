import { describe, it, expect } from 'vitest';
import { formatCompactMetric } from '@/cards/primitives/formatters';
import {
  getLanguageColor,
  resolveDistinctLanguageColors,
  EXTENDED_LANGUAGE_COLORS,
} from '@/core/domain/languageColors';
import { CardVisibilitySchema, RepoMetadataSchema } from '@/core/domain/schemas';

describe('formatCompactMetric', () => {
  it('formats small numbers without suffix', () => {
    expect(formatCompactMetric(0)).toBe('0');
    expect(formatCompactMetric(42)).toBe('42');
    expect(formatCompactMetric(999)).toBe('999');
  });

  it('formats thousands with k suffix and removes trailing .0', () => {
    expect(formatCompactMetric(1000)).toBe('1k');
    expect(formatCompactMetric(1200)).toBe('1.2k');
    expect(formatCompactMetric(1250)).toBe('1.3k');
    expect(formatCompactMetric(10000)).toBe('10k');
    expect(formatCompactMetric(10500)).toBe('10.5k');
  });

  it('formats large thousands without decimals for clean display', () => {
    expect(formatCompactMetric(100000)).toBe('100k');
    expect(formatCompactMetric(125000)).toBe('125k');
    expect(formatCompactMetric(999900)).toBe('1000k');
  });

  it('formats millions with M suffix', () => {
    expect(formatCompactMetric(1000000)).toBe('1M');
    expect(formatCompactMetric(1500000)).toBe('1.5M');
    expect(formatCompactMetric(2000000)).toBe('2M');
  });

  it('handles negative, nullish, or invalid numbers by returning hyphen rather than simulating zero', () => {
    expect(formatCompactMetric(-5)).toBe('-');
    expect(formatCompactMetric(NaN)).toBe('-');
    expect(formatCompactMetric(Infinity)).toBe('-');
    expect(formatCompactMetric(null)).toBe('-');
    expect(formatCompactMetric(undefined)).toBe('-');
  });
});

describe('Language Colors & Collision Avoidance', () => {
  it('resolves canonical GitHub Linguist colors for known languages', () => {
    expect(getLanguageColor('TypeScript')).toBe(EXTENDED_LANGUAGE_COLORS.typescript);
    expect(getLanguageColor('JavaScript')).toBe(EXTENDED_LANGUAGE_COLORS.javascript);
    expect(getLanguageColor('Python')).toBe(EXTENDED_LANGUAGE_COLORS.python);
    expect(getLanguageColor('Rust')).toBe(EXTENDED_LANGUAGE_COLORS.rust);
  });

  it('provides a deterministic fallback color for unknown languages', () => {
    const colorA = getLanguageColor('CustomLangFoo');
    const colorB = getLanguageColor('CustomLangFoo');
    expect(colorA).toBe(colorB);
    expect(colorA.startsWith('#')).toBe(true);
  });

  it('resolves distinct colors when multiple languages share the same initial color', () => {
    const collidingLanguages = [
      { name: 'Lang1', color: '#3178C6', size: 100 },
      { name: 'Lang2', color: '#3178C6', size: 80 },
      { name: 'Lang3', color: '#3178C6', size: 60 },
    ];

    const resolved = resolveDistinctLanguageColors(collidingLanguages);
    expect(resolved).toHaveLength(3);

    const colors = resolved.map((l) => l.color.toLowerCase());
    const uniqueColors = new Set(colors);
    // Every language must have a unique color
    expect(uniqueColors.size).toBe(3);
  });
});

describe('Domain Schemas - Extended Metrics & Visibility', () => {
  it('CardVisibilitySchema includes issues and discussions defaulting to false', () => {
    const parsed = CardVisibilitySchema.parse({
      stars: true,
      forks: true,
      release: true,
      license: true,
      contributors: true,
      techStack: true,
    });
    expect(parsed.issues).toBe(false);
    expect(parsed.discussions).toBe(false);
  });

  it('RepoMetadataSchema accepts optional contributorsCount, openIssuesCount, discussionsCount', () => {
    const validRepo = {
      owner: { login: 'vercel', avatarUrl: 'https://github.com/vercel.png', isOrg: true },
      name: 'next.js',
      description: 'The React Framework',
      homepageUrl: 'https://nextjs.org',
      stars: 125000,
      forks: 26000,
      primaryLanguage: { name: 'JavaScript', color: '#f7df1e' },
      languages: [{ name: 'JavaScript', color: '#f7df1e', size: 1000 }],
      topics: ['react', 'nextjs'],
      license: 'MIT',
      latestRelease: { tag: 'v15.0.0', publishedAt: '2026-10-01T00:00:00Z' },
      contributors: [{ login: 'timneutkens', avatarUrl: 'https://github.com/timneutkens.png' }],
      contributorsCount: 3500,
      openIssuesCount: 420,
      discussionsCount: 1500,
    };

    const parsed = RepoMetadataSchema.parse(validRepo);
    expect(parsed.contributorsCount).toBe(3500);
    expect(parsed.openIssuesCount).toBe(420);
    expect(parsed.discussionsCount).toBe(1500);
  });
});
