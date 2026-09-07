/**
 * OneOS 日志系统（Logger）
 * 统一的日志记录接口，支持分级、格式化、上报
 * 
 * 设计原则：
 * - 日志分级：debug / info / warn / error
 * - 生产环境自动降级（debug不输出）
 * - 支持上下文标签（模块名）
 * - 错误日志可上报到监控系统
 * 
 * 作者：A01 崔尼蒂（首席架构师）
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: unknown;
}

class Logger {
  private level: LogLevel = 'info';
  private module: string;
  private history: LogEntry[] = [];
  private maxHistory = 1000;
  private onError?: (entry: LogEntry) => void;

  constructor(module = 'App') {
    this.module = module;
  }

  /**
   * 创建带模块标签的Logger实例
   */
  static create(module: string): Logger {
    return new Logger(module);
  }

  /**
   * 设置全局日志级别
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * 设置错误回调（用于上报监控）
   */
  setErrorCallback(callback: (entry: LogEntry) => void): void {
    this.onError = callback;
  }

  /**
   * 获取日志历史
   */
  getHistory(): LogEntry[] {
    return [...this.history];
  }

  /**
   * 清空日志历史
   */
  clearHistory(): void {
    this.history = [];
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      message,
      data,
    };

    // 保存到历史
    this.history.push(entry);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // 输出到控制台
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.module}]`;
    switch (level) {
      case 'debug':
        // console.debug(prefix, message, data ?? '');
        break;
      case 'info':
        console.info(prefix, message, data ?? '');
        break;
      case 'warn':
        console.warn(prefix, message, data ?? '');
        break;
      case 'error':
        console.error(prefix, message, data ?? '');
        // 错误上报
        this.onError?.(entry);
        break;
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }

  /**
   * 测量函数执行时间
   */
  async time<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    this.debug(`[TIME] ${label} 开始`);
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.debug(`[TIME] ${label} 完成，耗时 ${duration.toFixed(2)}ms`);
      return result;
    } catch (err) {
      const duration = performance.now() - start;
      this.error(`[TIME] ${label} 失败，耗时 ${duration.toFixed(2)}ms`, err);
      throw err;
    }
  }
}

// 全局默认Logger
export const logger = new Logger('OneOS');

// 生产环境自动降级
if (typeof window !== 'undefined') {
  const isProd = window.__ONEOS_ENV__ === 'production';
  if (isProd) {
    logger.setLevel('warn');
  }
  window.OneOSLogger = logger;
}
