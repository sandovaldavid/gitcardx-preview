import type { PatternPresetStoragePort } from '../../ports/PatternPresetStoragePort';
import type { PatternPreset } from '../../domain/types';

export class InMemoryPatternPresetStorage implements PatternPresetStoragePort {
  private store = new Map<string, PatternPreset>();

  async listPatternPresets(): Promise<PatternPreset[]> {
    return Array.from(this.store.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getPatternPreset(id: string): Promise<PatternPreset | null> {
    return this.store.get(id) || null;
  }

  async savePatternPreset(preset: PatternPreset): Promise<void> {
    this.store.set(preset.id, preset);
  }

  async deletePatternPreset(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
