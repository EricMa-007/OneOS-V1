/**
 * OneOS 错误边界（Error Boundary）
 * 捕获React组件树中的JavaScript错误，防止整个应用崩溃
 * 
 * 作者：A01 崔尼蒂（首席架构师）
 */

import React from 'react';
import { logger } from './logger';
import { eventBus, EVENTS } from './event-bus';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('React组件错误', { error, errorInfo });
    this.props.onError?.(error, errorInfo);
    eventBus.emit(EVENTS.APP.LOADING_FINISHED, null);
  }

  componentDidMount(): void {
    // 监听全局错误
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount(): void {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  private handleWindowError = (event: ErrorEvent): void => {
    logger.error('全局错误', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    logger.error('未处理的Promise拒绝', { reason: event.reason });
  };

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={errorStyles.container}>
          <div style={errorStyles.card}>
            <div style={errorStyles.icon}>⚠️</div>
            <h2 style={errorStyles.title}>出了点问题</h2>
            <p style={errorStyles.message}>
              {this.state.error?.message || '发生了未知错误'}
            </p>
            <div style={errorStyles.actions}>
              <button style={errorStyles.button} onClick={this.handleReset}>
                重试
              </button>
              <button
                style={{ ...errorStyles.button, ...errorStyles.buttonSecondary }}
                onClick={() => window.location.reload()}
              >
                刷新页面
              </button>
            </div>
            <details style={errorStyles.details}>
              <summary style={errorStyles.detailsSummary}>错误详情</summary>
              <pre style={errorStyles.detailsContent}>
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const errorStyles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '24px',
    background: 'linear-gradient(135deg, #F0F4FF 0%, #F5F0FF 50%, #FFF0F5 100%)',
  } as React.CSSProperties,
  card: {
    maxWidth: '480px',
    width: '100%',
    padding: '32px',
    background: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
    textAlign: 'center' as const,
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#404040',
    margin: '0 0 8px 0',
  },
  message: {
    fontSize: '14px',
    color: '#737373',
    margin: '0 0 24px 0',
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
    background: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  buttonSecondary: {
    background: '#F5F5F5',
    color: '#404040',
  },
  details: {
    textAlign: 'left' as const,
    marginTop: '16px',
  },
  detailsSummary: {
    fontSize: '12px',
    color: '#A3A3A3',
    cursor: 'pointer',
  },
  detailsContent: {
    marginTop: '8px',
    padding: '12px',
    background: '#FAFAFA',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#737373',
    overflow: 'auto',
    maxHeight: '200px',
  },
};
