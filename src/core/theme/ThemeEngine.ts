import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import type { Palette } from '../domain/schemas';

extend([a11yPlugin]);

export interface WcagRating {
  ratio: number;
  aa: boolean;
  aaa: boolean;
  levelText: 'AAA' | 'AA' | 'Fail';
}

export const PRESET_PALETTES: Record<string, Palette> = {
  'dark-oled': {
    background: '#000000',
    text: '#ffffff',
    accent: '#3b82f6',
    border: '#1f2937',
  },
  'github-dimmed': {
    background: '#1c2128',
    text: '#f0f6fc',
    accent: '#539bf5',
    border: '#373e47',
  },
  'slate-minimal': {
    background: '#0f172a',
    text: '#f8fafc',
    accent: '#38bdf8',
    border: '#1e293b',
  },
  nord: {
    background: '#2e3440',
    text: '#eceff4',
    accent: '#88c0d0',
    border: '#434c5e',
  },
  'catppuccin-mocha': {
    background: '#1e1e2e',
    text: '#cdd6f4',
    accent: '#cba6f7',
    border: '#313244',
  },
  'light-paper': {
    background: '#ffffff',
    text: '#0f172a',
    accent: '#2563eb',
    border: '#e2e8f0',
  },
};

export class ThemeEngine {
  /**
   * Returns high-contrast foreground color (#ffffff or #090d16) for a given surface.
   */
  static getContrastTextColor(surfaceColor: string): string {
    const c = colord(surfaceColor);
    if (!c.isValid()) return '#ffffff';
    const contrastWhite = c.contrast('#ffffff');
    const contrastBlack = c.contrast('#090d16');
    return contrastWhite >= contrastBlack ? '#ffffff' : '#090d16';
  }

  /**
   * Determines if a color represents a light surface.
   */
  static isLightColor(color: string): boolean {
    const c = colord(color);
    return c.isValid() ? c.isLight() : false;
  }

  /**
   * Calculates the exact WCAG contrast ratio between background and foreground.
   */
  static getContrastRatio(background: string, foreground: string): number {
    const bg = colord(background);
    const fg = colord(foreground);
    if (!bg.isValid() || !fg.isValid()) return 1;
    return Number(bg.contrast(fg).toFixed(2));
  }

  /**
   * Evaluates WCAG compliance for normal text (threshold: 4.5 AA / 7.0 AAA)
   * or large text (threshold: 3.0 AA / 4.5 AAA).
   */
  static checkWcag(background: string, foreground: string, isLargeText = false): WcagRating {
    const ratio = this.getContrastRatio(background, foreground);
    const aaThreshold = isLargeText ? 3.0 : 4.5;
    const aaaThreshold = isLargeText ? 4.5 : 7.0;

    const aa = ratio >= aaThreshold;
    const aaa = ratio >= aaaThreshold;
    const levelText = aaa ? 'AAA' : aa ? 'AA' : 'Fail';

    return { ratio, aa, aaa, levelText };
  }

  /**
   * Ensures text is readable against a background, adjusting brightness if below AA.
   */
  static ensureReadableText(
    background: string,
    preferredText = '#ffffff',
    isLargeText = false
  ): string {
    const bg = colord(background);
    let fg = colord(preferredText);

    if (!bg.isValid()) return preferredText;
    if (!fg.isValid()) fg = colord('#ffffff');

    const threshold = isLargeText ? 3.0 : 4.5;
    if (bg.contrast(fg) >= threshold) {
      return fg.toHex();
    }

    // If background is dark, brighten text towards white
    if (bg.isDark()) {
      let light = fg;
      for (let i = 0; i < 10; i++) {
        light = light.lighten(0.1);
        if (bg.contrast(light) >= threshold) return light.toHex();
      }
      return '#ffffff';
    }

    // If background is light, darken text towards black
    let dark = fg;
    for (let i = 0; i < 10; i++) {
      dark = dark.darken(0.1);
      if (bg.contrast(dark) >= threshold) return dark.toHex();
    }
    return '#090d16';
  }

  /**
   * Generates a harmonious palette based on a language color from GitHub API.
   */
  static generatePaletteFromLanguageColor(
    languageHex: string,
    mode: 'dark' | 'light' = 'dark'
  ): Palette {
    const baseColor = colord(languageHex).isValid() ? colord(languageHex) : colord('#3b82f6');

    if (mode === 'dark') {
      // Subtly tint deep background with language hue
      const background = colord({
        h: baseColor.toHsl().h,
        s: 18,
        l: 7,
      }).toHex();

      // Ensure accent has at least 4.5:1 contrast against dark background for WCAG AA
      let accent = baseColor;
      for (let i = 0; i < 10 && colord(background).contrast(accent) < 4.5; i++) {
        accent = accent.lighten(0.08);
      }

      // Border with subtle language tint
      const border = colord({
        h: baseColor.toHsl().h,
        s: 25,
        l: 16,
      }).toHex();

      return {
        background,
        text: '#f8fafc',
        accent: accent.toHex(),
        border,
      };
    }

    // Light mode
    const background = '#ffffff';

    // Ensure accent has at least 4.5:1 contrast against white for WCAG AA
    let accent = baseColor;
    for (let i = 0; i < 10 && colord(background).contrast(accent) < 4.5; i++) {
      accent = accent.darken(0.08);
    }

    const border = colord({
      h: baseColor.toHsl().h,
      s: 20,
      l: 90,
    }).toHex();

    return {
      background,
      text: '#0f172a',
      accent: accent.toHex(),
      border,
    };
  }
}
