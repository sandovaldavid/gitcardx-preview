import type { Metadata } from 'next';
import { StudioLayout } from '@/studio/components/StudioLayout';

export const metadata: Metadata = {
  title: 'Studio — GitCardX Preview',
  description: 'Design and customize beautiful GitHub Social Preview cards in seconds.',
};

export default function StudioPage() {
  return <StudioLayout />;
}
