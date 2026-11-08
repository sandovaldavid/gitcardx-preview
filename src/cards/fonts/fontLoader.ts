import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface FontDefinition {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700;
  style: 'normal' | 'italic';
}

let fontsCache: FontDefinition[] | null = null;

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
}

export async function getCardFonts(): Promise<FontDefinition[]> {
  if (fontsCache) {
    return fontsCache;
  }

  const fontsDir = join(process.cwd(), 'public', 'fonts');

  try {
    const [interRegular, interBold, jbMonoRegular, jbMonoBold] = await Promise.all([
      readFile(join(fontsDir, 'Inter-Regular.ttf')),
      readFile(join(fontsDir, 'Inter-Bold.ttf')),
      readFile(join(fontsDir, 'JetBrainsMono-Regular.otf')),
      readFile(join(fontsDir, 'JetBrainsMono-Bold.otf')),
    ]);

    fontsCache = [
      {
        name: 'Inter',
        data: bufferToArrayBuffer(interRegular),
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Inter',
        data: bufferToArrayBuffer(interBold),
        weight: 700,
        style: 'normal',
      },
      {
        name: 'JetBrains Mono',
        data: bufferToArrayBuffer(jbMonoRegular),
        weight: 400,
        style: 'normal',
      },
      {
        name: 'JetBrains Mono',
        data: bufferToArrayBuffer(jbMonoBold),
        weight: 700,
        style: 'normal',
      },
    ];

    return fontsCache;
  } catch (error) {
    console.error('Failed to load card fonts from public/fonts:', error);
    throw new Error('Could not load fonts for Satori card rendering.');
  }
}
