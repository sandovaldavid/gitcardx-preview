'use client';

import { useEffect, useState } from 'react';

/**
 * Returns `true` only after `isActive` remains truthy for at least `delayMs`.
 * Immediately returns `false` as soon as `isActive` becomes false, avoiding
 * sub-threshold visual flashes on fast/cached operations.
 */
export function useDelayedLoading(isActive: boolean, delayMs = 150): boolean {
  const [delayedActive, setDelayedActive] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const timer = window.setTimeout(() => {
      setDelayedActive(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      setDelayedActive(false);
    };
  }, [isActive, delayMs]);

  return isActive && delayedActive;
}
