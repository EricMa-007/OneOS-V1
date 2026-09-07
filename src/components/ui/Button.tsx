/**
 * OneOS 按钮组件
 * 设计系统V3标准按钮
 */

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'default' | 'round' | 'circle';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  shape = 'default',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  disabled,
  className = '',
  style,
  ...rest
}) => {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--font-weight-semibold)',
    border: 'none',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    transition: 'all var(--duration-fast) var(--ease-standard)',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    opacity: loading || disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : undefined,
  };

  const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
    sm: { height: '28px', padding: '0 12px', fontSize: '12px', borderRadius: 'var(--radius-sm)' },
    md: { height: '36px', padding: '0 16px', fontSize: '14px', borderRadius: 'var(--radius-md)' },
    lg: { height: '44px', padding: '0 20px', fontSize: '16px', borderRadius: 'var(--radius-md)' },
  };

  const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: 'var(--gradient-primary)',
      color: '#FFFFFF',
      boxShadow: 'var(--shadow-primary)',
    },
    secondary: {
      background: '#FFFFFF',
      color: 'var(--color-primary-600)',
      border: '1px solid var(--color-primary-200)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
    },
    danger: {
      background: 'var(--color-error)',
      color: '#FFFFFF',
      boxShadow: '0 4px 16px rgba(255,107,107,0.25)',
    },
    gradient: {
      background: 'var(--gradient-primary)',
      color: '#FFFFFF',
      boxShadow: 'var(--shadow-primary)',
    },
  };

  const shapeStyles: Record<ButtonShape, React.CSSProperties> = {
    default: {},
    round: { borderRadius: 'var(--radius-full)' },
    circle: {
      borderRadius: '50%',
      padding: 0,
      width: size === 'sm' ? '28px' : size === 'lg' ? '44px' : '36px',
      height: size === 'sm' ? '28px' : size === 'lg' ? '44px' : '36px',
    },
  };

  const hoverStyles: React.CSSProperties = loading || disabled ? {} : {
    transform: 'translateY(-1px)',
    boxShadow: variant === 'primary' || variant === 'gradient'
      ? '0 6px 20px rgba(139,92,246,0.35)'
      : variant === 'danger'
      ? '0 6px 20px rgba(255,107,107,0.35)'
      : 'var(--shadow-md)',
  };

  const activeStyles: React.CSSProperties = loading || disabled ? {} : {
    transform: 'translateY(0) scale(0.98)',
  };

  return (
    <button
      className={`oneos-button oneos-button--${variant} oneos-button--${size} ${className}`}
      style={{ ...baseStyles, ...sizeStyles[size], ...variantStyles[variant], ...shapeStyles[shape], ...style }}
      disabled={disabled || loading}
      onMouseEnter={(e) => Object.assign(e.currentTarget.style, hoverStyles)}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow || '';
      }}
      onMouseDown={(e) => Object.assign(e.currentTarget.style, activeStyles)}
      onMouseUp={(e) => Object.assign(e.currentTarget.style, hoverStyles)}
      {...rest}
    >
      {loading && (
        <span style={{
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'oneos-spin 0.8s linear infinite',
        }} />
      )}
      {!loading && icon && iconPosition === 'left' && <span className="oneos-button__icon">{icon}</span>}
      {children && <span className="oneos-button__text">{children}</span>}
      {!loading && icon && iconPosition === 'right' && <span className="oneos-button__icon">{icon}</span>}
      <style>{`
        @keyframes oneos-spin {
          to { transform: rotate(360deg); }
        }
        .oneos-button:focus-visible {
          outline: 2px solid var(--color-primary-500);
          outline-offset: 2px;
        }
      `}</style>
    </button>
  );
};
