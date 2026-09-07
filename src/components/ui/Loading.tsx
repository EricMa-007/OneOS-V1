/**
 * OneOS 加载组件
 * 加载状态、骨架屏、Spinner
 */

import React from 'react';

interface SpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  color = 'var(--color-primary-500)',
  thickness = 2.5,
  className = '',
  style,
}) => (
  <div
    className={`oneos-spinner ${className}`}
    style={{
      width: size,
      height: size,
      border: `${thickness}px solid var(--color-primary-100)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'oneos-spin 0.8s linear infinite',
      flexShrink: 0,
      ...style,
    }}
  >
    <style>{`
      @keyframes oneos-spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const loadingSizes = {
  sm: { spinner: 20, text: '12px', gap: '8px' },
  md: { spinner: 28, text: '14px', gap: '12px' },
  lg: { spinner: 40, text: '16px', gap: '16px' },
};

export const Loading: React.FC<LoadingProps> = ({
  text = '加载中...',
  size = 'md',
  fullScreen = false,
  className = '',
  style,
}) => {
  const sizes = loadingSizes[size];

  const content = (
    <div
      className={`oneos-loading ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: sizes.gap,
        padding: fullScreen ? '40px' : '24px',
        ...style,
      }}
    >
      <Spinner size={sizes.spinner} />
      {text && (
        <span style={{ fontSize: sizes.text, color: 'var(--text-secondary)', fontWeight: 500 }}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(4px)',
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {content}
      </div>
    );
  }

  return content;
};

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect' | 'card' | 'list';
  width?: string | number;
  height?: string | number;
  count?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  style,
}) => {
  const baseStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, var(--color-neutral-100) 25%, var(--color-neutral-200) 50%, var(--color-neutral-100) 75%)',
    backgroundSize: '200% 100%',
    animation: 'oneos-skeleton 1.5s ease-in-out infinite',
    borderRadius: 'var(--radius-sm)',
  };

  const getVariantStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'circle':
        return { width: width || 40, height: height || 40, borderRadius: '50%' };
      case 'rect':
        return { width: width || '100%', height: height || 100 };
      case 'card':
        return { width: width || '100%', height: height || 120, borderRadius: 'var(--radius-md)' };
      case 'list':
        return { width: '100%', height: 16, marginBottom: 12 };
      case 'text':
      default:
        return { width: width || '100%', height: height || 14 };
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`oneos-skeleton ${className}`}
          style={{ ...baseStyle, ...getVariantStyle(), ...style, marginBottom: i < count - 1 ? (variant === 'list' ? 12 : 8) : 0 }}
        />
      ))}
      <style>{`
        @keyframes oneos-skeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
};

interface SkeletonCardProps {
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ className = '', style }) => (
  <div
    className={`oneos-skeleton-card ${className}`}
    style={{
      background: '#FFFFFF',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      border: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <Skeleton variant="circle" width={40} height={40} />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
    </div>
    <Skeleton variant="text" count={3} />
  </div>
);

interface ProgressProps {
  value: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  size = 'md',
  color = 'var(--gradient-primary)',
  showLabel = false,
  className = '',
  style,
}) => {
  const heights = { sm: 4, md: 8, lg: 12 };
  const clampedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={`oneos-progress ${className}`} style={{ width: '100%', ...style }}>
      <div
        style={{
          width: '100%',
          height: heights[size],
          background: 'var(--color-neutral-100)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clampedValue}%`,
            height: '100%',
            background: color,
            borderRadius: '999px',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      {showLabel && (
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4, display: 'block' }}>
          {clampedValue}%
        </span>
      )}
    </div>
  );
};
