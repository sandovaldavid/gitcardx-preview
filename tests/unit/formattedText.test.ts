import { describe, it, expect } from 'vitest';
import { parseAccentSegments } from '@/cards/primitives/FormattedText';

describe('FormattedText parser', () => {
  it('handles empty string', () => {
    expect(parseAccentSegments('')).toEqual([]);
  });

  it('handles text without asterisks', () => {
    expect(parseAccentSegments('Plain text here')).toEqual([
      { text: 'Plain text here', isAccent: false },
    ]);
  });

  it('handles single asterisk accent *word*', () => {
    const result = parseAccentSegments('Fast *modern* developer tools');
    expect(result).toEqual([
      { text: 'Fast ', isAccent: false },
      { text: 'modern', isAccent: true },
      { text: ' developer tools', isAccent: false },
    ]);
  });

  it('handles double asterisk accent **word** without collapsing spaces', () => {
    const result = parseAccentSegments('Fast **modern** developer tools');
    expect(result).toEqual([
      { text: 'Fast ', isAccent: false },
      { text: 'modern', isAccent: true },
      { text: ' developer tools', isAccent: false },
    ]);
    expect(result[0].text.endsWith(' ')).toBe(true);
    expect(result[2].text.startsWith(' ')).toBe(true);
  });

  it('handles accent at the very start', () => {
    const result = parseAccentSegments('**Instant** GitHub previews');
    expect(result).toEqual([
      { text: 'Instant', isAccent: true },
      { text: ' GitHub previews', isAccent: false },
    ]);
  });

  it('handles accent at the very end', () => {
    const result = parseAccentSegments('Ready for **production**');
    expect(result).toEqual([
      { text: 'Ready for ', isAccent: false },
      { text: 'production', isAccent: true },
    ]);
  });

  it('handles multiple accents mixed with single and double asterisks', () => {
    const result = parseAccentSegments('Built with *Next.js* and **Satori**');
    expect(result).toEqual([
      { text: 'Built with ', isAccent: false },
      { text: 'Next.js', isAccent: true },
      { text: ' and ', isAccent: false },
      { text: 'Satori', isAccent: true },
    ]);
  });
});
