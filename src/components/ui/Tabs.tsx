/**
 * OneOS Tabs组件
 * 标签页切换
 */

import React, { useState } from 'react';

export type TabVariant = 'default' | 'pills' | 'underline' | 'segmented';
export type TabSize = 'sm' | 'md' | 'lg';

interface TabItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  variant?: TabVariant;
  size?: TabSize;
  className?: string;
  style?: React.CSSProperties;
}

const sizeStyles: Record<TabSize, React.CSSProperties> = {
  sm: { height: '28px', padding: '0 12px', fontSize: '12px' },
  md: { height: '36px', padding: '0 16px', fontSize: '14px' },
  lg: { height: '44px', padding: '0 20px', fontSize: '16px' },
};

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  variant = 'default',
  size = 'md',
  className = '',
  style,
}) => {
  const [internalKey, setInternalKey] = useState(defaultActiveKey || items[0]?.key);
  const currentKey = activeKey || internalKey;

  const handleClick = (key: string) => {
    if (activeKey === undefined) {
      setInternalKey(key);
    }
    onChange?.(key);
  };

  const renderTab = (item: TabItem) => {
    const isActive = currentKey === item.key;
    const isDisabled = item.disabled;

    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      opacity: isDisabled ? 0.5 : 1,
      transition: 'all var(--duration-fast) var(--ease-standard)',
      ...sizeStyles[size],
    };

    if (variant === 'pills') {
      return (
        <div
          key={item.key}
          style={{
            ...baseStyle,
            borderRadius: 'var(--radius-full)',
            background: isActive ? 'var(--gradient-primary)' : 'transparent',
            color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: isActive ? 600 : 500,
          }}
          onClick={() => !isDisabled && handleClick(item.key)}
          onMouseEnter={(e) => {
            if (!isActive && !isDisabled) e.currentTarget.style.background = 'var(--bg-hover)';
          }}
          onMouseLeave={(e) => {
            if (!isActive && !isDisabled) e.currentTarget.style.background = 'transparent';
          }}
        >
          {item.icon}
          {item.label}
          {item.badge}
        </div>
      );
    }

    if (variant === 'underline') {
      return (
        <div
          key={item.key}
          style={{
            ...baseStyle,
            borderBottom: isActive ? '2px solid var(--color-primary-500)' : '2px solid transparent',
            color: isActive ? 'var(--color-primary-600)' : 'var(--text-secondary)',
            fontWeight: isActive ? 600 : 500,
            marginBottom: -1,
          }}
          onClick={() => !isDisabled && handleClick(item.key)}
          onMouseEnter={(e) => {
            if (!isActive && !isDisabled) e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            if (!isActive && !isDisabled) e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {item.icon}
          {item.label}
          {item.badge}
        </div>
      );
    }

    if (variant === 'segmented') {
      return (
        <div
          key={item.key}
          style={{
            ...baseStyle,
            flex: 1,
            justifyContent: 'center',
            background: isActive ? '#FFFFFF' : 'transparent',
            color: isActive ? 'var(--color-primary-600)' : 'var(--text-secondary)',
            fontWeight: isActive ? 600 : 500,
            boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
            borderRadius: 'var(--radius-sm)',
          }}
          onClick={() => !isDisabled && handleClick(item.key)}
        >
          {item.icon}
          {item.label}
          {item.badge}
        </div>
      );
    }

    // default
    return (
      <div
        key={item.key}
        style={{
          ...baseStyle,
          borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
          background: isActive ? '#FFFFFF' : 'transparent',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontWeight: isActive ? 600 : 500,
          border: isActive ? '1px solid var(--border-light)' : '1px solid transparent',
          borderBottom: isActive ? '1px solid #FFFFFF' : 'none',
          marginBottom: -1,
        }}
        onClick={() => !isDisabled && handleClick(item.key)}
        onMouseEnter={(e) => {
          if (!isActive && !isDisabled) e.currentTarget.style.color = 'var(--text-primary)';
        }}
        onMouseLeave={(e) => {
          if (!isActive && !isDisabled) e.currentTarget.style.color = 'var(--text-secondary)';
        }}
      >
        {item.icon}
        {item.label}
        {item.badge}
      </div>
    );
  };

  const containerStyle: React.CSSProperties = variant === 'segmented'
    ? {
        display: 'flex',
        background: 'var(--color-neutral-100)',
        borderRadius: 'var(--radius-sm)',
        padding: '4px',
        gap: '4px',
      }
    : variant === 'pills'
    ? { display: 'flex', gap: '4px', flexWrap: 'wrap' }
    : { display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-light)' };

  return (
    <div className={`oneos-tabs oneos-tabs--${variant} ${className}`} style={{ ...containerStyle, ...style }}>
      {items.map(renderTab)}
    </div>
  );
};

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className = '',
  style,
}) => {
  const dimensions = size === 'sm' ? { width: 36, height: 20, knob: 16 } : { width: 44, height: 24, knob: 20 };

  return (
    <label
      className={`oneos-switch ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
        ...style,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: '999px',
          background: checked ? 'var(--gradient-primary)' : 'var(--color-neutral-300)',
          transition: 'all var(--duration-fast) var(--ease-standard)',
          flexShrink: 0,
        }}
        onClick={() => !disabled && onChange(!checked)}
      >
        <div
          style={{
            position: 'absolute',
            top: (dimensions.height - dimensions.knob) / 2,
            left: checked ? dimensions.width - dimensions.knob - 2 : 2,
            width: dimensions.knob,
            height: dimensions.knob,
            borderRadius: '50%',
            background: '#FFFFFF',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'all var(--duration-fast) var(--ease-standard)',
          }}
        />
      </div>
      {label && <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{label}</span>}
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
    </label>
  );
};
