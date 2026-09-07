/**
 * OneOS 模态框组件
 * 设计系统V3标准模态框
 */

import React, { useEffect, useCallback } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closable?: boolean;
  maskClosable?: boolean;
  centered?: boolean;
  className?: string;
}

const sizeStyles: Record<ModalSize, React.CSSProperties> = {
  sm: { width: '400px', maxWidth: '90vw' },
  md: { width: '560px', maxWidth: '90vw' },
  lg: { width: '720px', maxWidth: '90vw' },
  xl: { width: '960px', maxWidth: '95vw' },
  full: { width: '100vw', height: '100vh', maxWidth: '100vw', borderRadius: 0 },
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
  maskClosable = true,
  centered = true,
  className = '',
}) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className={`oneos-modal ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: centered ? 'center' : 'flex-start',
        justifyContent: 'center',
        padding: centered ? '24px' : '48px 24px 24px',
      }}
    >
      {/* 遮罩 */}
      <div
        onClick={maskClosable ? onClose : undefined}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--bg-overlay)',
          backdropFilter: 'blur(4px)',
          animation: 'oneos-fadeIn var(--duration-base) var(--ease-decelerate)',
        }}
      />

      {/* 内容 */}
      <div
        style={{
          position: 'relative',
          background: '#FFFFFF',
          borderRadius: size === 'full' ? 0 : 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: size === 'full' ? '100vh' : '85vh',
          overflow: 'hidden',
          animation: 'oneos-modalIn var(--duration-slow) var(--ease-spring)',
          ...sizeStyles[size],
        }}
      >
        {/* 头部 */}
        {(title || closable) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-light)',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
            {closable && (
              <button
                onClick={onClose}
                style={{
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  background: 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  color: 'var(--text-tertiary)',
                  transition: 'all var(--duration-fast)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* 内容区 */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px',
        }}>
          {children}
        </div>

        {/* 底部 */}
        {footer && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid var(--border-light)',
            flexShrink: 0,
          }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes oneos-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes oneos-modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

interface ConfirmModalProps {
  open: boolean;
  title: string;
  content: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmType?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  content,
  confirmText = '确认',
  cancelText = '取消',
  confirmType = 'primary',
  onConfirm,
  onCancel,
}) => (
  <Modal
    open={open}
    onClose={onCancel}
    title={title}
    size="sm"
    footer={
      <>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            background: 'var(--bg-hover)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
          }}
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          style={{
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#FFFFFF',
            background: confirmType === 'danger' ? 'var(--color-error)' : 'var(--gradient-primary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            boxShadow: confirmType === 'danger' ? '0 4px 16px rgba(255,107,107,0.25)' : 'var(--shadow-primary)',
          }}
        >
          {confirmText}
        </button>
      </>
    }
  >
    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{content}</div>
  </Modal>
);
