import { Suspense } from 'react';
import type { Metadata } from 'next';
import { GitHubService } from '@/core/services/GitHubService';
import { StudioLayout } from '@/studio/components/StudioLayout';
import type { RepoMetadata } from '@/core/domain/schemas';

interface PageProps {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

const githubService = new GitHubService();

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { owner, repo } = await params;
  const title = `${owner}/${repo} — Gitframe`;
  const description = `Create an instant GitHub Social Preview card for ${owner}/${repo}`;
  const cardOgUrl = `https://gitframe.dev/api/card/${owner}/${repo}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: cardOgUrl,
          width: 1280,
          height: 640,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [cardOgUrl],
    },
  };
}

async function RepoHydratedStudio({ params }: PageProps) {
  const { owner, repo } = await params;
  let repoMetadata: RepoMetadata;

  try {
    repoMetadata = await githubService.getRepository(owner, repo);
  } catch (error) {
    console.error(`Error loading ${owner}/${repo}:`, error);
    repoMetadata = {
      owner: {
        login: owner,
        avatarUrl: `https://avatars.githubusercontent.com/${owner}`,
        isOrg: false,
      },
      name: repo,
      description: `Custom social preview for ${owner}/${repo}`,
      homepageUrl: null,
      stars: 0,
      forks: 0,
      primaryLanguage: null,
      languages: [],
      topics: [],
      license: null,
      latestRelease: null,
      contributors: [],
    };
  }

  return <StudioLayout initialRepo={repoMetadata} />;
}

export default function ViralRepoStudioPage(props: PageProps) {
  return (
    <Suspense fallback={<StudioLayout />}>
      <RepoHydratedStudio {...props} />
    </Suspense>
  );
}
