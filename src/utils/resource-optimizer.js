// ============================================
// OneOS V2 - 资源优化配置
// 图片压缩、字体优化、懒加载、性能监控
// ============================================

(function() {
  'use strict';

  // ============================================
  // 图片懒加载
  // ============================================
  class LazyImageLoader {
    constructor(options = {}) {
      this.options = {
        rootMargin: '50px',
        threshold: 0.1,
        placeholderColor: '#f0f0f0',
        ...options,
      };
      this.observer = null;
      this._init();
    }

    _init() {
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(
          (entries) => this._handleIntersection(entries),
          { rootMargin: this.options.rootMargin, threshold: this.options.threshold }
        );
      }
    }

    _handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
            this.observer.unobserve(img);
          }
        }
      });
    }

    observe(img) {
      if (this.observer) {
        this.observer.observe(img);
      } else {
        // 降级：直接加载
        const src = img.dataset.src;
        if (src) img.src = src;
      }
    }

    observeAll(selector = 'img[data-src]') {
      document.querySelectorAll(selector).forEach(img => this.observe(img));
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    }
  }

  // ============================================
  // 字体优化
  // ============================================
  class FontOptimizer {
    constructor() {
      this.fontsLoaded = false;
      this._init();
    }

    _init() {
      // 使用 font-display: swap 策略
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          this.fontsLoaded = true;
          document.body.classList.add('fonts-loaded');
          console.log('[FontOptimizer] 字体加载完成');
        });
      }
    }

    // 预加载关键字体
    preloadFont(fontUrl) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = fontUrl;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // 动态加载字体
    loadFont(family, url) {
      const fontFace = new FontFace(family, `url(${url})`);
      return fontFace.load().then(loadedFace => {
        document.fonts.add(loadedFace);
        return loadedFace;
      });
    }
  }

  // ============================================
  // 性能监控
  // ============================================
  class PerformanceMonitor {
    constructor() {
      this.metrics = {
        pageLoadTime: 0,
        domReadyTime: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        resourceCount: 0,
        totalTransferSize: 0,
      };
      this._init();
    }

    _init() {
      // 页面加载时间
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.metrics.pageLoadTime = Math.round(navigation.loadEventEnd - navigation.startTime);
          this.metrics.domReadyTime = Math.round(navigation.domContentLoadedEventEnd - navigation.startTime);
        }
        console.log('[PerformanceMonitor] 页面加载完成:', this.metrics);
      });

      // First Paint
      if ('PerformanceObserver' in window) {
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.name === 'first-paint') {
              this.metrics.firstPaint = Math.round(entry.startTime);
            } else if (entry.name === 'first-contentful-paint') {
              this.metrics.firstContentfulPaint = Math.round(entry.startTime);
            }
          });
        });
        paintObserver.observe({ type: 'paint', buffered: true });

        // 资源加载统计
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            this.metrics.resourceCount++;
            this.metrics.totalTransferSize += entry.transferSize || 0;
          });
        });
        resourceObserver.observe({ type: 'resource', buffered: true });
      }
    }

    getMetrics() {
      return { ...this.metrics };
    }

    report() {
      console.log('[PerformanceMonitor] 性能指标:', this.metrics);
      return this.metrics;
    }
  }

  // ============================================
  // 资源预加载
  // ============================================
  class ResourcePreloader {
    constructor() {
      this.preloaded = new Set();
    }

    // 预加载图片
    preloadImage(url) {
      if (this.preloaded.has(url)) return;
      const img = new Image();
      img.src = url;
      this.preloaded.add(url);
    }

    // 预加载多个资源
    preloadAll(urls) {
      urls.forEach(url => {
        if (url.endsWith('.js')) this.preloadScript(url);
        else if (url.endsWith('.css')) this.preloadStyle(url);
        else this.preloadImage(url);
      });
    }

    // 预加载脚本
    preloadScript(url) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = 'script';
      document.head.appendChild(link);
    }

    // 预加载样式
    preloadStyle(url) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      link.as = 'style';
      document.head.appendChild(link);
    }
  }

  // ============================================
  // 图片压缩工具（客户端）
  // ============================================
  const ImageCompressor = {
    // 压缩图片为DataURL
    async compress(file, options = {}) {
      const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        format = 'image/jpeg',
      } = options;

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            // 计算缩放比例
            let { width, height } = img;
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }

            // 绘制到Canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // 导出
            canvas.toBlob(
              (blob) => resolve({ blob, width, height, size: blob.size }),
              format,
              quality
            );
          };
          img.onerror = reject;
          img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    // 生成缩略图
    async generateThumbnail(file, size = 200) {
      return this.compress(file, { maxWidth: size, maxHeight: size, quality: 0.6 });
    },
  };

  // ============================================
  // 统一资源优化管理器
  // ============================================
  class ResourceOptimizer {
    constructor() {
      this.lazyLoader = new LazyImageLoader();
      this.fontOptimizer = new FontOptimizer();
      this.performanceMonitor = new PerformanceMonitor();
      this.preloader = new ResourcePreloader();
    }

    init() {
      // 启动懒加载
      this.lazyLoader.observeAll();
      console.log('[ResourceOptimizer] 资源优化已启动');
    }

    destroy() {
      this.lazyLoader.destroy();
    }
  }

  // ============================================
  // 暴露 API
  // ============================================
  const ResourceOptimization = {
    ResourceOptimizer,
    LazyImageLoader,
    FontOptimizer,
    PerformanceMonitor,
    ResourcePreloader,
    ImageCompressor,
  };

  if (typeof window !== 'undefined') {
    window.ResourceOptimization = ResourceOptimization;
    window.ResourceOptimizer = new ResourceOptimizer();
  }

  console.log('[ResourceOptimization] 资源优化模块已加载');

})();
