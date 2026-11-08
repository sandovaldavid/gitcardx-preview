import React from 'react';
import type { RepoContributorSchema } from '@/core/domain/schemas';
import { z } from 'zod';

type Contributor = z.infer<typeof RepoContributorSchema>;

interface AvatarGroupProps {
  contributors: Contributor[];
  borderColor: string;
  maxAvatars?: number;
  size?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  contributors,
  borderColor,
  maxAvatars = 5,
  size = 36,
}) => {
  const visible = contributors.slice(0, maxAvatars);
  if (visible.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {visible.map((contributor, index) => (
        <div
          key={contributor.login}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `2px solid ${borderColor}`,
            marginLeft: index === 0 ? 0 : -8,
            backgroundColor: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={contributor.avatarUrl}
            alt={contributor.login}
            width={size}
            height={size}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      ))}
    </div>
  );
};
