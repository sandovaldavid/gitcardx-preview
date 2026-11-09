import { describe, it, expect } from 'vitest';
import { BrandKitSchema, type BrandKit } from '@/core/domain/schemas';
import { InMemoryBrandKitStorage } from '@/core/adapters/local/InMemoryBrandKitStorage';
import { FreeTierEntitlement } from '@/core/adapters/local/FreeTierEntitlement';

describe('BrandKitVault & Storage', () => {
  const sampleKit: BrandKit = {
    id: 'bk_test_1',
    name: 'Production Minimal',
    templateId: 'linear-minimal',
    palette: {
      background: '#090d16',
      text: '#f8fafc',
      accent: '#38bdf8',
      border: '#1e293b',
    },
    typography: {
      fontHeading: 'Inter',
      fontMono: 'JetBrains Mono',
    },
    backgroundPattern: {
      id: 'architectural-grid',
      opacity: 0.45,
    },
    signature: 'Built by OSS community',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('validates a well-formed BrandKit against BrandKitSchema', () => {
    const result = BrandKitSchema.safeParse(sampleKit);
    expect(result.success).toBe(true);
  });

  it('validates a BrandKit with customBackgroundUrl and pattern scale', () => {
    const kitWithCustomBg: BrandKit = {
      ...sampleKit,
      id: 'bk_custom_bg',
      backgroundPattern: {
        id: 'custom-image',
        opacity: 0.6,
        scale: 1.25,
      },
      customBackgroundUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
    };
    const result = BrandKitSchema.safeParse(kitWithCustomBg);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customBackgroundUrl).toBe(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA'
      );
      expect(result.data.backgroundPattern.scale).toBe(1.25);
    }
  });

  it('rejects invalid BrandKit (e.g. invalid CSS color format or empty name)', () => {
    const invalidKit = {
      ...sampleKit,
      name: '',
      palette: {
        ...sampleKit.palette,
        accent: 'not-a-color-at-all',
      },
    };

    const result = BrandKitSchema.safeParse(invalidKit);
    expect(result.success).toBe(false);
  });

  it('respects Free Tier limit of 10 Brand Kits', () => {
    const entitlement = new FreeTierEntitlement();
    expect(entitlement.maxStoredBrandKits()).toBe(10);
  });

  it('stores, lists, retrieves, and deletes Brand Kits in storage', async () => {
    const storage = new InMemoryBrandKitStorage();

    await storage.saveBrandKit(sampleKit);
    const retrieved = await storage.getBrandKit('bk_test_1');
    expect(retrieved?.name).toBe('Production Minimal');
    expect(retrieved?.palette.accent).toBe('#38bdf8');

    const all = await storage.listBrandKits();
    expect(all.length).toBe(1);

    const deleted = await storage.deleteBrandKit('bk_test_1');
    expect(deleted).toBe(true);

    const afterDelete = await storage.getBrandKit('bk_test_1');
    expect(afterDelete).toBeNull();
  });

  it('exports and imports valid Brand Kits via JSON roundtrip', () => {
    const kits = [sampleKit];
    const jsonString = JSON.stringify(kits);
    const parsed = JSON.parse(jsonString);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(1);

    const validated = BrandKitSchema.safeParse(parsed[0]);
    expect(validated.success).toBe(true);
  });
});
