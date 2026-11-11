import { describe, expect, it } from 'vitest';
import { escapeXml } from '@/core/security/xml';

describe('escapeXml', () => {
  it('escapes XML metacharacters so untrusted text cannot become markup', () => {
    expect(escapeXml(`</text><script>alert('x')</script>`)).toBe(
      '&lt;/text&gt;&lt;script&gt;alert(&apos;x&apos;)&lt;/script&gt;'
    );
  });

  it('escapes ampersands and quotes', () => {
    expect(escapeXml(`a & b "c" 'd'`)).toBe('a &amp; b &quot;c&quot; &apos;d&apos;');
  });
});
