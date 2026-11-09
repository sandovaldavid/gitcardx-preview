'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ScaledCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Fits the fixed 1280x640 Satori canvas into any container width.
 * The ref callback applies the scale before paint; ResizeObserver keeps it in sync.
 */
export const ScaledCard: React.FC<ScaledCardProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const fit = (card = cardRef.current) => {
    const container = card?.parentElement;
    if (!container || !card) return;
    card.style.transform = `scale(${container.clientWidth / 1280})`;
  };

  useEffect(() => {
    fit();
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => fit());
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn('relative aspect-2/1 w-full overflow-hidden', className)}
      style={{ containerType: 'inline-size' }}
    >
      <div
        ref={(node) => {
          cardRef.current = node;
          fit(node);
        }}
        className="card-scale absolute top-0 left-0 origin-top-left"
        style={{ width: 1280, height: 640 }}
      >
        {children}
      </div>
    </div>
  );
};
