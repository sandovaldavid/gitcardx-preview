import React from 'react';
import type { PatternGeneratorOptions, SvgPatternDefinition } from '../types';

export function generateDynamicRays(options: PatternGeneratorOptions): SvgPatternDefinition {
  const { accentColor, idPrefix, width = 1280, height = 640 } = options;

  const prefix = idPrefix ? `${idPrefix}-` : '';
  const rayGradId = idPrefix ? `${prefix}ray-grad` : 'ray-grad';

  const defs = (
    <defs>
      <linearGradient id={rayGradId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={accentColor} stopOpacity="0.25" />
        <stop offset="60%" stopColor={accentColor} stopOpacity="0.05" />
        <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
      </linearGradient>
    </defs>
  );

  const content = (
    <>
      <polygon points="0,0 600,0 200,640 0,640" fill={`url(#${rayGradId})`} />
      <polygon points="400,0 1000,0 600,640 200,640" fill={`url(#${rayGradId})`} opacity="0.6" />
      <polygon points="800,0 1280,0 1000,640 600,640" fill={`url(#${rayGradId})`} opacity="0.3" />
    </>
  );

  const toSvgString = () =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="${rayGradId}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${accentColor}" stop-opacity="0.25" /><stop offset="60%" stop-color="${accentColor}" stop-opacity="0.05" /><stop offset="100%" stop-color="${accentColor}" stop-opacity="0" /></linearGradient></defs><polygon points="0,0 600,0 200,640 0,640" fill="url(#${rayGradId})" /><polygon points="400,0 1000,0 600,640 200,640" fill="url(#${rayGradId})" opacity="0.6" /><polygon points="800,0 1280,0 1000,640 600,640" fill="url(#${rayGradId})" opacity="0.3" /></svg>`;

  return {
    id: 'dynamic-rays',
    defs,
    content,
    toSvgString,
  };
}
