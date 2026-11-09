import { describe, it, expect } from 'vitest';
import { PatternPresetSchema, type PatternPreset } from '@/core/domain/schemas';
import { InMemoryPatternPresetStorage } from '@/core/adapters/local/InMemoryPatternPresetStorage';
import { FreeTierEntitlement } from '@/core/adapters/local/FreeTierEntitlement';

describe('PatternPresetVault & Storage', () => {
  const samplePreset: PatternPreset = {
    id: 'pat_test_1',
    name: 'Cyberpunk Neon Grid',
    pattern: {
      id: 'architectural-grid',
      opacity: 0.7,
      scale: 1.5,
      color: '#00ffcc',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('validates a well-formed PatternPreset against PatternPresetSchema', () => {
    const result = PatternPresetSchema.safeParse(samplePreset);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pattern.color).toBe('#00ffcc');
      expect(result.data.pattern.scale).toBe(1.5);
    }
  });

  it('validates a PatternPreset with customBackgroundUrl', () => {
    const presetWithUrl: PatternPreset = {
      ...samplePreset,
      id: 'pat_test_img',
      pattern: {
        id: 'custom-image',
        opacity: 0.5,
        scale: 1,
      },
      customBackgroundUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA',
    };
    const result = PatternPresetSchema.safeParse(presetWithUrl);
    expect(result.success).toBe(true);
  });

  it('rejects invalid PatternPreset (e.g. empty name or invalid pattern color)', () => {
    const invalidPreset = {
      ...samplePreset,
      name: '',
      pattern: {
        ...samplePreset.pattern,
        color: 'invalid-hex-color',
      },
    };
    const result = PatternPresetSchema.safeParse(invalidPreset);
    expect(result.success).toBe(false);
  });

  it('respects Free Tier limit of 10 Pattern Presets', () => {
    const entitlement = new FreeTierEntitlement();
    expect(entitlement.maxStoredPatternPresets()).toBe(10);
  });

  it('stores, lists, retrieves, and deletes Pattern Presets in storage', async () => {
    const storage = new InMemoryPatternPresetStorage();

    await storage.savePatternPreset(samplePreset);
    const retrieved = await storage.getPatternPreset('pat_test_1');
    expect(retrieved?.name).toBe('Cyberpunk Neon Grid');
    expect(retrieved?.pattern.color).toBe('#00ffcc');

    const all = await storage.listPatternPresets();
    expect(all.length).toBe(1);

    const deleted = await storage.deletePatternPreset('pat_test_1');
    expect(deleted).toBe(true);

    const afterDelete = await storage.getPatternPreset('pat_test_1');
    expect(afterDelete).toBeNull();
  });
});
