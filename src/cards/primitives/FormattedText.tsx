import React from 'react';

interface FormattedTextProps {
  text: string;
  accentColor: string;
  textColor: string;
}

export function parseAccentSegments(text: string): Array<{ text: string; isAccent: boolean }> {
  if (!text) return [];

  // Match either **bold/accent** or *italic/accent*
  const regex = /(\*{1,2})([^*]+?)\1/g;
  const segments: Array<{ text: string; isAccent: boolean }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isAccent: false,
      });
    }
    segments.push({
      text: match[2],
      isAccent: true,
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isAccent: false,
    });
  }

  return segments;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, accentColor, textColor }) => {
  if (!text || !text.includes('*')) {
    return <>{text}</>;
  }

  const segments = parseAccentSegments(text);

  return (
    <>
      {segments.map((segment, index) => (
        <span
          key={index}
          style={{
            color: segment.isAccent ? accentColor : textColor,
            fontWeight: segment.isAccent ? 800 : undefined,
            whiteSpace: 'pre-wrap',
          }}
        >
          {segment.text}
        </span>
      ))}
    </>
  );
};
