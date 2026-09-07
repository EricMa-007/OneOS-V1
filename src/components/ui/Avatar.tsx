/**
 * OneOS 头像组件
 */

import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  color?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const statusColors: Record<string, string> = {
  online: '#00B894',
  offline: '#A3A3A3',
  busy: '#FF6B6B',
  away: '#FDCB6E',
};

const avatarColors = [
  '#8B5CF6', '#00CEC9', '#FD79A8', '#FDCB6E', '#00B894',
  '#74B9FF', '#A29BFE', '#55EFC4', '#FFEAA7', '#FF7675',
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColorFromName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '?',
  size = 'md',
  color,
  status,
  className = '',
  style,
  onClick,
}) => {
  const pixelSize = sizeMap[size];
  const bgColor = color || getColorFromName(name);
  const fontSize = pixelSize * 0.4;

  return (
    <div
      className={`oneos-avatar ${className}`}
      style={{
        position: 'relative',
        width: pixelSize,
        height: pixelSize,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: src ? 'var(--color-neutral-100)' : bgColor,
        color: '#FFFFFF',
        fontSize,
        fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        userSelect: 'none',
        ...style,
      }}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: pixelSize * 0.3,
            height: pixelSize * 0.3,
            borderRadius: '50%',
            background: statusColors[status],
            border: `${Math.max(2, pixelSize * 0.06)}px solid #FFFFFF`,
            boxSizing: 'border-box',
          }}
        />
      )}
    </div>
  );
};

interface AvatarGroupProps {
  avatars: Array<{ src?: string; name: string }>;
  size?: AvatarSize;
  max?: number;
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  size = 'md',
  max = 5,
  className = '',
}) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={`oneos-avatar-group ${className}`} style={{ display: 'flex', alignItems: 'center' }}>
      {visible.map((avatar, index) => (
        <div
          key={index}
          style={{
            marginLeft: index > 0 ? `-${sizeMap[size] * 0.25}px` : 0,
            zIndex: visible.length - index,
          }}
        >
          <Avatar {...avatar} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div
          style={{
            marginLeft: `-${sizeMap[size] * 0.25}px`,
            zIndex: 0,
          }}
        >
          <Avatar
            name={`+${remaining}`}
            size={size}
            color="#A3A3A3"
          />
        </div>
      )}
    </div>
  );
};
