/**
 * UniSci Platform V2 - 移动端性能优化模块
 * 包含：图片懒加载、虚拟列表、性能监控、防抖节流、代码分割、内存优化
 *
 * 使用方式:
 *   PerformanceOptimizer.init()
 *   PerformanceOptimizer.lazyLoadImages(container)
 *   PerformanceOptimizer.createVirtualList(config)
 *   PerformanceOptimizer.getMetrics()
 */

'use strict';

const PerformanceOptimizer = (function() {
  // 性能指标
  const metrics = {
    startTime: performance.now(),
    fps: 60,
    frameCount: 0,
    lastFpsTime: performance.now(),
    memory: { used: 0, total: 0 },
    loadTime: 0,
    domReadyTime: 0,
    firstPaint: 0,
    pageErrors: 0,
    resourceCount: 0,
  };

  // 懒加载观察器
  let lazyImageObserver = null;

  // =========================================================================
  // 初始化
  // =========================================================================
  function init() {
    // 性能监控
    startPerformanceMonitoring();

    // 图片懒加载
    initLazyLoading();

    // 全局错误监控
    initErrorMonitoring();

    // 资源加载监控
    initResourceMonitoring();

    // 页面可见性变化时暂停/恢复监控
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopFpsMonitoring();
      } else {
        startFpsMonitoring();
      }
    });

    console.log('[PerformanceOptimizer] 性能优化模块已初始化');
  }

  // =========================================================================
  // 性能监控
  // =========================================================================
  function startPerformanceMonitoring() {
    // DOM加载时间
    if (document.readyState === 'complete') {
      metrics.loadTime = performance.now() - metrics.startTime;
    } else {
      window.addEventListener('load', () => {
        metrics.loadTime = performance.now() - metrics.startTime;
      });
    }

    // DOMContentLoaded
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      metrics.domReadyTime = performance.now() - metrics.startTime;
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        metrics.domReadyTime = performance.now() - metrics.startTime;
      });
    }

    // FPS监控
    startFpsMonitoring();

    // 内存监控（Chrome支持）
    if (performance.memory) {
      setInterval(() => {
        metrics.memory.used = performance.memory.usedJSHeapSize;
        metrics.memory.total = performance.memory.jsHeapSizeLimit;
      }, 5000);
    }
  }

  function startFpsMonitoring() {
    let lastTime = performance.now();
    let frames = 0;

    function countFrame() {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        metrics.fps = Math.round(frames * 1000 / (now - lastTime));
        metrics.frameCount += frames;
        frames = 0;
        lastTime = now;
      }
      requestAnimationFrame(countFrame);
    }
    countFrame();
  }

  function stopFpsMonitoring() {
    // requestAnimationFrame会自动暂停
  }

  function getMetrics() {
    return {
      fps: metrics.fps,
      loadTime: Math.round(metrics.loadTime) + 'ms',
      domReadyTime: Math.round(metrics.domReadyTime) + 'ms',
      memory: metrics.memory.used ? {
        used: (metrics.memory.used / 1024 / 1024).toFixed(1) + 'MB',
        total: (metrics.memory.total / 1024 / 1024).toFixed(1) + 'MB',
        usage: ((metrics.memory.used / metrics.memory.total) * 100).toFixed(1) + '%',
      } : '不支持',
      pageErrors: metrics.pageErrors,
      resourceCount: metrics.resourceCount,
      uptime: Math.round((performance.now() - metrics.startTime) / 1000) + 's',
    };
  }

  function showMetricsPanel() {
    const panel = document.createElement('div');
    panel.id = 'perf-metrics-panel';
    panel.style.cssText = `
      position: fixed; top: 10px; right: 10px; z-index: 99999;
      background: rgba(0,0,0,0.8); color: #0f0; padding: 10px 14px;
      border-radius: 10px; font-family: monospace; font-size: 11px;
      line-height: 1.8; pointer-events: auto; cursor: move;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    function update() {
      const m = getMetrics();
      panel.innerHTML = `
        <div style="font-weight:bold;color:#0f0;margin-bottom:4px">📊 性能监控</div>
        <div>FPS: <span style="color:${m.fps >= 50 ? '#0f0' : m.fps >= 30 ? '#ff0' : '#f00'}">${m.fps}</span></div>
        <div>加载: ${m.loadTime}</div>
        <div>DOM: ${m.domReadyTime}</div>
        <div>内存: ${typeof m.memory === 'string' ? m.memory : m.memory.used + ' / ' + m.memory.total + ' (' + m.memory.usage + ')'}</div>
        <div>错误: ${m.pageErrors}</div>
        <div>运行: ${m.uptime}</div>
        <div style="margin-top:4px;color:#888;font-size:10px">点击关闭</div>
      `;
    }

    update();
    const interval = setInterval(update, 1000);

    panel.addEventListener('click', () => {
      clearInterval(interval);
      panel.remove();
    });

    // 拖拽
    let isDragging = false, startX, startY, origX, origY;
    panel.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX; startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      origX = rect.left; origY = rect.top;
    });
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panel.style.left = (origX + e.clientX - startX) + 'px';
      panel.style.top = (origY + e.clientY - startY) + 'px';
      panel.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => { isDragging = false; });

    document.body.appendChild(panel);
  }

  // =========================================================================
  // 图片懒加载
  // =========================================================================
  function initLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      // 降级：直接加载所有图片
      document.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
      return;
    }

    lazyImageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            // 添加加载动画
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            img.onload = () => { img.style.opacity = '1'; };
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          lazyImageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01,
    });

    // 观察现有图片
    lazyLoadImages(document);
  }

  function lazyLoadImages(container) {
    const root = container || document;
    root.querySelectorAll('img[data-src]').forEach(img => {
      if (lazyImageObserver) {
        lazyImageObserver.observe(img);
      } else {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
  }

  // =========================================================================
  // 虚拟列表
  // =========================================================================
  function createVirtualList(config) {
    const {
      container,
      items = [],
      itemHeight = 60,
      renderItem,
      overscan = 5,
    } = config;

    if (!container) return null;

    // 设置容器样式
    container.style.position = 'relative';
    container.style.overflow = 'auto';
    container.style.contain = 'strict';

    // 创建内容容器
    const content = document.createElement('div');
    content.style.position = 'relative';
    content.style.height = (items.length * itemHeight) + 'px';
    container.appendChild(content);

    // 创建可见项容器
    const visibleContainer = document.createElement('div');
    visibleContainer.style.position = 'absolute';
    visibleContainer.style.top = '0';
    visibleContainer.style.left = '0';
    visibleContainer.style.right = '0';
    content.appendChild(visibleContainer);

    let lastStart = -1;
    let lastEnd = -1;

    function update() {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;

      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const end = Math.min(items.length, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan);

      if (start === lastStart && end === lastEnd) return;
      lastStart = start;
      lastEnd = end;

      // 渲染可见项
      visibleContainer.innerHTML = '';
      for (let i = start; i < end; i++) {
        const item = items[i];
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.top = (i * itemHeight) + 'px';
        el.style.left = '0';
        el.style.right = '0';
        el.style.height = itemHeight + 'px';
        el.innerHTML = renderItem(item, i);
        visibleContainer.appendChild(el);
      }
    }

    container.addEventListener('scroll', update, { passive: true });
    update();

    return {
      update,
      setItems(newItems) {
        items = newItems;
        content.style.height = (items.length * itemHeight) + 'px';
        lastStart = -1;
        update();
      },
      destroy() {
        container.removeEventListener('scroll', update);
        content.remove();
      },
    };
  }

  // =========================================================================
  // 防抖/节流
  // =========================================================================
  function debounce(fn, delay = 300) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function throttle(fn, limit = 300) {
    let inThrottle = false;
    return function(...args) {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  }

  // =========================================================================
  // 代码分割（动态加载）
  // =========================================================================
  const loadedScripts = new Set();

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (loadedScripts.has(src)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        loadedScripts.add(src);
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadCSS(href) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve();
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  // =========================================================================
  // 错误监控
  // =========================================================================
  function initErrorMonitoring() {
    window.addEventListener('error', (e) => {
      metrics.pageErrors++;
      console.warn('[Perf] 页面错误:', e.message, e.filename, e.lineno);
    });

    window.addEventListener('unhandledrejection', (e) => {
      metrics.pageErrors++;
      console.warn('[Perf] Promise拒绝:', e.reason);
    });
  }

  // =========================================================================
  // 资源监控
  // =========================================================================
  function initResourceMonitoring() {
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            metrics.resourceCount++;
          });
        });
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        // 不支持
      }
    }
  }

  // =========================================================================
  // 骨架屏生成
  // =========================================================================
  function createSkeleton(count = 3, options = {}) {
    const {
      height = 80,
      radius = 12,
      avatar = true,
      lines = 2,
    } = options;

    return Array.from({ length: count }, () => `
      <div style="background:var(--card);border-radius:${radius}px;padding:16px;margin-bottom:12px;display:flex;gap:12px;align-items:center">
        ${avatar ? '<div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;flex-shrink:0"></div>' : ''}
        <div style="flex:1">
          ${Array.from({ length: lines }, (_, i) => `
            <div style="height:${i === 0 ? 14 : 12}px;width:${i === 0 ? '60%' : '40%'};border-radius:6px;background:linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;${i > 0 ? 'margin-top:8px' : ''}"></div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // 确保shimmer动画存在
  function ensureSkeletonStyle() {
    if (!document.getElementById('skeleton-animation-style')) {
      const style = document.createElement('style');
      style.id = 'skeleton-animation-style';
      style.textContent = '@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }';
      document.head.appendChild(style);
    }
  }

  // =========================================================================
  // 自动初始化
  // =========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      ensureSkeletonStyle();
    });
  } else {
    init();
    ensureSkeletonStyle();
  }

  // 键盘快捷键：Ctrl+Shift+P 显示性能面板
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      showMetricsPanel();
    }
  });

  // =========================================================================
  // 公开API
  // =========================================================================
  return {
    init,
    lazyLoadImages,
    createVirtualList,
    debounce,
    throttle,
    loadScript,
    loadCSS,
    getMetrics,
    showMetricsPanel,
    createSkeleton,
  };
})();

// 导出
if (typeof window !== 'undefined') {
  window.PerformanceOptimizer = PerformanceOptimizer;
}
