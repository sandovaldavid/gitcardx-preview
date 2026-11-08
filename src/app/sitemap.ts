import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gitframe.dev';
  const currentDate = new Date();

  const routes = ['', '/studio'];

  const showcaseRepos = [
    'sandovaldavid/gitframe',
    'shadcn/ui',
    'facebook/react',
    'vercel/next.js',
    'torvalds/linux',
    'astral-sh/uv',
    'tailwindlabs/tailwindcss',
    'supabase/supabase',
  ];

  const mainPages: MetadataRoute.Sitemap = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.9,
  }));

  const repoPages: MetadataRoute.Sitemap = showcaseRepos.map((repo) => ({
    url: `${baseUrl}/${repo}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...mainPages, ...repoPages];
}
