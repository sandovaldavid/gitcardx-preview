import { describe, it, expect } from 'vitest';
import { detectTechStack, suggestInstallCommand } from '@/core/domain/stackMapper';

describe('stackMapper', () => {
  describe('detectTechStack', () => {
    it('detects primary and secondary languages', () => {
      const detected = detectTechStack(
        [
          { name: 'TypeScript', color: '#3178C6' },
          { name: 'Rust', color: '#DEA584' },
        ],
        []
      );

      expect(detected.length).toBe(2);
      expect(detected[0].id).toBe('typescript');
      expect(detected[1].id).toBe('rust');
    });

    it('detects frameworks from topics and avoids duplicates', () => {
      const detected = detectTechStack(
        [{ name: 'TypeScript', color: '#3178C6' }],
        ['react', 'tailwindcss', 'nextjs', 'typescript']
      );

      // typescript should only appear once
      const ids = detected.map((d) => d.id);
      expect(ids).toContain('typescript');
      expect(ids).toContain('react');
      expect(ids).toContain('tailwindcss');
      expect(ids).toContain('nextjs');
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('respects maxItems limit', () => {
      const detected = detectTechStack(
        [
          { name: 'TypeScript', color: '#3178C6' },
          { name: 'Python', color: '#3776AB' },
          { name: 'Go', color: '#00ADD8' },
        ],
        ['docker', 'kubernetes', 'redis', 'postgresql'],
        3
      );

      expect(detected.length).toBe(3);
    });

    it('returns empty array when no known technologies are present', () => {
      const detected = detectTechStack(
        [{ name: 'UnknownLang123', color: '#999999' }],
        ['unknown-topic-foo', 'custom-tag-bar']
      );

      expect(detected).toEqual([]);
    });
  });

  describe('suggestInstallCommand', () => {
    it('suggests cargo for Rust projects', () => {
      expect(
        suggestInstallCommand([{ name: 'Rust' }], ['cli'], 'my-tool')
      ).toBe('cargo add my-tool');
    });

    it('suggests pip for Python projects', () => {
      expect(
        suggestInstallCommand([{ name: 'Python' }], ['ai'], 'ml-agent')
      ).toBe('pip install ml-agent');
    });

    it('suggests go get with full repository path for Go projects', () => {
      expect(
        suggestInstallCommand([{ name: 'Go' }], [], 'fiber', 'gofiber')
      ).toBe('go get github.com/gofiber/fiber');
    });

    it('suggests docker pull for dockerized projects', () => {
      expect(
        suggestInstallCommand([{ name: 'Shell' }], ['docker', 'container'], 'cool-app', 'myorg')
      ).toBe('docker pull myorg/cool-app');
    });

    it('suggests npx for CLI / terminal tools', () => {
      expect(
        suggestInstallCommand([], ['cli', 'terminal'], 'create-app')
      ).toBe('npx create-app');
    });

    it('defaults to bun add for general JS/TS repositories', () => {
      expect(
        suggestInstallCommand([{ name: 'TypeScript' }], [], 'gitcardx-preview')
      ).toBe('bun add gitcardx-preview');
    });
  });
});
