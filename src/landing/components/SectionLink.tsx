'use client';

import React from 'react';

interface SectionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  sectionId: string;
}

export const SectionLink: React.FC<SectionLinkProps> = ({
  sectionId,
  children,
  onClick,
  ...props
}) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    event.preventDefault();

    const target = document.getElementById(sectionId);
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';

    target?.scrollIntoView({ behavior, block: 'start' });
    window.history.replaceState(null, '', `#${sectionId}`);
    onClick?.(event);
  };

  return (
    <a href={`#${sectionId}`} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
