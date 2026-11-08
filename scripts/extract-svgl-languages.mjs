import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_LOGOS_DIR = path.join(ROOT_DIR, 'public', 'logos', 'languages');
const TS_OUTPUT_PATH = path.join(ROOT_DIR, 'src', 'cards', 'icons', 'languageLogos.ts');

const SVGL_LANGUAGES_API = 'https://api.svgl.app/category/language';
const SVGL_ALL_API = 'https://api.svgl.app';

/**
 * Normalization map for GitHub Octoverse languages
 */
function getLanguageMetadata(item) {
  const title = item.title;
  const lower = title.toLowerCase().trim();

  switch (lower) {
    case 'typescript':
      return { slug: 'typescript', aliases: ['typescript', 'ts'] };
    case 'javascript':
      return { slug: 'javascript', aliases: ['javascript', 'js'] };
    case 'python':
      return { slug: 'python', aliases: ['python', 'py'] };
    case 'c#':
      return { slug: 'csharp', aliases: ['c#', 'csharp', 'cs', 'c-sharp'] };
    case 'c++':
      return { slug: 'cpp', aliases: ['c++', 'cpp', 'cplusplus', 'c-plusplus'] };
    case 'c':
      return { slug: 'c', aliases: ['c'] };
    case 'go':
      return { slug: 'go', aliases: ['go', 'golang'] };
    case 'rust':
      return { slug: 'rust', aliases: ['rust', 'rs'] };
    case 'java':
      return { slug: 'java', aliases: ['java'] };
    case 'ruby':
      return { slug: 'ruby', aliases: ['ruby', 'rb'] };
    case 'php':
      return { slug: 'php', aliases: ['php'] };
    case 'kotlin':
      return { slug: 'kotlin', aliases: ['kotlin', 'kt'] };
    case 'swift':
      return { slug: 'swift', aliases: ['swift'] };
    case 'dart':
      return { slug: 'dart', aliases: ['dart'] };
    case 'html5':
      return { slug: 'html5', aliases: ['html5', 'html'] };
    case 'css (new)':
      return { slug: 'css', aliases: ['css', 'css3', 'css-new'] };
    case 'css':
      return { slug: 'css-classic', aliases: ['css-classic', 'css-old'] };
    case 'lua':
      return { slug: 'lua', aliases: ['lua'] };
    case 'scala':
      return { slug: 'scala', aliases: ['scala'] };
    case 'solidity':
      return { slug: 'solidity', aliases: ['solidity', 'sol'] };
    case 'bash':
      return { slug: 'bash', aliases: ['bash', 'sh', 'shell', 'zsh'] };
    case 'zig':
      return { slug: 'zig', aliases: ['zig'] };
    case 'haskell':
      return { slug: 'haskell', aliases: ['haskell', 'hs'] };
    case 'matlab':
      return { slug: 'matlab', aliases: ['matlab'] };
    case 'r':
      return { slug: 'r', aliases: ['r'] };
    case 'julia':
      return { slug: 'julia', aliases: ['julia', 'jl'] };
    case 'markdown':
      return { slug: 'markdown', aliases: ['markdown', 'md'] };
    case 'gleam':
      return { slug: 'gleam', aliases: ['gleam'] };
    case 'svg':
      return { slug: 'svg', aliases: ['svg'] };
    case 'json':
      return { slug: 'json', aliases: ['json'] };
    case 'powershell':
      return { slug: 'powershell', aliases: ['powershell', 'ps1', 'pwsh'] };
    case 'terraform':
      return { slug: 'terraform', aliases: ['terraform', 'tf', 'hcl'] };
    case 'sass':
      return { slug: 'sass', aliases: ['sass', 'scss'] };
    case 'graphql':
      return { slug: 'graphql', aliases: ['graphql', 'gql'] };
    case 'cobol':
      return { slug: 'cobol', aliases: ['cobol'] };
    case 'fortran':
      return { slug: 'fortran', aliases: ['fortran'] };
    default: {
      const slug = lower.replace(/[^a-z0-9]/g, '');
      return { slug, aliases: [slug] };
    }
  }
}

const EXTRA_FRAMEWORK_DEFS = [
  { match: (t) => t === 'React', slug: 'react', aliases: ['react', 'reactjs'] },
  { match: (t) => t === 'Next.js', slug: 'nextjs', aliases: ['nextjs', 'next', 'next.js'] },
  { match: (t) => t === 'Vue', slug: 'vue', aliases: ['vue', 'vuejs', 'vue.js'] },
  { match: (t) => t === 'Svelte', slug: 'svelte', aliases: ['svelte', 'sveltejs'] },
  { match: (t) => t === 'Tailwind CSS', slug: 'tailwindcss', aliases: ['tailwind', 'tailwindcss'] },
  { match: (t) => t === 'Docker', slug: 'docker', aliases: ['docker'] },
  { match: (t) => t === 'Bun', slug: 'bun', aliases: ['bun'] },
  {
    match: (t) => t === 'Node.js',
    slug: 'node',
    aliases: ['node', 'nodejs', 'nodedotjs', 'node.js'],
  },
  { match: (t) => t === 'Astro', slug: 'astro', aliases: ['astro'] },
];

async function fetchSvg(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch SVG from ${url}: ${res.status} ${res.statusText}`);
  }
  return (await res.text()).trim();
}

function toBase64DataUri(svgString) {
  return `data:image/svg+xml;base64,${Buffer.from(svgString, 'utf-8').toString('base64')}`;
}

async function main() {
  console.log('[svgl:extract] Starting SVGL extraction...');
  await fs.mkdir(PUBLIC_LOGOS_DIR, { recursive: true });
  await fs.mkdir(path.dirname(TS_OUTPUT_PATH), { recursive: true });

  // 1. Fetch language category
  console.log(`[svgl:extract] Querying language category from ${SVGL_LANGUAGES_API}...`);
  const langRes = await fetch(SVGL_LANGUAGES_API);
  if (!langRes.ok) {
    throw new Error(`Failed to fetch language category: ${langRes.status} ${langRes.statusText}`);
  }
  const languageItems = await langRes.json();
  console.log(`[svgl:extract] Found ${languageItems.length} languages in SVGL.`);

  // 2. Fetch full catalog for extra framework logos
  console.log(`[svgl:extract] Querying full catalog from ${SVGL_ALL_API}...`);
  const allRes = await fetch(SVGL_ALL_API);
  let allItems = [];
  if (allRes.ok) {
    allItems = await allRes.json();
  }

  const itemsToProcess = [];

  for (const item of languageItems) {
    const meta = getLanguageMetadata(item);
    itemsToProcess.push({
      item,
      slug: meta.slug,
      name: item.title,
      aliases: meta.aliases,
    });
  }

  // Find extra frameworks
  for (const def of EXTRA_FRAMEWORK_DEFS) {
    const found = allItems.find((i) => def.match(i.title));
    if (found) {
      itemsToProcess.push({
        item: found,
        slug: def.slug,
        name: found.title,
        aliases: def.aliases,
      });
    }
  }

  console.log(`[svgl:extract] Downloading SVGs for ${itemsToProcess.length} items...`);

  const registry = {};
  const aliasMap = {};

  for (const entry of itemsToProcess) {
    const { item, slug, name, aliases } = entry;
    const route = item.route;

    let defaultSvg = '';
    let darkSvg = null;
    let lightSvg = null;

    try {
      if (typeof route === 'string') {
        defaultSvg = await fetchSvg(route);
        await fs.writeFile(path.join(PUBLIC_LOGOS_DIR, `${slug}.svg`), defaultSvg, 'utf-8');
      } else if (typeof route === 'object' && route !== null) {
        if (route.dark) {
          darkSvg = await fetchSvg(route.dark);
          await fs.writeFile(path.join(PUBLIC_LOGOS_DIR, `${slug}-dark.svg`), darkSvg, 'utf-8');
        }
        if (route.light) {
          lightSvg = await fetchSvg(route.light);
          await fs.writeFile(path.join(PUBLIC_LOGOS_DIR, `${slug}-light.svg`), lightSvg, 'utf-8');
        }

        // For card backgrounds (dark by default), prioritize darkSvg if available, else lightSvg
        defaultSvg = darkSvg || lightSvg || '';
        await fs.writeFile(path.join(PUBLIC_LOGOS_DIR, `${slug}.svg`), defaultSvg, 'utf-8');
      }

      const defaultDataUri = toBase64DataUri(defaultSvg);
      const darkDataUri = darkSvg ? toBase64DataUri(darkSvg) : undefined;
      const lightDataUri = lightSvg ? toBase64DataUri(lightSvg) : undefined;

      registry[slug] = {
        id: slug,
        name,
        slug,
        svg: defaultSvg,
        dataUri: defaultDataUri,
        ...(darkSvg ? { darkSvg, darkDataUri } : {}),
        ...(lightSvg ? { lightSvg, lightDataUri } : {}),
        publicPath: `/logos/languages/${slug}.svg`,
      };

      for (const alias of aliases) {
        aliasMap[alias.toLowerCase().trim()] = slug;
      }

      console.log(`  ✓ ${name} -> ${slug} (${aliases.join(', ')})`);
    } catch (err) {
      console.error(`  ✗ Error processing ${name} (${slug}):`, err.message);
    }
  }

  console.log(
    '[svgl:extract] Generating TypeScript registry at src/cards/icons/languageLogos.ts...'
  );

  const tsContent = `/**
 * Auto-generated by scripts/extract-svgl-languages.mjs
 * Official multi-colored vector logos from SVGL (https://svgl.app)
 * Zero remote network requests during Satori card generation.
 */

export interface LanguageLogo {
  id: string;
  name: string;
  slug: string;
  svg: string;
  dataUri: string;
  darkSvg?: string;
  darkDataUri?: string;
  lightSvg?: string;
  lightDataUri?: string;
  publicPath: string;
}

export const LANGUAGE_LOGOS: Record<string, LanguageLogo> = ${JSON.stringify(registry, null, 2)};

export const SLUG_ALIASES: Record<string, string> = ${JSON.stringify(aliasMap, null, 2)};

/**
 * Resolves a programming language or tech stack name/slug to its official SVGL logo.
 * Normalized slug mapping handles variants (e.g. 'c#' -> 'csharp', 'c++' -> 'cpp', 'ts' -> 'typescript').
 */
export function getLanguageLogo(query?: string | null): LanguageLogo | null {
  if (!query) return null;
  const raw = query.toLowerCase().trim();
  const stripped = raw.replace(/\\./g, '').replace(/[^a-z0-9#+]/g, '');

  if (LANGUAGE_LOGOS[raw]) {
    return LANGUAGE_LOGOS[raw];
  }
  if (LANGUAGE_LOGOS[stripped]) {
    return LANGUAGE_LOGOS[stripped];
  }

  const targetSlug = SLUG_ALIASES[raw] || SLUG_ALIASES[stripped];
  if (targetSlug && LANGUAGE_LOGOS[targetSlug]) {
    return LANGUAGE_LOGOS[targetSlug];
  }

  return null;
}
`;

  await fs.writeFile(TS_OUTPUT_PATH, tsContent, 'utf-8');
  console.log(
    `[svgl:extract] Successfully generated ${TS_OUTPUT_PATH} with ${Object.keys(registry).length} logos.`
  );
}

main().catch((err) => {
  console.error('[svgl:extract] Extraction failed:', err);
  process.exit(1);
});
