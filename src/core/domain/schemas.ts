import { z } from 'zod';

export const TemplateIdSchema = z.enum([
  'modern-minimal',
  'terminal-prompt',
  'metric-showcase',
  'split-console',
  'aurora-glass',
  'blueprint-grid',
  'version-hero',
  'author-spotlight',
]);

export const TEMPLATE_LEGACY_MAP: Record<string, TemplateId> = {
  'linear-minimal': 'modern-minimal',
  'cli-terminal': 'terminal-prompt',
  'oss-credibility': 'metric-showcase',
  'sdk-package': 'split-console',
  'aurora-mesh': 'aurora-glass',
  'release-spotlight': 'version-hero',
  'creator-signature': 'author-spotlight',
};

export function normalizeTemplateId(id: string | null | undefined): TemplateId {
  if (!id) return 'modern-minimal';
  if (TEMPLATE_LEGACY_MAP[id]) return TEMPLATE_LEGACY_MAP[id];
  const parsed = TemplateIdSchema.safeParse(id);
  return parsed.success ? parsed.data : 'modern-minimal';
}

export const ColorSchema = z
  .string()
  .min(1)
  .regex(
    /^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgb\([^\)]+\)|rgba\([^\)]+\)|hsl\([^\)]+\)|hsla\([^\)]+\)|transparent)$/,
    'Invalid CSS color format'
  );

export const PaletteSchema = z.object({
  background: ColorSchema,
  text: ColorSchema,
  accent: ColorSchema,
  border: ColorSchema,
});

export const TypographySchema = z.object({
  fontHeading: z.string().min(1).max(64),
  fontMono: z.string().min(1).max(64),
});

export const BackgroundPatternConfigSchema = z.object({
  id: z.enum([
    'architectural-grid',
    'dot-matrix',
    'radial-spotlight',
    'aurora-mesh',
    'topographic-contours',
    'custom-image',
  ]),
  opacity: z.number().min(0).max(1),
  scale: z.number().positive().optional(),
  color: ColorSchema.optional(),
});

export const ContentAlignSchema = z.enum(['left', 'center']).default('left');

export const CardVisibilitySchema = z.object({
  stars: z.boolean(),
  forks: z.boolean(),
  release: z.boolean(),
  license: z.boolean(),
  contributors: z.boolean(),
  techStack: z.boolean(),
  languageLogos: z.boolean().default(true),
  author: z.boolean().default(true),
  tagline: z.boolean().default(true),
  installCommand: z.boolean().default(true),
  issues: z.boolean().default(false),
  discussions: z.boolean().default(false),
});

export const CardConfigSchema = z.object({
  templateId: z.preprocess((val) => normalizeTemplateId(val as string), TemplateIdSchema),
  title: z.string().min(1).max(100),
  tagline: z.string().max(500),
  installCommand: z.string().max(120).optional(),
  customLogoUrl: z.string().url().or(z.string().startsWith('data:')).optional(),
  customBackgroundUrl: z.string().url().or(z.string().startsWith('data:')).optional(),
  contentAlign: ContentAlignSchema,
  palette: PaletteSchema,
  typography: TypographySchema,
  backgroundPattern: BackgroundPatternConfigSchema,
  visibility: CardVisibilitySchema,
});

export const RepoLanguageSchema = z.object({
  name: z.string(),
  color: z.string(),
  size: z.number(),
});

export const RepoContributorSchema = z.object({
  login: z.string(),
  avatarUrl: z.string().url(),
});

export const RepoMetadataSchema = z.object({
  owner: z.object({
    login: z.string().min(1),
    avatarUrl: z.string().url(),
    isOrg: z.boolean(),
  }),
  name: z.string().min(1),
  description: z.string().nullable(),
  homepageUrl: z.string().nullable(),
  stars: z.number().int().nonnegative(),
  forks: z.number().int().nonnegative(),
  primaryLanguage: z
    .object({
      name: z.string(),
      color: z.string(),
    })
    .nullable(),
  languages: z.array(RepoLanguageSchema),
  topics: z.array(z.string()),
  license: z.string().nullable(),
  latestRelease: z
    .object({
      tag: z.string(),
      publishedAt: z.string(),
    })
    .nullable(),
  contributors: z.array(RepoContributorSchema),
  contributorsCount: z.number().int().nonnegative().optional(),
  openIssuesCount: z.number().int().nonnegative().optional(),
  discussionsCount: z.number().int().nonnegative().optional(),
});

export const BrandKitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  templateId: z.preprocess((val) => normalizeTemplateId(val as string), TemplateIdSchema),
  palette: PaletteSchema,
  typography: TypographySchema,
  backgroundPattern: BackgroundPatternConfigSchema,
  customLogoUrl: z.string().optional(),
  customBackgroundUrl: z.string().optional(),
  signature: z.string().max(80).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const PatternPresetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  pattern: BackgroundPatternConfigSchema,
  customBackgroundUrl: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TemplateId = z.infer<typeof TemplateIdSchema>;
export type Palette = z.infer<typeof PaletteSchema>;
export type Typography = z.infer<typeof TypographySchema>;
export type BackgroundPatternConfig = z.infer<typeof BackgroundPatternConfigSchema>;
export type ContentAlign = z.infer<typeof ContentAlignSchema>;
export type CardVisibility = z.infer<typeof CardVisibilitySchema>;
export type CardConfig = z.infer<typeof CardConfigSchema>;
export type RepoMetadata = z.infer<typeof RepoMetadataSchema>;
export type BrandKit = z.infer<typeof BrandKitSchema>;
export type PatternPreset = z.infer<typeof PatternPresetSchema>;
