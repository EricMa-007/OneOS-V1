// ============================================
// OneOS V2 - 编辑器性能优化模块
// 性能监控、大文件优化、防抖节流、内存管理、虚拟滚动
// ============================================

(function() {
  'use strict';

  // ============================================
  // 配置
  // ============================================
  const CONFIG = {
    largeFileThreshold: 10000,   // 大文件阈值（字符数）
    hugeFileThreshold: 50000,    // 超大文件阈值
    maxRenderChars: 30000,       // 最大渲染字符数
    debounceDelay: 300,           // 默认防抖延迟
    throttleDelay: 100,           // 默认节流延迟
    saveDebounceDelay: 1500,      // 保存防抖延迟
    fpsSampleInterval: 1000,      // FPS采样间隔
    memoryCheckInterval: 30000,   // 内存检查间隔
    maxUndoStackSize: 50,         // 最大撤销栈大小
  };

  // ============================================
  // 性能监控
  // ============================================
  const performanceStats = {
    fps: 60,
    frameCount: 0,
    lastFpsTime: performance.now(),
    renderTime: 0,
    saveTime: 0,
    memoryUsage: 0,
    largeFileMode: false,
    isOptimized: false,
  };

  let fpsMonitorId = null;
  let memoryMonitorId = null;

  /**
   * 启动FPS监控
   */
  function startFpsMonitor() {
    if (fpsMonitorId) return;
    performanceStats.frameCount = 0;
    performanceStats.lastFpsTime = performance.now();

    const countFrame = () => {
      performanceStats.frameCount++;
      const now = performance.now();
      if (now - performanceStats.lastFpsTime >= CONFIG.fpsSampleInterval) {
        performanceStats.fps = Math.round(
          (performanceStats.frameCount * 1000) / (now - performanceStats.lastFpsTime)
        );
        performanceStats.frameCount = 0;
        performanceStats.lastFpsTime = now;
      }
      fpsMonitorId = requestAnimationFrame(countFrame);
    };
    fpsMonitorId = requestAnimationFrame(countFrame);
  }

  /**
   * 停止FPS监控
   */
  function stopFpsMonitor() {
    if (fpsMonitorId) {
      cancelAnimationFrame(fpsMonitorId);
      fpsMonitorId = null;
    }
  }

  /**
   * 启动内存监控
   */
  function startMemoryMonitor() {
    if (memoryMonitorId) return;
    memoryMonitorId = setInterval(() => {
      if (performance.memory) {
        performanceStats.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      }
    }, CONFIG.memoryCheckInterval);
  }

  /**
   * 停止内存监控
   */
  function stopMemoryMonitor() {
    if (memoryMonitorId) {
      clearInterval(memoryMonitorId);
      memoryMonitorId = null;
    }
  }

  /**
   * 获取性能统计
   */
  function getPerformanceStats() {
    return { ...performanceStats };
  }

  // ============================================
  // 防抖和节流
  // ============================================

  /**
   * 防抖函数
   */
  function debounce(fn, delay = CONFIG.debounceDelay) {
    let timer = null;
    return function(...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
        timer = null;
      }, delay);
    };
  }

  /**
   * 节流函数
   */
  function throttle(fn, delay = CONFIG.throttleDelay) {
    let lastTime = 0;
    let timer = null;
    return function(...args) {
      const now = Date.now();
      const remaining = delay - (now - lastTime);
      if (remaining <= 0) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        lastTime = now;
        fn.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          lastTime = Date.now();
          timer = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  }

  /**
   * 使用 requestIdleCallback 的空闲调度
   */
  function scheduleIdleTask(fn, timeout = 1000) {
    if ('requestIdleCallback' in window) {
      return requestIdleCallback(fn, { timeout });
    } else {
      // 降级为 setTimeout
      return setTimeout(fn, 1);
    }
  }

  /**
   * 取消空闲任务
   */
  function cancelIdleTask(id) {
    if ('cancelIdleCallback' in window) {
      cancelIdleCallback(id);
    } else {
      clearTimeout(id);
    }
  }

  // ============================================
  // 大文件检测和优化
  // ============================================

  /**
   * 检测文件大小并返回优化建议
   */
  function detectFileSize(content) {
    if (!content) return { size: 0, level: 'empty', shouldOptimize: false };
    const size = content.length;
    let level = 'normal';
    let shouldOptimize = false;

    if (size >= CONFIG.hugeFileThreshold) {
      level = 'huge';
      shouldOptimize = true;
    } else if (size >= CONFIG.largeFileThreshold) {
      level = 'large';
      shouldOptimize = true;
    }

    return { size, level, shouldOptimize };
  }

  /**
   * 大文件优化策略
   */
  function getOptimizationStrategy(content) {
    const { size, level } = detectFileSize(content);
    const strategies = [];

    if (level === 'large') {
      strategies.push({
        id: 'lazy_render',
        name: '懒渲染',
        description: '只渲染可视区域内容，滚动时逐步加载',
        impact: 'high',
      });
      strategies.push({
        id: 'debounce_save',
        name: '延长保存间隔',
        description: '将自动保存间隔从1.5秒延长到3秒',
        impact: 'medium',
      });
    }

    if (level === 'huge') {
      strategies.push({
        id: 'virtual_scroll',
        name: '虚拟滚动',
        description: '使用虚拟列表，只渲染可视区域DOM',
        impact: 'high',
      });
      strategies.push({
        id: 'chunk_render',
        name: '分块渲染',
        description: '将内容分成多个块，异步逐块渲染',
        impact: 'high',
      });
      strategies.push({
        id: 'disable_animations',
        name: '禁用动画',
        description: '关闭过渡动画，提升渲染性能',
        impact: 'low',
      });
      strategies.push({
        id: 'simplify_formatting',
        name: '简化格式',
        description: '减少复杂格式渲染，使用纯文本模式',
        impact: 'medium',
      });
    }

    return { size, level, strategies };
  }

  /**
   * 分块渲染大内容
   */
  async function chunkedRender(content, renderFn, chunkSize = 5000) {
    const chunks = [];
    for (let i = 0; i < content.length; i += chunkSize) {
      chunks.push(content.slice(i, i + chunkSize));
    }

    for (let i = 0; i < chunks.length; i++) {
      renderFn(chunks[i], i);
      // 让出主线程
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // ============================================
  // 虚拟滚动辅助
  // ============================================

  /**
   * 计算可视区域索引
   */
  function calculateVisibleRange(scrollTop, viewportHeight, itemHeight, totalItems, overscan = 3) {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(totalItems, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan);
    return { startIndex, endIndex, visibleCount: endIndex - startIndex };
  }

  /**
   * 虚拟滚动容器样式
   */
  function getVirtualContainerStyle(totalItems, itemHeight) {
    return {
      height: totalItems * itemHeight,
      position: 'relative',
    };
  }

  /**
   * 虚拟项样式
   */
  function getVirtualItemStyle(index, itemHeight) {
    return {
      position: 'absolute',
      top: index * itemHeight,
      left: 0,
      right: 0,
      height: itemHeight,
    };
  }

  // ============================================
  // 内存管理
  // ============================================

  /**
   * 清理编辑器内存
   */
  function cleanupEditorMemory(editorRef) {
    if (!editorRef?.current) return;
    // 清理选区
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }
    // 移除事件监听器（在组件卸载时调用）
    // 清理临时DOM
  }

  /**
   * 限制撤销栈大小
   */
  function limitUndoStack(undoStack, maxSize = CONFIG.maxUndoStackSize) {
    if (undoStack.length > maxSize) {
      return undoStack.slice(undoStack.length - maxSize);
    }
    return undoStack;
  }

  /**
   * 强制垃圾回收提示（非标准API）
   */
  function suggestGarbageCollection() {
    if (window.gc) {
      try {
        window.gc();
        console.log('[Performance] 手动触发垃圾回收');
      } catch (e) {
        // 忽略
      }
    }
  }

  // ============================================
  // 性能指示器
  // ============================================

  /**
   * 创建性能指示器组件（返回HTML字符串）
   */
  function createPerformanceIndicator(stats) {
    const fpsColor = stats.fps >= 50 ? '#6BCB77' : stats.fps >= 30 ? '#FFD93D' : '#FF6B6B';
    const memoryColor = stats.memoryUsage < 100 ? '#6BCB77' : stats.memoryUsage < 300 ? '#FFD93D' : '#FF6B6B';

    return `
      <div style="
        position: fixed;
        bottom: 16px;
        right: 16px;
        background: rgba(0,0,0,0.8);
        color: #fff;
        padding: 8px 12px;
        border-radius: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 4px;
        pointer-events: none;
      ">
        <div style="display: flex; gap: 12px;">
          <span style="color: ${fpsColor}">FPS: ${stats.fps}</span>
          <span style="color: ${memoryColor}">MEM: ${stats.memoryUsage}MB</span>
        </div>
        <div style="display: flex; gap: 12px; opacity: 0.7;">
          <span>渲染: ${stats.renderTime}ms</span>
          <span>保存: ${stats.saveTime}ms</span>
        </div>
        ${stats.largeFileMode ? '<div style="color: #FFD93D">⚡ 大文件优化模式</div>' : ''}
      </div>
    `;
  }

  // ============================================
  // 性能测量工具
  // ============================================

  /**
   * 测量函数执行时间
   */
  function measureTime(fn, label = 'operation') {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    return { result, duration };
  }

  /**
   * 异步测量函数执行时间
   */
  async function measureTimeAsync(fn, label = 'operation') {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    const duration = end - start;
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    return { result, duration };
  }

  // ============================================
  // 启动和停止
  // ============================================

  /**
   * 启动性能监控
   */
  function startPerformanceMonitor() {
    startFpsMonitor();
    startMemoryMonitor();
    console.log('[Performance] 性能监控已启动');
  }

  /**
   * 停止性能监控
   */
  function stopPerformanceMonitor() {
    stopFpsMonitor();
    stopMemoryMonitor();
    console.log('[Performance] 性能监控已停止');
  }

  // ============================================
  // 暴露 API
  // ============================================

  const PerformanceOptimizer = {
    CONFIG,

    // 监控
    startPerformanceMonitor,
    stopPerformanceMonitor,
    startFpsMonitor,
    stopFpsMonitor,
    startMemoryMonitor,
    stopMemoryMonitor,
    getPerformanceStats,

    // 防抖节流
    debounce,
    throttle,
    scheduleIdleTask,
    cancelIdleTask,

    // 大文件优化
    detectFileSize,
    getOptimizationStrategy,
    chunkedRender,

    // 虚拟滚动
    calculateVisibleRange,
    getVirtualContainerStyle,
    getVirtualItemStyle,

    // 内存管理
    cleanupEditorMemory,
    limitUndoStack,
    suggestGarbageCollection,

    // 性能指示器
    createPerformanceIndicator,

    // 测量工具
    measureTime,
    measureTimeAsync,
  };

  if (typeof window !== 'undefined') {
    window.PerformanceOptimizer = PerformanceOptimizer;
  }

  console.log('[PerformanceOptimizer] 编辑器性能优化模块已加载');

})();
