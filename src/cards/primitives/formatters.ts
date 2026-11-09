/**
 * Standard compact metric formatter for GitHub numbers (stars, forks, issues, etc.).
 * Produces clean, readable abbreviations (e.g. 1.2k, 10k, 125k, 1M, 2.5M)
 * without trailing zeros (1.0k -> 1k).
 */
export function formatCompactMetric(num: number): string {
  if (num < 0 || !Number.isFinite(num)) return '0';

  if (num >= 1_000_000) {
    const val = (num / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `${val}M`;
  }
  if (num >= 100_000) {
    return `${Math.round(num / 1_000)}k`;
  }
  if (num >= 1_000) {
    const val = (num / 1_000).toFixed(1).replace(/\.0$/, '');
    return `${val}k`;
  }
  return String(Math.round(num));
}
