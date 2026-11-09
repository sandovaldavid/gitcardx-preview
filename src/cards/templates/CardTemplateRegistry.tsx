import React from 'react';
import type { TemplateId } from '@/core/domain/schemas';
import type { CardRenderProps, CardTemplateComponent } from '../types';
import { LinearMinimalTemplate } from './LinearMinimalTemplate';
import { CliTerminalTemplate } from './CliTerminalTemplate';
import { OssCredibilityTemplate } from './OssCredibilityTemplate';
import { SdkPackageTemplate } from './SdkPackageTemplate';
import { AuroraMeshTemplate } from './AuroraMeshTemplate';
import { BlueprintGridTemplate } from './BlueprintGridTemplate';
import { ReleaseSpotlightTemplate } from './ReleaseSpotlightTemplate';
import { CreatorSignatureTemplate } from './CreatorSignatureTemplate';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  recommendedFor: string;
  component: CardTemplateComponent;
}

export const CARD_TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  'linear-minimal': {
    id: 'linear-minimal',
    name: 'Linear Minimal',
    description: 'Sleek, modern, and uncluttered layout inspired by Linear and modern SaaS tools.',
    recommendedFor: 'Frameworks, developer platforms, modern web apps',
    component: LinearMinimalTemplate,
  },
  'cli-terminal': {
    id: 'cli-terminal',
    name: 'CLI Terminal Hero',
    description: 'Terminal window prominently displaying your install command and shell interface.',
    recommendedFor: 'CLI utilities, package runners, dev infrastructure',
    component: CliTerminalTemplate,
  },
  'oss-credibility': {
    id: 'oss-credibility',
    name: 'OSS Credibility',
    description: 'Puts stars, forks, contributors, and language metrics front and center.',
    recommendedFor: 'Popular open-source libraries, mature communities',
    component: OssCredibilityTemplate,
  },
  'sdk-package': {
    id: 'sdk-package',
    name: 'SDK & Package Split',
    description: 'Two-column balanced design pairing package identity with a code or install box.',
    recommendedFor: 'SDKs, client libraries, REST/GraphQL clients',
    component: SdkPackageTemplate,
  },
  'aurora-mesh': {
    id: 'aurora-mesh',
    name: 'Aurora Mesh Glass',
    description: 'Vibrant fluid glow with frosted container card and modern startup vibes.',
    recommendedFor: 'AI tools, design systems, next-gen startups',
    component: AuroraMeshTemplate,
  },
  'blueprint-grid': {
    id: 'blueprint-grid',
    name: 'Blueprint Grid',
    description:
      'Precision architectural blueprint styling with coordinate lines and technical badges.',
    recommendedFor: 'System architectures, databases, cloud native tools',
    component: BlueprintGridTemplate,
  },
  'release-spotlight': {
    id: 'release-spotlight',
    name: 'Release Spotlight',
    description: 'Heroic version badge celebrating releases, changelogs, and milestones.',
    recommendedFor: 'Major version drops, product launches, releases',
    component: ReleaseSpotlightTemplate,
  },
  'creator-signature': {
    id: 'creator-signature',
    name: 'Creator Signature',
    description:
      'Highlights the project creator with prominent author avatar and project identity.',
    recommendedFor: 'Indie hackers, solo founders, personal portfolio repos',
    component: CreatorSignatureTemplate,
  },
};

export function getTemplateComponent(id: TemplateId): CardTemplateComponent {
  const definition = CARD_TEMPLATES[id];
  return definition ? definition.component : LinearMinimalTemplate;
}

export const CardRenderer: React.FC<CardRenderProps> = (props) => {
  switch (props.config.templateId) {
    case 'linear-minimal':
      return <LinearMinimalTemplate {...props} />;
    case 'cli-terminal':
      return <CliTerminalTemplate {...props} />;
    case 'oss-credibility':
      return <OssCredibilityTemplate {...props} />;
    case 'sdk-package':
      return <SdkPackageTemplate {...props} />;
    case 'aurora-mesh':
      return <AuroraMeshTemplate {...props} />;
    case 'blueprint-grid':
      return <BlueprintGridTemplate {...props} />;
    case 'release-spotlight':
      return <ReleaseSpotlightTemplate {...props} />;
    case 'creator-signature':
      return <CreatorSignatureTemplate {...props} />;
    default:
      return <LinearMinimalTemplate {...props} />;
  }
};
