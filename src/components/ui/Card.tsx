/**
 * OneOS 卡片组件
 * 设计系统V3标准卡片
 */

import React from 'react';

export type CardVariant = 'default' | 'hoverable' | 'elevated' | 'gradient' | 'outlined';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  hoverable = false,
  children,
  className = '',
  style,
  onClick,
  ...rest
}) => {
  const paddingStyles: Record<CardPadding, React.CSSProperties> = {
    none: { padding: 0 },
    sm: { padding: '12px' },
    md: { padding: '20px' },
    lg: { padding: '24px' },
  };

  const variantStyles: Record<CardVariant, React.CSSProperties> = {
    default: {
      background: '#FFFFFF',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)',
    },
    hoverable: {
      background: '#FFFFFF',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-sm)',
      cursor: 'pointer',
      transition: 'all var(--duration-base) var(--ease-standard)',
    },
    elevated: {
      background: '#FFFFFF',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-md)',
    },
    gradient: {
      background: 'var(--gradient-primary)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-primary)',
      color: '#FFFFFF',
    },
    outlined: {
      background: 'transparent',
      border: '2px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
    },
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable || variant === 'hoverable') {
      Object.assign(e.currentTarget.style, {
        transform: 'translateY(-2px)',
        boxShadow: 'var(--shadow-md)',
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hoverable || variant === 'hoverable') {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = variantStyles[variant].boxShadow as string;
    }
  };

  return (
    <div
      className={`oneos-card oneos-card--${variant} ${className}`}
      style={{ ...variantStyles[variant], ...paddingStyles[padding], ...style }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...rest}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, className = '' }) => (
  <div className={`oneos-card__header ${className}`} style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border-light)',
  }}>
    <div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{subtitle}</div>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`oneos-card__body ${className}`}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`oneos-card__footer ${className}`} style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-light)',
  }}>
    {children}
  </div>
);
