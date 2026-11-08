import { describe, it, expect } from 'vitest';
import { FreeTierEntitlement } from '@/core/adapters/local/FreeTierEntitlement';
import { InMemoryBrandKitStorage } from '@/core/adapters/local/InMemoryBrandKitStorage';
import type { BrandKit } from '@/core/domain/types';
import {
  ContentAlignSchema,
  CardVisibilitySchema,
  CardConfigSchema,
  type ContentAlign,
} from '@/core/domain/types';

describe('Core Ports & Adapters Bootstrap', () => {
  it('FreeTierEntitlement provides 0 watermarks and free tier defaults', () => {
    const entitlement = new FreeTierEntitlement();
    expect(entitlement.getTier()).toBe('free');
    expect(entitlement.hasWatermark()).toBe(false);
    expect(entitlement.maxStoredBrandKits()).toBe(10);
    expect(entitlement.canAccessFeature('anything')).toBe(true);
  });

  it('InMemoryBrandKitStorage stores, retrieves, lists, and deletes brand kits', async () => {
    const storage = new InMemoryBrandKitStorage();
    const sampleKit: BrandKit = {
      id: 'kit-1',
      name: 'Default Minimal',
      templateId: 'linear-minimal',
      palette: {
        background: '#0a0a0a',
        text: '#ffffff',
        accent: '#3b82f6',
        border: '#1f2937',
      },
      typography: {
        fontHeading: 'Geist',
        fontMono: 'JetBrains Mono',
      },
      backgroundPattern: {
        id: 'architectural-grid',
        opacity: 0.4,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await storage.saveBrandKit(sampleKit);
    const retrieved = await storage.getBrandKit('kit-1');
    expect(retrieved).toEqual(sampleKit);

    const list = await storage.listBrandKits();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe('kit-1');

    const deleted = await storage.deleteBrandKit('kit-1');
    expect(deleted).toBe(true);
    expect(await storage.getBrandKit('kit-1')).toBeNull();
  });

  describe('Domain Schemas: ContentAlign & Extended CardVisibility', () => {
    it('ContentAlignSchema validates left and center, defaults to left, and rejects invalid', () => {
      expect(ContentAlignSchema.parse(undefined)).toBe('left');
      expect(ContentAlignSchema.parse('left')).toBe('left');
      expect(ContentAlignSchema.parse('center')).toBe('center');

      const alignTypeCheck: ContentAlign = 'center';
      expect(alignTypeCheck).toBe('center');

      expect(() => ContentAlignSchema.parse('right')).toThrow();
      expect(() => ContentAlignSchema.parse('justify')).toThrow();
    });

    it('CardVisibilitySchema defaults author, tagline, installCommand to true', () => {
      const parsed = CardVisibilitySchema.parse({
        stars: true,
        forks: true,
        release: true,
        license: true,
        contributors: true,
        techStack: true,
      });

      expect(parsed.author).toBe(true);
      expect(parsed.tagline).toBe(true);
      expect(parsed.installCommand).toBe(true);
      expect(parsed.languageLogos).toBe(true);
    });

    it('CardConfigSchema parses contentAlign and respects custom visibility toggles', () => {
      const parsed = CardConfigSchema.parse({
        templateId: 'linear-minimal',
        title: 'Custom Title',
        tagline: 'Custom Tagline',
        contentAlign: 'center',
        palette: {
          background: '#000000',
          text: '#ffffff',
          accent: '#3b82f6',
          border: '#333333',
        },
        typography: {
          fontHeading: 'Inter',
          fontMono: 'JetBrains Mono',
        },
        backgroundPattern: {
          id: 'architectural-grid',
          opacity: 0.5,
        },
        visibility: {
          stars: false,
          forks: false,
          release: false,
          license: false,
          contributors: false,
          techStack: false,
          author: false,
          tagline: false,
          installCommand: false,
        },
      });

      expect(parsed.contentAlign).toBe('center');
      expect(parsed.visibility.author).toBe(false);
      expect(parsed.visibility.tagline).toBe(false);
      expect(parsed.visibility.installCommand).toBe(false);
    });
  });
});
