/**
 * OneOS 标签组件
 * 设计系统V3标准标签
 */

import React from 'react';

export type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'custom';
export type TagSize = 'sm' | 'md';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  color?: string;
  closable?: boolean;
  onClose?: () => void;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const variantColors: Record<TagVariant, { bg: string; text: string; border?: string }> = {
  default: { bg: 'var(--color-neutral-100)', text: 'var(--color-neutral-600)' },
  primary: { bg: 'var(--color-primary-100)', text: 'var(--color-primary-700)' },
  success: { bg: 'var(--color-success-bg)', text: 'var(--color-success)' },
  warning: { bg: 'var(--color-warning-bg)', text: '#B8860B' },
  error: { bg: 'var(--color-error-bg)', text: 'var(--color-error)' },
  info: { bg: 'var(--color-info-bg)', text: 'var(--color-info)' },
  custom: { bg: '', text: '' },
};

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  color,
  closable = false,
  onClose,
  onClick,
  icon,
  className = '',
  style,
}) => {
  const colors = variant === 'custom' && color
    ? { bg: `${color}1A`, text: color }
    : variantColors[variant];

  const sizeStyles: Record<TagSize, React.CSSProperties> = {
    sm: { height: '18px', padding: '0 6px', fontSize: '11px' },
    md: { height: '22px', padding: '0 8px', fontSize: '12px' },
  };

  return (
    <span
      className={`oneos-tag oneos-tag--${variant} ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        background: colors.bg,
        color: colors.text,
        borderRadius: '6px',
        fontWeight: 500,
        lineHeight: 1,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--duration-fast)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
        ...style,
      }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      <span>{children}</span>
      {closable && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose?.(); }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            opacity: 0.7,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
        >
          ✕
        </button>
      )}
    </span>
  );
};

interface BadgeProps {
  count: number;
  max?: number;
  dot?: boolean;
  color?: string;
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ count, max = 99, dot = false, color = 'var(--color-error)', children }) => {
  const displayCount = count > max ? `${max}+` : count;
  const showBadge = dot || count > 0;

  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      {children}
      {showBadge && (
        <span
          style={{
            position: 'absolute',
            top: dot ? '2px' : '-4px',
            right: dot ? '2px' : '-6px',
            minWidth: dot ? '8px' : '18px',
            height: dot ? '8px' : '18px',
            background: color,
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 600,
            color: '#FFFFFF',
            padding: dot ? 0 : '0 5px',
            border: '2px solid #FFFFFF',
            boxSizing: 'border-box',
          }}
        >
          {!dot && displayCount}
        </span>
      )}
    </span>
  );
};
