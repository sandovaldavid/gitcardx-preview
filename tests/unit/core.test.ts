import { describe, it, expect } from 'vitest';
import { FreeTierEntitlement } from '@/core/adapters/local/FreeTierEntitlement';
import { InMemoryBrandKitStorage } from '@/core/adapters/local/InMemoryBrandKitStorage';
import type { BrandKit } from '@/core/domain/types';

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
});
