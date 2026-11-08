import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getLanguageLogo, LANGUAGE_LOGOS, SLUG_ALIASES } from '@/cards/icons/languageLogos';
import { TechIcon } from '@/cards/primitives/TechIcon';

describe('Language Logos Registry & getLanguageLogo', () => {
  it('populates top GitHub Octoverse language logos', () => {
    const requiredLanguages = [
      'typescript',
      'javascript',
      'python',
      'java',
      'csharp',
      'cpp',
      'c',
      'php',
      'go',
      'rust',
      'ruby',
      'kotlin',
      'swift',
      'dart',
      'html5',
      'css',
      'lua',
      'scala',
      'solidity',
      'bash',
    ];

    for (const slug of requiredLanguages) {
      const logo = LANGUAGE_LOGOS[slug];
      expect(logo, `Logo for ${slug} should exist`).toBeDefined();
      expect(logo.slug).toBe(slug);
      expect(logo.svg).toContain('<svg');
      expect(logo.dataUri).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(logo.publicPath).toBe(`/logos/languages/${slug}.svg`);
    }
  });

  it('resolves canonical slugs accurately', () => {
    const ts = getLanguageLogo('typescript');
    expect(ts).toBeDefined();
    expect(ts?.slug).toBe('typescript');
    expect(ts?.name).toBe('TypeScript');

    const py = getLanguageLogo('python');
    expect(py?.slug).toBe('python');
  });

  it('resolves common aliases and variations', () => {
    expect(getLanguageLogo('ts')?.slug).toBe('typescript');
    expect(getLanguageLogo('js')?.slug).toBe('javascript');
    expect(getLanguageLogo('py')?.slug).toBe('python');
    expect(getLanguageLogo('rs')?.slug).toBe('rust');
    expect(getLanguageLogo('golang')?.slug).toBe('go');
    expect(getLanguageLogo('c#')?.slug).toBe('csharp');
    expect(getLanguageLogo('cs')?.slug).toBe('csharp');
    expect(getLanguageLogo('c++')?.slug).toBe('cpp');
    expect(getLanguageLogo('cplusplus')?.slug).toBe('cpp');
    expect(getLanguageLogo('html')?.slug).toBe('html5');
    expect(getLanguageLogo('css3')?.slug).toBe('css');
    expect(getLanguageLogo('sh')?.slug).toBe('bash');
    expect(getLanguageLogo('shell')?.slug).toBe('bash');
    expect(getLanguageLogo('kt')?.slug).toBe('kotlin');
    expect(getLanguageLogo('rb')?.slug).toBe('ruby');
    expect(getLanguageLogo('sol')?.slug).toBe('solidity');
  });

  it('handles case-insensitivity and whitespace gracefully', () => {
    expect(getLanguageLogo('  TypeScript  ')?.slug).toBe('typescript');
    expect(getLanguageLogo('PYTHON')?.slug).toBe('python');
    expect(getLanguageLogo('C#')?.slug).toBe('csharp');
    expect(getLanguageLogo('Go')?.slug).toBe('go');
    expect(getLanguageLogo('Rust')?.slug).toBe('rust');
  });

  it('returns null for unknown languages or empty queries', () => {
    expect(getLanguageLogo('')).toBeNull();
    expect(getLanguageLogo(null)).toBeNull();
    expect(getLanguageLogo(undefined)).toBeNull();
    expect(getLanguageLogo('non_existent_obscure_lang_9999')).toBeNull();
  });

  it('exposes valid SLUG_ALIASES mapping', () => {
    expect(SLUG_ALIASES['c#']).toBe('csharp');
    expect(SLUG_ALIASES['c++']).toBe('cpp');
    expect(SLUG_ALIASES['ts']).toBe('typescript');
    expect(SLUG_ALIASES['js']).toBe('javascript');
  });
});

describe('TechIcon Component', () => {
  it('renders official multi-colored SVG img tag when showOfficialLogo is true', () => {
    const html = renderToString(
      React.createElement(TechIcon, {
        name: 'TypeScript',
        id: 'typescript',
        size: 16,
        showOfficialLogo: true,
      })
    );

    const tsLogo = getLanguageLogo('typescript');
    expect(html).toContain('<img');
    expect(html).toContain(`src="${tsLogo?.dataUri}"`);
    expect(html).toContain('width="16"');
    expect(html).toContain('height="16"');
  });

  it('resolves by id when available', () => {
    const html = renderToString(
      React.createElement(TechIcon, {
        name: 'My Rust Project',
        id: 'rust',
        size: 20,
        showOfficialLogo: true,
      })
    );

    const rustLogo = getLanguageLogo('rust');
    expect(html).toContain(`src="${rustLogo?.dataUri}"`);
  });

  it('resolves by name when id is omitted', () => {
    const html = renderToString(
      React.createElement(TechIcon, {
        name: 'Python',
        size: 14,
        showOfficialLogo: true,
      })
    );

    const pyLogo = getLanguageLogo('python');
    expect(html).toContain(`src="${pyLogo?.dataUri}"`);
  });

  it('renders colored circle fallback when showOfficialLogo is false', () => {
    const html = renderToString(
      React.createElement(TechIcon, {
        name: 'TypeScript',
        id: 'typescript',
        color: '#ff0000',
        showOfficialLogo: false,
      })
    );

    expect(html).not.toContain('<img');
    expect(html).toContain('<div');
    expect(html).toContain('background-color:#ff0000');
    expect(html).toContain('border-radius:50%');
  });

  it('renders colored circle fallback when no official logo exists', () => {
    const html = renderToString(
      React.createElement(TechIcon, {
        name: 'ObscureLangX',
        color: '#10b981',
        showOfficialLogo: true,
      })
    );

    expect(html).not.toContain('<img');
    expect(html).toContain('<div');
    expect(html).toContain('background-color:#10b981');
    expect(html).toContain('border-radius:50%');
  });
});
