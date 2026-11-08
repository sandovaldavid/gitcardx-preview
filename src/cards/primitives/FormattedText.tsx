import React from 'react';

interface FormattedTextProps {
  text: string;
  accentColor: string;
  textColor: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, accentColor, textColor }) => {
  if (!text || !text.includes('*')) {
    return <>{text}</>;
  }

  const parts = text.split('*');
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {parts.map((part, index) => {
        const isAccent = index % 2 === 1;
        if (!part) return null;
        return (
          <span
            key={index}
            style={{
              color: isAccent ? accentColor : textColor,
              fontWeight: isAccent ? 800 : undefined,
            }}
          >
            {part}
          </span>
        );
      })}
    </div>
  );
};
