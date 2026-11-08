import type { RepoMetadata, CardConfig } from '@/core/domain/schemas';

export interface CardRenderProps {
  repo: RepoMetadata;
  config: CardConfig;
  width?: number;
  height?: number;
  showSafeZoneGuides?: boolean;
}

export type CardTemplateComponent = React.FC<CardRenderProps>;
