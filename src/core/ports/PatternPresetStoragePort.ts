import type { PatternPreset } from '../domain/types';

export interface PatternPresetStoragePort {
  listPatternPresets(): Promise<PatternPreset[]>;
  getPatternPreset(id: string): Promise<PatternPreset | null>;
  savePatternPreset(preset: PatternPreset): Promise<void>;
  deletePatternPreset(id: string): Promise<boolean>;
}
