import { colord } from 'colord';

/**
 * Canonical GitHub Linguist colors for major programming and markup languages.
 */
export const EXTENDED_LANGUAGE_COLORS: Record<string, string> = {
  typescript: '#3178C6',
  javascript: '#F7DF1E',
  python: '#3776AB',
  rust: '#DEA584',
  go: '#00ADD8',
  html: '#E34F26',
  css: '#1572B6',
  java: '#B07219',
  c: '#555555',
  'c++': '#F34B7D',
  'c#': '#178600',
  ruby: '#701516',
  php: '#4F5D95',
  swift: '#F05138',
  kotlin: '#A97BFF',
  dart: '#00B4AB',
  elixir: '#6E4A7E',
  shell: '#89E051',
  bash: '#89E051',
  vue: '#41B883',
  svelte: '#FF3E00',
  astro: '#FF5A03',
  scala: '#DC322F',
  r: '#198CE7',
  lua: '#000080',
  zig: '#EC915C',
  haskell: '#5E5086',
  clojure: '#DB5855',
  julia: '#A270BA',
  nix: '#7E7EFF',
  solidity: '#AA6746',
  ocaml: '#3BE133',
  perl: '#0298C3',
  erlang: '#B83998',
  dockerfile: '#384D54',
  graphql: '#E10098',
  sql: '#E38C00',
  markdown: '#083FA1',
  json: '#292929',
  yaml: '#CB171E',
  toml: '#9C4221',
  powershell: '#012456',
  sass: '#A53B70',
  scss: '#C6538C',
  less: '#1D365D',
  fortran: '#4D41B1',
  matlab: '#E16737',
  viml: '#199F4B',
  assembly: '#6E4C13',
};

// Fallback palette with high contrast between adjacent hues
const DIVERSE_PALETTE = [
  '#3178C6', // Blue
  '#F7DF1E', // Yellow
  '#DEA584', // Salmon
  '#41B883', // Emerald
  '#A97BFF', // Purple
  '#FF3E00', // Red-Orange
  '#00ADD8', // Cyan
  '#FF5A03', // Deep Orange
  '#F34B7D', // Magenta
  '#00B4AB', // Teal
];

/**
 * Retrieves the canonical color for a language, or deterministically derives a unique color.
 */
export function getLanguageColor(name: string): string {
  if (!name) return '#3178C6';
  const normalized = name.toLowerCase().trim();
  if (EXTENDED_LANGUAGE_COLORS[normalized]) {
    return EXTENDED_LANGUAGE_COLORS[normalized];
  }

  // Deterministic fallback based on name hash
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DIVERSE_PALETTE.length;
  return DIVERSE_PALETTE[index];
}

/**
 * Ensures that no two languages in a given repository share the exact same color,
 * avoiding visual ambiguity in the proportion bar and legend dots.
 */
export function resolveDistinctLanguageColors<T extends { name: string; color?: string | null }>(
  languages: T[]
): Array<T & { color: string }> {
  const usedColors = new Set<string>();

  return languages.map((lang, index) => {
    let color =
      lang.color && colord(lang.color).isValid()
        ? colord(lang.color).toHex()
        : getLanguageColor(lang.name);

    // If color collides with an earlier language in the same list, resolve with a distinct shift
    if (usedColors.has(color.toLowerCase())) {
      let candidate = color;
      let attempts = 0;

      while (usedColors.has(candidate.toLowerCase()) && attempts < 8) {
        // Rotate hue by 45 degrees per attempt
        candidate = colord(candidate)
          .rotate(45 + attempts * 15)
          .toHex();
        attempts++;
      }

      if (usedColors.has(candidate.toLowerCase())) {
        candidate = DIVERSE_PALETTE[index % DIVERSE_PALETTE.length];
      }

      color = candidate;
    }

    usedColors.add(color.toLowerCase());
    return {
      ...lang,
      color,
    };
  });
}
