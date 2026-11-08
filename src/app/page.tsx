import type { Metadata } from 'next';
import { StudioLayout } from '@/studio/components/StudioLayout';

export const metadata: Metadata = {
  title: 'GitCardX Preview — Instant GitHub Social Preview Generator',
  description:
    'Turn underused GitHub Social Previews into modern visual identities for your repositories in 5 seconds. Free, stateless, and developer-first.',
};

export default function HomePage() {
  return <StudioLayout />;
}
