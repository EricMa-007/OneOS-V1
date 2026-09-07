/**
 * OneOS 性能监控系统
 * 基于 Web Vitals 的性能指标采集与上报
 */

export interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint (ms)
  FID?: number; // First Input Delay (ms)
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint (ms)
  TTFB?: number; // Time to First Byte (ms)
  INP?: number; // Interaction to Next Paint (ms)

  // 自定义指标
  appLoadTime?: number; // 应用加载时间 (ms)
  firstRenderTime?: number; // 首次渲染时间 (ms)
  bundleSize?: number; // 包体积 (KB)
}

export interface PerformanceReport {
  timestamp: number;
  url: string;
  userAgent: string;
  metrics: PerformanceMetrics;
  deviceInfo: {
    platform: string;
    language: string;
    screenWidth: number;
    screenHeight: number;
    pixelRatio: number;
    connectionType?: string;
    memory?: number;
  };
}

type MetricCallback = (metric: PerformanceMetrics) => void;

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private callbacks: Set<MetricCallback> = new Set();
  private startTime: number = 0;
  private isInitialized: boolean = false;
  private reports: PerformanceReport[] = [];
  private maxReports: number = 100;

  constructor() {
    this.startTime = performance.now();
  }

  /**
   * 初始化性能监控
   */
  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.measureAppLoad();
    this.measureWebVitals();
    this.observeResourceLoading();
    this.observeLongTasks();

    // console.log('[PerformanceMonitor] 性能监控已初始化');
  }

  /**
   * 测量应用加载时间
   */
  private measureAppLoad(): void {
    window.addEventListener('load', () => {
      const loadTime = performance.now() - this.startTime;
      this.metrics.appLoadTime = loadTime;
      this.metrics.firstRenderTime = loadTime;

      // 计算包体积
      const resources = performance.getEntriesByType('resource');
      const totalSize = resources.reduce((sum, resource) => {
        return sum + (resource as PerformanceResourceTiming).transferSize || 0;
      }, 0);
      this.metrics.bundleSize = Math.round(totalSize / 1024);

      this.notifyCallbacks();
      // console.log(`[PerformanceMonitor] 应用加载完成: ${loadTime.toFixed(2)}ms, 包体积: ${this.metrics.bundleSize}KB`);
    });
  }

  /**
   * 测量 Web Vitals 指标
   */
  private measureWebVitals(): void {
    // LCP - Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            this.metrics.LCP = Math.round(lastEntry.startTime);
            this.notifyCallbacks();
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {
        console.warn('[PerformanceMonitor] LCP 测量不支持');
      }

      // FID - First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            this.metrics.FID = Math.round(entry.processingStart - entry.startTime);
            this.notifyCallbacks();
          }
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      } catch (e) {
        console.warn('[PerformanceMonitor] FID 测量不支持');
      }

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.CLS = Number(clsValue.toFixed(4));
              this.notifyCallbacks();
            }
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.warn('[PerformanceMonitor] CLS 测量不支持');
      }

      // FCP - First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.FCP = Math.round(entry.startTime);
              this.notifyCallbacks();
            }
          }
        });
        fcpObserver.observe({ type: 'paint', buffered: true });
      } catch (e) {
        console.warn('[PerformanceMonitor] FCP 测量不支持');
      }

      // TTFB - Time to First Byte
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.TTFB = Math.round(navigation.responseStart - navigation.requestStart);
      }
    }
  }

  /**
   * 观察资源加载
   */
  private observeResourceLoading(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const resources = list.getEntries() as PerformanceResourceTiming[];
        for (const resource of resources) {
          // 记录慢资源 (>2s)
          if (resource.duration > 2000) {
            console.warn(`[PerformanceMonitor] 慢资源: ${resource.name}, 耗时: ${resource.duration.toFixed(2)}ms`);
          }
        }
      });
      resourceObserver.observe({ type: 'resource', buffered: true });
    } catch (e) {
      console.warn('[PerformanceMonitor] 资源观察不支持');
    }
  }

  /**
   * 观察长任务 (>50ms)
   */
  private observeLongTasks(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const longTasks = list.getEntries();
        for (const task of longTasks) {
          console.warn(`[PerformanceMonitor] 长任务: ${task.duration.toFixed(2)}ms, 开始: ${task.startTime.toFixed(2)}ms`);
        }
      });
      longTaskObserver.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      console.warn('[PerformanceMonitor] 长任务观察不支持');
    }
  }

  /**
   * 注册指标回调
   */
  onMetric(callback: MetricCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * 通知所有回调
   */
  private notifyCallbacks(): void {
    for (const callback of this.callbacks) {
      callback({ ...this.metrics });
    }
  }

  /**
   * 获取当前指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 生成性能报告
   */
  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: { ...this.metrics },
      deviceInfo: {
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        pixelRatio: window.devicePixelRatio,
        connectionType: (navigator as unknown).connection?.effectiveType,
        memory: (navigator as unknown).deviceMemory,
      },
    };

    this.reports.push(report);
    if (this.reports.length > this.maxReports) {
      this.reports.shift();
    }

    return report;
  }

  /**
   * 获取所有报告
   */
  getReports(): PerformanceReport[] {
    return [...this.reports];
  }

  /**
   * 评估性能等级
   */
  evaluatePerformance(): { grade: 'A' | 'B' | 'C' | 'D'; score: number; issues: string[] } {
    const issues: string[] = [];
    let score = 100;

    // LCP 评分 (目标 < 2500ms)
    if (this.metrics.LCP) {
      if (this.metrics.LCP > 4000) { score -= 20; issues.push(`LCP 过慢: ${this.metrics.LCP}ms (目标 < 2500ms)`); }
      else if (this.metrics.LCP > 2500) { score -= 10; issues.push(`LCP 偏慢: ${this.metrics.LCP}ms (目标 < 2500ms)`); }
    }

    // FID 评分 (目标 < 100ms)
    if (this.metrics.FID) {
      if (this.metrics.FID > 300) { score -= 15; issues.push(`FID 过高: ${this.metrics.FID}ms (目标 < 100ms)`); }
      else if (this.metrics.FID > 100) { score -= 8; issues.push(`FID 偏高: ${this.metrics.FID}ms (目标 < 100ms)`); }
    }

    // CLS 评分 (目标 < 0.1)
    if (this.metrics.CLS) {
      if (this.metrics.CLS > 0.25) { score -= 15; issues.push(`CLS 过高: ${this.metrics.CLS} (目标 < 0.1)`); }
      else if (this.metrics.CLS > 0.1) { score -= 8; issues.push(`CLS 偏高: ${this.metrics.CLS} (目标 < 0.1)`); }
    }

    // 应用加载时间
    if (this.metrics.appLoadTime) {
      if (this.metrics.appLoadTime > 5000) { score -= 15; issues.push(`应用加载过慢: ${this.metrics.appLoadTime.toFixed(0)}ms`); }
      else if (this.metrics.appLoadTime > 3000) { score -= 8; issues.push(`应用加载偏慢: ${this.metrics.appLoadTime.toFixed(0)}ms`); }
    }

    const grade: 'A' | 'B' | 'C' | 'D' = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : 'D';

    return { grade, score, issues };
  }

  /**
   * 重置指标
   */
  reset(): void {
    this.metrics = {};
    this.startTime = performance.now();
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
export const performanceMonitor = new PerformanceMonitor();

/**
 * React Hook: 使用性能监控
 */
export function usePerformanceMonitor() {
  return {
    metrics: performanceMonitor.getMetrics(),
    report: performanceMonitor.generateReport(),
    evaluation: performanceMonitor.evaluatePerformance(),
  };
}
