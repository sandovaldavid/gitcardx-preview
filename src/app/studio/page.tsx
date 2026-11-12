import type { Metadata } from 'next';
import { StudioLayout } from '@/studio/components/StudioLayout';

export const metadata: Metadata = {
  title: 'Studio — Gitframe',
  description: 'Design and customize beautiful GitHub Social Preview cards in seconds.',
  alternates: {
    canonical: '/studio',
  },
  openGraph: {
    title: 'Studio — Gitframe',
    description: 'Design and customize beautiful GitHub Social Preview cards in seconds.',
    url: '/studio',
  },
};

export default function StudioPage() {
  return <StudioLayout />;
}
