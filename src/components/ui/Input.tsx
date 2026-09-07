/**
 * OneOS 输入框组件
 * 设计系统V3标准输入框
 */

import React, { useState } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputStatus = 'default' | 'error' | 'success' | 'warning';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  status?: InputStatus;
  label?: string;
  helperText?: string;
  errorText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export const Input: React.FC<InputProps> = ({
  size = 'md',
  status = 'default',
  label,
  helperText,
  errorText,
  prefix,
  suffix,
  clearable = false,
  onClear,
  className = '',
  style,
  value,
  onChange,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const sizeStyles: Record<InputSize, React.CSSProperties> = {
    sm: { height: '28px', fontSize: '12px', padding: '0 10px' },
    md: { height: '36px', fontSize: '14px', padding: '0 12px' },
    lg: { height: '44px', fontSize: '16px', padding: '0 16px' },
  };

  const statusStyles: Record<InputStatus, React.CSSProperties> = {
    default: {
      border: isFocused ? '2px solid var(--color-primary-500)' : '1px solid var(--border-default)',
      boxShadow: isFocused ? '0 0 0 3px rgba(139,92,246,0.1)' : 'none',
    },
    error: {
      border: isFocused ? '2px solid var(--color-error)' : '1px solid var(--color-error)',
      boxShadow: isFocused ? '0 0 0 3px rgba(255,107,107,0.1)' : 'none',
    },
    success: {
      border: isFocused ? '2px solid var(--color-success)' : '1px solid var(--color-success)',
      boxShadow: isFocused ? '0 0 0 3px rgba(0,184,148,0.1)' : 'none',
    },
    warning: {
      border: isFocused ? '2px solid var(--color-warning)' : '1px solid var(--color-warning)',
      boxShadow: isFocused ? '0 0 0 3px rgba(253,203,110,0.1)' : 'none',
    },
  };

  const showError = status === 'error' && errorText;
  const showHelper = !showError && helperText;

  return (
    <div className={`oneos-input-wrapper ${className}`} style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}>
          {label}
        </label>
      )}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: isFocused ? '#FFFFFF' : 'var(--bg-input)',
        borderRadius: 'var(--radius-sm)',
        transition: 'all var(--duration-fast) var(--ease-standard)',
        ...statusStyles[status],
        ...sizeStyles[size],
        ...style,
      }}>
        {prefix && <span style={{ marginRight: '8px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>{prefix}</span>}
        <input
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 'inherit',
            color: 'var(--text-primary)',
            width: '100%',
            padding: 0,
            fontFamily: 'inherit',
          }}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {clearable && value && (
          <button
            type="button"
            onClick={onClear}
            style={{
              marginLeft: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
            }}
          >
            ✕
          </button>
        )}
        {suffix && <span style={{ marginLeft: '8px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>{suffix}</span>}
      </div>
      {showError && (
        <div style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>{errorText}</div>
      )}
      {showHelper && (
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{helperText}</div>
      )}
    </div>
  );
};

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: InputSize;
  status?: InputStatus;
  label?: string;
  helperText?: string;
  errorText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  size = 'md',
  status = 'default',
  label,
  helperText,
  errorText,
  className = '',
  style,
  rows = 4,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const sizeStyles: Record<InputSize, React.CSSProperties> = {
    sm: { fontSize: '12px', padding: '8px 10px' },
    md: { fontSize: '14px', padding: '10px 12px' },
    lg: { fontSize: '16px', padding: '12px 16px' },
  };

  const showError = status === 'error' && errorText;

  return (
    <div className={`oneos-textarea-wrapper ${className}`} style={{ width: '100%' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: 500,
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}>
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        style={{
          width: '100%',
          border: isFocused ? '2px solid var(--color-primary-500)' : '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          background: isFocused ? '#FFFFFF' : 'var(--bg-input)',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
          color: 'var(--text-primary)',
          boxShadow: isFocused ? '0 0 0 3px rgba(139,92,246,0.1)' : 'none',
          transition: 'all var(--duration-fast) var(--ease-standard)',
          ...sizeStyles[size],
          ...style,
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...rest}
      />
      {showError && (
        <div style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>{errorText}</div>
      )}
      {!showError && helperText && (
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{helperText}</div>
      )}
    </div>
  );
};
