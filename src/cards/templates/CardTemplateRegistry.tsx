import React from 'react';
import type { TemplateId } from '@/core/domain/schemas';
import { normalizeTemplateId } from '@/core/domain/schemas';
import type { CardRenderProps, CardTemplateComponent } from '../types';
import { ModernMinimalTemplate } from './ModernMinimalTemplate';
import { TerminalPromptTemplate } from './TerminalPromptTemplate';
import { MetricShowcaseTemplate } from './MetricShowcaseTemplate';
import { SplitConsoleTemplate } from './SplitConsoleTemplate';
import { AuroraGlassTemplate } from './AuroraGlassTemplate';
import { BlueprintGridTemplate } from './BlueprintGridTemplate';
import { VersionHeroTemplate } from './VersionHeroTemplate';
import { AuthorSpotlightTemplate } from './AuthorSpotlightTemplate';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  recommendedFor: string;
  component: CardTemplateComponent;
}

export const CARD_TEMPLATES: Record<TemplateId, TemplateDefinition> = {
  'modern-minimal': {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean, refined layout with balanced negative space and high typographic clarity.',
    recommendedFor: 'High clarity, balanced spacing, and clean typography',
    component: ModernMinimalTemplate,
  },
  'terminal-prompt': {
    id: 'terminal-prompt',
    name: 'Terminal Prompt',
    description: 'Terminal command window front and center with clean developer aesthetics.',
    recommendedFor: 'Quick install commands, developer tools, and console workflows',
    component: TerminalPromptTemplate,
  },
  'metric-showcase': {
    id: 'metric-showcase',
    name: 'Metric Showcase',
    description:
      'High-density split layout highlighting repository metrics, traction, and community.',
    recommendedFor: 'Key metrics, community traction, and project impact',
    component: MetricShowcaseTemplate,
  },
  'split-console': {
    id: 'split-console',
    name: 'Split Console',
    description:
      'Two-column balanced layout pairing repository identity with an interactive terminal box and stats.',
    recommendedFor: 'Two-column balance, code installation, and metadata',
    component: SplitConsoleTemplate,
  },
  'aurora-glass': {
    id: 'aurora-glass',
    name: 'Aurora Glass',
    description: 'Vibrant fluid gradient glow behind a frosted glass container card.',
    recommendedFor: 'Modern fluid gradients, frosted glass, and vibrant visuals',
    component: AuroraGlassTemplate,
  },
  'blueprint-grid': {
    id: 'blueprint-grid',
    name: 'Blueprint Grid',
    description:
      'Technical blueprint architecture with coordinate crosshairs and engineering badges.',
    recommendedFor: 'Technical precision, architectural grids, and coordinate lines',
    component: BlueprintGridTemplate,
  },
  'version-hero': {
    id: 'version-hero',
    name: 'Version Hero',
    description:
      'Heroic centered layout with a prominent version or milestone badge above the title.',
    recommendedFor: 'Version milestones, prominent releases, and centered focus',
    component: VersionHeroTemplate,
  },
  'author-spotlight': {
    id: 'author-spotlight',
    name: 'Author Spotlight',
    description:
      'Two-column layout highlighting author profile and avatar alongside project identity.',
    recommendedFor: 'Prominent author avatar, developer profile, and project identity',
    component: AuthorSpotlightTemplate,
  },
};

export function getTemplateComponent(id: TemplateId | string): CardTemplateComponent {
  const normalized = normalizeTemplateId(id);
  const definition = CARD_TEMPLATES[normalized];
  return definition ? definition.component : ModernMinimalTemplate;
}

export const CardRenderer: React.FC<CardRenderProps> = (props) => {
  const templateId = normalizeTemplateId(props.config.templateId);
  switch (templateId) {
    case 'modern-minimal':
      return <ModernMinimalTemplate {...props} />;
    case 'terminal-prompt':
      return <TerminalPromptTemplate {...props} />;
    case 'metric-showcase':
      return <MetricShowcaseTemplate {...props} />;
    case 'split-console':
      return <SplitConsoleTemplate {...props} />;
    case 'aurora-glass':
      return <AuroraGlassTemplate {...props} />;
    case 'blueprint-grid':
      return <BlueprintGridTemplate {...props} />;
    case 'version-hero':
      return <VersionHeroTemplate {...props} />;
    case 'author-spotlight':
      return <AuthorSpotlightTemplate {...props} />;
    default:
      return <ModernMinimalTemplate {...props} />;
  }
};
