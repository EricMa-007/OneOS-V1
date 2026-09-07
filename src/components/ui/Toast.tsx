/**
 * OneOS Toast组件
 * 设计系统V3标准Toast通知
 */

import React, { createContext, useContext, useCallback, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const typeConfig: Record<ToastType, { icon: string; bg: string; border: string; color: string }> = {
  success: { icon: '✓', bg: 'var(--color-success-bg)', border: 'var(--color-success)', color: 'var(--color-success)' },
  error: { icon: '✕', bg: 'var(--color-error-bg)', border: 'var(--color-error)', color: 'var(--color-error)' },
  warning: { icon: '⚠', bg: 'var(--color-warning-bg)', border: 'var(--color-warning)', color: '#B8860B' },
  info: { icon: 'ℹ', bg: 'var(--color-info-bg)', border: 'var(--color-info)', color: 'var(--color-info)' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, duration = 3000) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  const value: ToastContextValue = {
    showToast,
    success: (msg, dur) => showToast('success', msg, dur),
    error: (msg, dur) => showToast('error', msg, dur),
    warning: (msg, dur) => showToast('warning', msg, dur),
    info: (msg, dur) => showToast('info', msg, dur),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 'var(--z-toast)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '400px',
        }}
      >
        {toasts.map((toast) => {
          const config = typeConfig[toast.type];
          return (
            <div
              key={toast.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '14px 16px',
                background: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                borderLeft: `4px solid ${config.border}`,
                animation: 'oneos-toastIn var(--duration-slow) var(--ease-spring)',
                cursor: 'pointer',
              }}
              onClick={() => removeToast(toast.id)}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: config.bg,
                  color: config.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {config.icon}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>
                {toast.message}
              </span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes oneos-toastIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
