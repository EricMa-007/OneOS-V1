/**
 * OneOS 全局错误边界
 * 捕获React渲染错误，防止局部错误导致整个应用白屏
 * 设计系统V3标准错误界面
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 记录错误到监控系统（如果已集成）
    if (typeof window !== 'undefined') {
      console.error('[OneOS ErrorBoundary] 捕获到错误:', error, errorInfo);
      // 可以在这里调用错误上报服务
      // window.__oneosErrorMonitor?.captureException(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          background: 'var(--color-bg-primary, #F8F9FC)',
          gap: 16,
        }}>
          {/* 错误图标 */}
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #FF6B6B, #EE5A6F)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(255,107,107,0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>

          {/* 错误标题 */}
          <h2 style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--color-text-primary, #2D3436)',
            margin: 0,
            textAlign: 'center',
          }}>
            页面出错了
          </h2>

          {/* 错误描述 */}
          <p style={{
            fontSize: 14,
            color: 'var(--color-text-secondary, #636E72)',
            margin: 0,
            textAlign: 'center',
            maxWidth: 320,
            lineHeight: 1.6,
          }}>
            抱歉，这个页面遇到了一些问题。您可以尝试刷新页面，错误信息已被记录。
          </p>

          {/* 错误详情（开发环境显示） */}
          {this.state.error && (
            <div style={{
              width: '100%',
              maxWidth: 400,
              padding: 12,
              background: 'var(--color-neutral-100, #F1F2F6)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--color-text-secondary, #636E72)',
              fontFamily: 'monospace',
              overflow: 'auto',
              maxHeight: 120,
            }}>
              {this.state.error.message}
            </div>
          )}

          {/* 操作按钮 */}
          <div style={{
            display: 'flex',
            gap: 12,
            marginTop: 8,
          }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                background: 'var(--color-primary-500, #8B5CF6)',
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              重试
            </button>
            <button
              onClick={this.handleReload}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                background: 'var(--color-neutral-200, #E4E6EB)',
                color: 'var(--color-text-primary, #2D3436)',
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-neutral-300, #DFE1E6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-neutral-200, #E4E6EB)';
              }}
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
