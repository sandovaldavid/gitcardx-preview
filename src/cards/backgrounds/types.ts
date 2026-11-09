import type { CSSProperties, ReactNode } from 'react';
import type { BackgroundPatternConfig } from '@/core/domain/schemas';

export type BackgroundPatternId = BackgroundPatternConfig['id'];

export interface BackgroundProps {
  accentColor: string;
  borderColor: string;
  opacity?: number;
  scale?: number;
  idPrefix?: string;
  className?: string;
  style?: CSSProperties;
}

export interface CustomImageBackgroundProps extends BackgroundProps {
  imageUrl?: string;
}

export interface SvgPatternCanvasProps {
  width?: number | string;
  height?: number | string;
  viewBox?: string;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export interface PatternGeneratorOptions {
  accentColor: string;
  borderColor: string;
  scale?: number;
  idPrefix?: string;
  width?: number;
  height?: number;
}

export interface SvgPatternDefinition {
  id: BackgroundPatternId | 'dynamic-rays';
  defs?: ReactNode;
  content: ReactNode;
  toSvgString: () => string;
}
