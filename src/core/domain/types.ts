export interface BrandKit {
  id: string;
  name: string;
  templateId: string;
  palette: {
    background: string;
    text: string;
    accent: string;
    border: string;
  };
  typography: {
    fontHeading: string;
    fontMono: string;
  };
  backgroundPattern: {
    id: string;
    opacity: number;
    scale?: number;
  };
  customLogoUrl?: string;
  signature?: string;
  createdAt: string;
  updatedAt: string;
}

export type TemplateId =
  | 'linear-minimal'
  | 'cli-terminal'
  | 'oss-credibility'
  | 'sdk-package'
  | 'aurora-mesh'
  | 'blueprint-grid'
  | 'release-spotlight'
  | 'creator-signature';

export interface RepoMetadata {
  owner: {
    login: string;
    avatarUrl: string;
    isOrg: boolean;
  };
  name: string;
  description: string | null;
  homepageUrl: string | null;
  stars: number;
  forks: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  languages: Array<{
    name: string;
    color: string;
    size: number;
  }>;
  topics: string[];
  license: string | null;
  latestRelease: {
    tag: string;
    publishedAt: string;
  } | null;
  contributors: Array<{
    login: string;
    avatarUrl: string;
  }>;
}

export interface CardConfig {
  templateId: TemplateId;
  title: string;
  tagline: string;
  installCommand?: string;
  customLogoUrl?: string;
  palette: {
    background: string;
    text: string;
    accent: string;
    border: string;
  };
  typography: {
    fontHeading: string;
    fontMono: string;
  };
  backgroundPattern: {
    id: string;
    opacity: number;
    scale?: number;
  };
  visibility: {
    stars: boolean;
    forks: boolean;
    release: boolean;
    license: boolean;
    contributors: boolean;
    techStack: boolean;
  };
}
