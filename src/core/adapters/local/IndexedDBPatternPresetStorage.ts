import { get, set, del, keys } from 'idb-keyval';
import type { PatternPresetStoragePort } from '../../ports/PatternPresetStoragePort';
import type { PatternPreset } from '../../domain/types';

const PATTERN_PRESET_KEY_PREFIX = 'gitframe_pattern_preset_';

export class IndexedDBPatternPresetStorage implements PatternPresetStoragePort {
  async listPatternPresets(): Promise<PatternPreset[]> {
    if (typeof window === 'undefined') return [];
    try {
      const allKeys = await keys();
      const presetKeys = allKeys.filter(
        (key): key is string => typeof key === 'string' && key.startsWith(PATTERN_PRESET_KEY_PREFIX)
      );
      const presets: PatternPreset[] = [];
      for (const k of presetKeys) {
        const item = await get<PatternPreset>(k);
        if (item) presets.push(item);
      }
      return presets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    } catch {
      return [];
    }
  }

  async getPatternPreset(id: string): Promise<PatternPreset | null> {
    if (typeof window === 'undefined') return null;
    try {
      const item = await get<PatternPreset>(`${PATTERN_PRESET_KEY_PREFIX}${id}`);
      return item || null;
    } catch {
      return null;
    }
  }

  async savePatternPreset(preset: PatternPreset): Promise<void> {
    if (typeof window === 'undefined') return;
    await set(`${PATTERN_PRESET_KEY_PREFIX}${preset.id}`, preset);
  }

  async deletePatternPreset(id: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    try {
      await del(`${PATTERN_PRESET_KEY_PREFIX}${id}`);
      return true;
    } catch {
      return false;
    }
  }
}
