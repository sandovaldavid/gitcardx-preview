export interface TechStackItem {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const TECH_CATALOG: Record<string, TechStackItem> = {
  // Languages
  typescript: { id: 'typescript', name: 'TypeScript', icon: 'simple-icons:typescript', color: '#3178C6' },
  javascript: { id: 'javascript', name: 'JavaScript', icon: 'simple-icons:javascript', color: '#F7DF1E' },
  rust: { id: 'rust', name: 'Rust', icon: 'simple-icons:rust', color: '#DEA584' },
  python: { id: 'python', name: 'Python', icon: 'simple-icons:python', color: '#3776AB' },
  go: { id: 'go', name: 'Go', icon: 'simple-icons:go', color: '#00ADD8' },
  html: { id: 'html', name: 'HTML5', icon: 'simple-icons:html5', color: '#E34F26' },
  css: { id: 'css', name: 'CSS3', icon: 'simple-icons:css3', color: '#1572B6' },
  solidity: { id: 'solidity', name: 'Solidity', icon: 'simple-icons:solidity', color: '#363636' },
  elixir: { id: 'elixir', name: 'Elixir', icon: 'simple-icons:elixir', color: '#4B275F' },
  ruby: { id: 'ruby', name: 'Ruby', icon: 'simple-icons:ruby', color: '#CC342D' },
  php: { id: 'php', name: 'PHP', icon: 'simple-icons:php', color: '#777BB4' },
  c: { id: 'c', name: 'C', icon: 'simple-icons:c', color: '#A8B9CC' },
  'c++': { id: 'cpp', name: 'C++', icon: 'simple-icons:cplusplus', color: '#00599C' },
  'c#': { id: 'csharp', name: 'C#', icon: 'simple-icons:csharp', color: '#239120' },
  java: { id: 'java', name: 'Java', icon: 'simple-icons:openjdk', color: '#ED8B00' },
  kotlin: { id: 'kotlin', name: 'Kotlin', icon: 'simple-icons:kotlin', color: '#7F52FF' },
  swift: { id: 'swift', name: 'Swift', icon: 'simple-icons:swift', color: '#F05138' },
  dart: { id: 'dart', name: 'Dart', icon: 'simple-icons:dart', color: '#0175C2' },

  // Frameworks & Libraries
  react: { id: 'react', name: 'React', icon: 'simple-icons:react', color: '#61DAFB' },
  nextjs: { id: 'nextjs', name: 'Next.js', icon: 'simple-icons:nextdotjs', color: '#000000' },
  vue: { id: 'vue', name: 'Vue.js', icon: 'simple-icons:vuedotjs', color: '#4FC08D' },
  svelte: { id: 'svelte', name: 'Svelte', icon: 'simple-icons:svelte', color: '#FF3E00' },
  angular: { id: 'angular', name: 'Angular', icon: 'simple-icons:angular', color: '#DD0031' },
  astro: { id: 'astro', name: 'Astro', icon: 'simple-icons:astro', color: '#BC52EE' },
  tailwind: { id: 'tailwindcss', name: 'Tailwind CSS', icon: 'simple-icons:tailwindcss', color: '#06B6D4' },
  tailwindcss: { id: 'tailwindcss', name: 'Tailwind CSS', icon: 'simple-icons:tailwindcss', color: '#06B6D4' },
  node: { id: 'nodedotjs', name: 'Node.js', icon: 'simple-icons:nodedotjs', color: '#5FA04E' },
  bun: { id: 'bun', name: 'Bun', icon: 'simple-icons:bun', color: '#FBF0DF' },
  deno: { id: 'deno', name: 'Deno', icon: 'simple-icons:deno', color: '#000000' },

  // Data & Backend
  graphql: { id: 'graphql', name: 'GraphQL', icon: 'simple-icons:graphql', color: '#E10098' },
  postgresql: { id: 'postgresql', name: 'PostgreSQL', icon: 'simple-icons:postgresql', color: '#4169E1' },
  postgres: { id: 'postgresql', name: 'PostgreSQL', icon: 'simple-icons:postgresql', color: '#4169E1' },
  sqlite: { id: 'sqlite', name: 'SQLite', icon: 'simple-icons:sqlite', color: '#003B57' },
  mongodb: { id: 'mongodb', name: 'MongoDB', icon: 'simple-icons:mongodb', color: '#47A248' },
  redis: { id: 'redis', name: 'Redis', icon: 'simple-icons:redis', color: '#FF4438' },
  prisma: { id: 'prisma', name: 'Prisma', icon: 'simple-icons:prisma', color: '#2D3748' },
  drizzle: { id: 'drizzle', name: 'Drizzle ORM', icon: 'simple-icons:drizzle', color: '#C5F74F' },
  supabase: { id: 'supabase', name: 'Supabase', icon: 'simple-icons:supabase', color: '#3ECF8E' },

  // Infra & DevOps
  docker: { id: 'docker', name: 'Docker', icon: 'simple-icons:docker', color: '#2496ED' },
  kubernetes: { id: 'kubernetes', name: 'Kubernetes', icon: 'simple-icons:kubernetes', color: '#326CE5' },
  aws: { id: 'amazonwebservices', name: 'AWS', icon: 'simple-icons:amazonwebservices', color: '#FF9900' },
  cloudflare: { id: 'cloudflare', name: 'Cloudflare', icon: 'simple-icons:cloudflare', color: '#F38020' },
  vercel: { id: 'vercel', name: 'Vercel', icon: 'simple-icons:vercel', color: '#000000' },
  linux: { id: 'linux', name: 'Linux', icon: 'simple-icons:linux', color: '#FCC624' },
};

export function detectTechStack(
  languages: Array<{ name: string; color: string }>,
  topics: string[],
  maxItems = 5
): TechStackItem[] {
  const seenIds = new Set<string>();
  const detected: TechStackItem[] = [];

  const normalize = (val: string) => val.toLowerCase().replace(/[^a-z0-9#+]/g, '');

  // 1. Check languages first
  for (const lang of languages) {
    const key = normalize(lang.name);
    if (TECH_CATALOG[key] && !seenIds.has(TECH_CATALOG[key].id)) {
      seenIds.add(TECH_CATALOG[key].id);
      detected.push(TECH_CATALOG[key]);
      if (detected.length >= maxItems) return detected;
    }
  }

  // 2. Check repository topics
  for (const topic of topics) {
    const key = normalize(topic);
    if (TECH_CATALOG[key] && !seenIds.has(TECH_CATALOG[key].id)) {
      seenIds.add(TECH_CATALOG[key].id);
      detected.push(TECH_CATALOG[key]);
      if (detected.length >= maxItems) return detected;
    }
  }

  return detected;
}

export function suggestInstallCommand(
  languages: Array<{ name: string }>,
  topics: string[],
  repoName: string,
  owner?: string
): string {
  const allTerms = [
    ...languages.map((l) => l.name.toLowerCase()),
    ...topics.map((t) => t.toLowerCase()),
  ];

  if (allTerms.some((t) => t.includes('rust') || t === 'cargo' || t === 'crate')) {
    return `cargo add ${repoName}`;
  }

  if (allTerms.some((t) => t.includes('python') || t === 'pypi' || t === 'pip')) {
    return `pip install ${repoName}`;
  }

  if (allTerms.some((t) => t.includes('go') || t === 'golang')) {
    const qualified = owner ? `github.com/${owner}/${repoName}` : repoName;
    return `go get ${qualified}`;
  }

  if (allTerms.some((t) => t === 'docker' || t === 'container' || t === 'dockerfile')) {
    const image = owner ? `${owner}/${repoName}` : repoName;
    return `docker pull ${image.toLowerCase()}`;
  }

  if (allTerms.some((t) => t === 'cli' || t === 'terminal' || t === 'tool')) {
    return `npx ${repoName}`;
  }

  // Default modern JS/TS ecosystem snippet
  return `bun add ${repoName}`;
}
