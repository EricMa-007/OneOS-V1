/**
 * OneOS 错误监控与上报系统
 * 全局错误捕获、错误分类、错误上报
 */

export type ErrorLevel = 'error' | 'warning' | 'info' | 'critical';

export type ErrorType =
  | 'javascript'
  | 'promise'
  | 'resource'
  | 'http'
  | 'react'
  | 'performance'
  | 'custom';

export interface ErrorReport {
  id: string;
  timestamp: number;
  level: ErrorLevel;
  type: ErrorType;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  componentStack?: string;
  extra?: Record<string, any>;
  userInfo?: {
    userId?: string;
    sessionId?: string;
  };
  deviceInfo: {
    platform: string;
    language: string;
    screenWidth: number;
    screenHeight: number;
    pixelRatio: number;
    memory?: number;
    connectionType?: string;
  };
}

type ErrorCallback = (error: ErrorReport) => void;

class ErrorMonitor {
  private errors: ErrorReport[] = [];
  private callbacks: Set<ErrorCallback> = new Set();
  private isInitialized: boolean = false;
  private maxErrors: number = 200;
  private sessionId: string = '';
  private userId: string = '';
  // 保存原始console引用，防止拦截后形成无限循环
  private originalConsoleError: (...args: unknown[]) => void = console.error.bind(console);
  private originalConsoleWarn: (...args: unknown[]) => void = console.warn.bind(console);
  // 递归保护标志位
  private isReporting: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * 初始化错误监控
   */
  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.captureJavaScriptErrors();
    this.capturePromiseRejections();
    this.captureResourceErrors();
    this.captureConsoleErrors();
  }

  /**
   * 捕获 JavaScript 错误
   */
  private captureJavaScriptErrors(): void {
    window.addEventListener('error', (event) => {
      // 忽略资源加载错误（单独处理）
      if (event.target && (event.target as unknown).src) {
        return;
      }

      this.report({
        level: 'error',
        type: 'javascript',
        message: event.message,
        stack: event.error?.stack,
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    }, true);
  }

  /**
   * 捕获 Promise 未处理拒绝
   */
  private capturePromiseRejections(): void {
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason;
      let message = 'Unhandled Promise Rejection';
      let stack: string | undefined;

      if (reason instanceof Error) {
        message = reason.message;
        stack = reason.stack;
      } else if (typeof reason === 'string') {
        message = reason;
      } else {
        try {
          message = JSON.stringify(reason);
        } catch {
          message = String(reason);
        }
      }

      this.report({
        level: 'error',
        type: 'promise',
        message,
        stack,
        extra: { reason },
      });
    });
  }

  /**
   * 捕获资源加载错误
   */
  private captureResourceErrors(): void {
    window.addEventListener('error', (event) => {
      const target = event.target as unknown;
      if (!target) return;

      // 图片、脚本、样式等资源加载错误
      if (target.src || target.href) {
        const resourceUrl = target.src || target.href;
        const resourceType = target.tagName?.toLowerCase() || 'unknown';

        this.report({
          level: 'warning',
          type: 'resource',
          message: `资源加载失败: ${resourceType} - ${resourceUrl}`,
          extra: {
            resourceUrl,
            resourceType,
            tagName: target.tagName,
          },
        });
      }
    }, true);
  }

  /**
   * 捕获 console.error
   */
  private captureConsoleErrors(): void {
    const originalError = this.originalConsoleError;
    console.error = (...args: unknown[]) => {
      // 过滤 React 开发模式的一些警告
      const message = args.map((arg) => {
        if (arg instanceof Error) return arg.message;
        if (typeof arg === 'object') {
          try { return JSON.stringify(arg); } catch { return String(arg); }
        }
        return String(arg);
      }).join(' ');

      // 只上报真正的错误，过滤开发警告，且防止递归
      if (!this.isReporting && !message.includes('Warning:') && !message.includes('React DevTools') && !message.includes('[ErrorMonitor]')) {
        this.report({
          level: 'error',
          type: 'javascript',
          message: `console.error: ${message}`,
          extra: { args },
        });
      }

      originalError.apply(console, args);
    };
  }

  /**
   * 上报 HTTP 错误
   */
  reportHttpError(status: number, url: string, method: string, response?: unknown): void {
    this.report({
      level: status >= 500 ? 'critical' : 'error',
      type: 'http',
      message: `HTTP ${status} ${method} ${url}`,
      extra: {
        status,
        url,
        method,
        response,
      },
    });
  }

  /**
   * 上报 React 错误
   */
  reportReactError(error: Error, componentStack?: string): void {
    this.report({
      level: 'critical',
      type: 'react',
      message: error.message,
      stack: error.stack,
      componentStack,
    });
  }

  /**
   * 上报自定义错误
   */
  reportCustom(message: string, extra?: Record<string, any>, level: ErrorLevel = 'error'): void {
    this.report({
      level,
      type: 'custom',
      message,
      extra,
    });
  }

  /**
   * 上报性能问题
   */
  reportPerformanceIssue(message: string, metrics?: Record<string, number>): void {
    this.report({
      level: 'warning',
      type: 'performance',
      message,
      extra: { metrics },
    });
  }

  /**
   * 核心上报方法
   */
  private report(error: Omit<ErrorReport, 'id' | 'timestamp' | 'url' | 'userAgent' | 'deviceInfo' | 'userInfo'>): void {
    // 递归保护：防止report内部调用console.error导致无限循环
    if (this.isReporting) return;
    this.isReporting = true;

    try {
      const errorReport: ErrorReport = {
        id: this.generateErrorId(),
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        deviceInfo: this.getDeviceInfo(),
        userInfo: {
          userId: this.userId,
          sessionId: this.sessionId,
        },
        ...error,
      };

      // 存储错误
      this.errors.push(errorReport);
      if (this.errors.length > this.maxErrors) {
        this.errors.shift();
      }

      // 通知回调
      for (const callback of this.callbacks) {
        try {
          callback(errorReport);
        } catch (callbackError) {
          // 回调错误不影响主流程
          this.originalConsoleError('[ErrorMonitor] 回调执行失败', callbackError);
        }
      }

      // 控制台输出（使用原始console引用，避免被拦截形成循环）
      if (error.level === 'critical' || error.level === 'error') {
        this.originalConsoleError(`[ErrorMonitor] [${error.type.toUpperCase()}] ${error.message}`, error.stack || '');
      } else if (error.level === 'warning') {
        this.originalConsoleWarn(`[ErrorMonitor] [${error.type.toUpperCase()}] ${error.message}`);
      }
    } finally {
      this.isReporting = false;
    }
  }

  /**
   * 注册错误回调
   */
  onError(callback: ErrorCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * 获取所有错误
   */
  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  /**
   * 按类型获取错误
   */
  getErrorsByType(type: ErrorType): ErrorReport[] {
    return this.errors.filter((e) => e.type === type);
  }

  /**
   * 按等级获取错误
   */
  getErrorsByLevel(level: ErrorLevel): ErrorReport[] {
    return this.errors.filter((e) => e.level === level);
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    byLevel: Record<ErrorLevel, number>;
    criticalCount: number;
    errorCount: number;
    warningCount: number;
  } {
    const byType: Record<string, number> = {};
    const byLevel: Record<string, number> = {};

    for (const error of this.errors) {
      byType[error.type] = (byType[error.type] || 0) + 1;
      byLevel[error.level] = (byLevel[error.level] || 0) + 1;
    }

    return {
      total: this.errors.length,
      byType: byType as Record<ErrorType, number>,
      byLevel: byLevel as Record<ErrorLevel, number>,
      criticalCount: byLevel['critical'] || 0,
      errorCount: byLevel['error'] || 0,
      warningCount: byLevel['warning'] || 0,
    };
  }

  /**
   * 清空错误
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * 设置用户ID
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * 获取设备信息
   */
  private getDeviceInfo(): ErrorReport['deviceInfo'] {
    return {
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      pixelRatio: window.devicePixelRatio,
      memory: (navigator as unknown).deviceMemory,
      connectionType: (navigator as unknown).connection?.effectiveType,
    };
  }

  /**
   * 生成错误ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 导出错误报告（JSON）
   */
  exportErrors(): string {
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      sessionId: this.sessionId,
      errors: this.errors,
      stats: this.getErrorStats(),
    }, null, 2);
  }

  /**
   * 销毁监控
   */
  destroy(): void {
    this.callbacks.clear();
    this.isInitialized = false;
  }
}

// 单例导出
export const errorMonitor = new ErrorMonitor();

/**
 * React Hook: 使用错误监控
 */
export function useErrorMonitor() {
  return {
    errors: errorMonitor.getErrors(),
    stats: errorMonitor.getErrorStats(),
    reportCustom: errorMonitor.reportCustom.bind(errorMonitor),
    reportHttpError: errorMonitor.reportHttpError.bind(errorMonitor),
    clearErrors: errorMonitor.clearErrors.bind(errorMonitor),
  };
}
