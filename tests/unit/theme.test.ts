import { describe, it, expect } from 'vitest';
import { ThemeEngine, PRESET_PALETTES } from '@/core/theme/ThemeEngine';
import { PaletteSchema } from '@/core/domain/schemas';

describe('ThemeEngine', () => {
  describe('Preset Palettes', () => {
    it('all preset palettes validate against PaletteSchema', () => {
      for (const [name, palette] of Object.entries(PRESET_PALETTES)) {
        const parsed = PaletteSchema.safeParse(palette);
        expect(parsed.success, `Preset ${name} failed schema validation`).toBe(true);
      }
    });

    it('preset palettes have proper contrast on primary text', () => {
      for (const [name, palette] of Object.entries(PRESET_PALETTES)) {
        const rating = ThemeEngine.checkWcag(palette.background, palette.text);
        expect(rating.aa, `Preset ${name} does not meet WCAG AA: ratio ${rating.ratio}`).toBe(true);
      }
    });
  });

  describe('getContrastRatio & checkWcag', () => {
    it('calculates 21:1 for pure black on pure white', () => {
      const ratio = ThemeEngine.getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBe(21);
    });

    it('calculates 1:1 for identical colors', () => {
      const ratio = ThemeEngine.getContrastRatio('#123456', '#123456');
      expect(ratio).toBe(1);
    });

    it('evaluates WCAG AA and AAA thresholds correctly', () => {
      const high = ThemeEngine.checkWcag('#000000', '#ffffff');
      expect(high.aa).toBe(true);
      expect(high.aaa).toBe(true);
      expect(high.levelText).toBe('AAA');

      const low = ThemeEngine.checkWcag('#777777', '#888888');
      expect(low.aa).toBe(false);
      expect(low.aaa).toBe(false);
      expect(low.levelText).toBe('Fail');
    });

    it('returns ratio 1 for invalid colors gracefully', () => {
      const ratio = ThemeEngine.getContrastRatio('invalid-color', '#ffffff');
      expect(ratio).toBe(1);
    });
  });

  describe('ensureReadableText', () => {
    it('returns preferred text if contrast is already above threshold', () => {
      const text = ThemeEngine.ensureReadableText('#000000', '#ffffff');
      expect(text.toLowerCase()).toBe('#ffffff');
    });

    it('adjusts dark text on dark background to be light and readable', () => {
      const adjusted = ThemeEngine.ensureReadableText('#0a0a0a', '#1a1a1a');
      const ratio = ThemeEngine.getContrastRatio('#0a0a0a', adjusted);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('adjusts light text on light background to be dark and readable', () => {
      const adjusted = ThemeEngine.ensureReadableText('#ffffff', '#f0f0f0');
      const ratio = ThemeEngine.getContrastRatio('#ffffff', adjusted);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('generatePaletteFromLanguageColor', () => {
    it('generates a valid dark mode palette from a language hex', () => {
      const palette = ThemeEngine.generatePaletteFromLanguageColor('#3178C6', 'dark');
      const parseResult = PaletteSchema.safeParse(palette);
      expect(parseResult.success).toBe(true);

      const textRating = ThemeEngine.checkWcag(palette.background, palette.text);
      expect(textRating.aa).toBe(true);
    });

    it('generates a valid light mode palette from a language hex', () => {
      const palette = ThemeEngine.generatePaletteFromLanguageColor('#3178C6', 'light');
      const parseResult = PaletteSchema.safeParse(palette);
      expect(parseResult.success).toBe(true);

      const textRating = ThemeEngine.checkWcag(palette.background, palette.text);
      expect(textRating.aa).toBe(true);
    });

    it('handles fallback when given an invalid hex color', () => {
      const palette = ThemeEngine.generatePaletteFromLanguageColor('non-color', 'dark');
      expect(PaletteSchema.safeParse(palette).success).toBe(true);
    });
  });
});
