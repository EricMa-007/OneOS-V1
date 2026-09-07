/**
 * UniSci Platform V2 - 全局状态管理模块
 * 包含：全局加载指示器、统一错误处理、API状态管理、API调试面板
 *
 * 使用方式:
 *   AppState.showLoading() / AppState.hideLoading()
 *   AppState.showError('网络错误', '请检查网络连接')
 *   AppState.toggleDebugPanel()
 */

'use strict';

const AppState = (function() {
  // =========================================================================
  // 内部状态
  // =========================================================================
  let loadingCount = 0;
  let loadingElement = null;
  let progressElement = null;
  let errorContainer = null;
  let debugPanel = null;
  let debugPanelVisible = false;
  const requestLog = [];
  const MAX_LOG_ENTRIES = 100;

  // =========================================================================
  // 初始化
  // =========================================================================
  function init() {
    createLoadingIndicator();
    createErrorContainer();
    createDebugPanel();
    setupGlobalErrorHandlers();
    setupAPIListeners();
  }

  // =========================================================================
  // 全局加载指示器
  // =========================================================================
  function createLoadingIndicator() {
    // 顶部进度条
    progressElement = document.createElement('div');
    progressElement.id = 'global-progress';
    progressElement.style.cssText = `
      position: fixed; top: 0; left: 0; height: 3px; width: 0%;
      background: linear-gradient(90deg, #ff6b4a, #ff8c6b, #5ba3d9);
      z-index: 99999; transition: width 0.3s ease, opacity 0.3s ease;
      box-shadow: 0 0 10px rgba(255,107,74,0.5); opacity: 0;
    `;
    document.body.appendChild(progressElement);

    // 全屏加载遮罩（可选）
    loadingElement = document.createElement('div');
    loadingElement.id = 'global-loading';
    loadingElement.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(255,255,255,0.6); backdrop-filter: blur(4px);
      z-index: 99998; display: none; align-items: center; justify-content: center;
    `;
    loadingElement.innerHTML = `
      <div style="text-align:center">
        <div style="width:48px;height:48px;border:4px solid #e3f1fa;border-top-color:#ff6b4a;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px"></div>
        <div style="font-size:14px;color:#5a6b7d;font-weight:600">加载中...</div>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
    `;
    document.body.appendChild(loadingElement);
  }

  function showLoading(options = {}) {
    loadingCount++;
    if (loadingCount === 1) {
      // 显示进度条
      progressElement.style.opacity = '1';
      progressElement.style.width = '30%';
      setTimeout(() => { if (loadingCount > 0) progressElement.style.width = '70%'; }, 200);

      // 显示全屏遮罩（如果需要）
      if (options.fullscreen) {
        loadingElement.style.display = 'flex';
      }
    }
  }

  function hideLoading() {
    loadingCount = Math.max(0, loadingCount - 1);
    if (loadingCount === 0) {
      progressElement.style.width = '100%';
      setTimeout(() => {
        progressElement.style.opacity = '0';
        progressElement.style.width = '0%';
      }, 200);
      loadingElement.style.display = 'none';
    }
  }

  function isLoading() {
    return loadingCount > 0;
  }

  // =========================================================================
  // 统一错误处理
  // =========================================================================
  function createErrorContainer() {
    errorContainer = document.createElement('div');
    errorContainer.id = 'error-container';
    errorContainer.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 99997;
      display: flex; flex-direction: column; gap: 10px; max-width: 360px;
    `;
    document.body.appendChild(errorContainer);
  }

  function showError(title, message, options = {}) {
    const errorId = 'error-' + Date.now();
    const errorEl = document.createElement('div');
    errorEl.id = errorId;
    errorEl.style.cssText = `
      background: #fff; border-radius: 16px; padding: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15); border-left: 4px solid #ff6b4a;
      animation: slideIn 0.3s ease; cursor: pointer;
    `;
    errorEl.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#ff6b4a,#ff8c6b);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700;color:#2d3a4a;margin-bottom:4px">${title}</div>
          <div style="font-size:12px;color:#5a6b7d;line-height:1.5">${message}</div>
          ${options.retry ? `<button onclick="AppState.retryLastAction()" style="margin-top:8px;padding:6px 14px;background:linear-gradient(135deg,#ff6b4a,#ff8c6b);color:white;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer">重试</button>` : ''}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#8fa0b3;padding:4px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;

    errorContainer.appendChild(errorEl);

    // 自动消失
    const duration = options.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        errorEl.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => errorEl.remove(), 300);
      }, duration);
    }

    // 点击消失
    errorEl.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        errorEl.remove();
      }
    });
  }

  function showSuccess(title, message) {
    const successEl = document.createElement('div');
    successEl.style.cssText = `
      background: #fff; border-radius: 16px; padding: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15); border-left: 4px solid #5ccf8e;
      animation: slideIn 0.3s ease; cursor: pointer; margin-bottom: 10px;
    `;
    successEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#5ccf8e,#7edda8);display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div>
          <div style="font-size:14px;font-weight:700;color:#2d3a4a">${title}</div>
          <div style="font-size:12px;color:#5a6b7d">${message}</div>
        </div>
      </div>
    `;
    errorContainer.appendChild(successEl);
    setTimeout(() => {
      successEl.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => successEl.remove(), 300);
    }, 3000);
  }

  let lastAction = null;
  function setLastAction(action) {
    lastAction = action;
  }
  function retryLastAction() {
    if (lastAction) {
      lastAction();
    }
  }

  // =========================================================================
  // API状态管理
  // =========================================================================
  function getAPIMode() {
    return localStorage.getItem('unisci_mock_mode') !== 'false';
  }

  function setAPIMode(mockMode) {
    localStorage.setItem('unisci_mock_mode', mockMode ? 'true' : 'false');
    if (typeof APIIntegration !== 'undefined') {
      APIIntegration.setMockMode(mockMode);
    }
  }

  function getAPIBaseURL() {
    return localStorage.getItem('unisci_api_base') || '/api/v1';
  }

  function setAPIBaseURL(url) {
    localStorage.setItem('unisci_api_base', url);
    if (typeof APIIntegration !== 'undefined') {
      APIIntegration.setBaseURL(url);
    }
  }

  function getToken() {
    return localStorage.getItem('unisci_token') || null;
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem('unisci_token', token);
    } else {
      localStorage.removeItem('unisci_token');
    }
  }

  // =========================================================================
  // API调试面板
  // =========================================================================
  function createDebugPanel() {
    debugPanel = document.createElement('div');
    debugPanel.id = 'api-debug-panel';
    debugPanel.style.cssText = `
      position: fixed; bottom: 0; right: 0; width: 100%; max-width: 420px;
      height: 60%; background: #1e293b; color: #e2e8f0; z-index: 99996;
      border-radius: 16px 16px 0 0; display: none; flex-direction: column;
      box-shadow: 0 -8px 32px rgba(0,0,0,0.3); font-family: monospace;
    `;
    debugPanel.innerHTML = `
      <div style="padding:12px 16px;background:#0f172a;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:13px;font-weight:700;color:#f8fafc">🔧 API 调试面板</div>
        <div style="display:flex;gap:8px">
          <button onclick="AppState.clearRequestLog()" style="padding:4px 10px;background:#334155;color:#e2e8f0;border:none;border-radius:6px;font-size:11px;cursor:pointer">清空</button>
          <button onclick="AppState.toggleDebugPanel()" style="padding:4px 10px;background:#ff6b4a;color:white;border:none;border-radius:6px;font-size:11px;cursor:pointer">关闭</button>
        </div>
      </div>
      <div style="padding:8px 16px;background:#1e293b;border-bottom:1px solid #334155;display:flex;gap:12px;font-size:11px">
        <span>模式: <span id="debug-mode" style="color:#ffc857;font-weight:600">模拟</span></span>
        <span>请求: <span id="debug-count" style="color:#5ccf8e;font-weight:600">0</span></span>
        <span>缓存: <span id="debug-cache" style="color:#5ba3d9;font-weight:600">0</span></span>
      </div>
      <div id="debug-log" style="flex:1;overflow-y:auto;padding:8px 16px;font-size:11px;line-height:1.6"></div>
      <div style="padding:8px 16px;background:#0f172a;border-top:1px solid #334155;display:flex;gap:8px">
        <button onclick="AppState.testAPIConnection()" style="flex:1;padding:6px;background:#5ccf8e;color:white;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer">测试连接</button>
        <button onclick="AppState.toggleAPIMode()" style="flex:1;padding:6px;background:#5ba3d9;color:white;border:none;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer">切换模式</button>
      </div>
    `;
    document.body.appendChild(debugPanel);

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
    `;
    document.head.appendChild(style);
  }

  function toggleDebugPanel() {
    debugPanelVisible = !debugPanelVisible;
    debugPanel.style.display = debugPanelVisible ? 'flex' : 'none';
    if (debugPanelVisible) {
      updateDebugPanel();
    }
  }

  function logRequest(method, path, status, duration, fromCache) {
    const entry = {
      time: new Date().toLocaleTimeString(),
      method,
      path,
      status,
      duration,
      fromCache,
    };
    requestLog.unshift(entry);
    if (requestLog.length > MAX_LOG_ENTRIES) {
      requestLog.pop();
    }
    if (debugPanelVisible) {
      updateDebugPanel();
    }
  }

  function updateDebugPanel() {
    const logEl = document.getElementById('debug-log');
    const countEl = document.getElementById('debug-count');
    const cacheEl = document.getElementById('debug-cache');
    const modeEl = document.getElementById('debug-mode');

    if (countEl) countEl.textContent = requestLog.length;
    if (cacheEl) cacheEl.textContent = typeof APIIntegration !== 'undefined' && APIIntegration.getAPI ? APIIntegration.getAPI().cache.size : 0;
    if (modeEl) modeEl.textContent = getAPIMode() ? '模拟' : '真实';

    if (logEl) {
      logEl.innerHTML = requestLog.map(entry => {
        const statusColor = entry.status >= 200 && entry.status < 300 ? '#5ccf8e' : entry.status >= 400 ? '#ff6b4a' : '#ffc857';
        const cacheTag = entry.fromCache ? '<span style="color:#5ba3d9">[缓存]</span>' : '';
        return `<div style="padding:4px 0;border-bottom:1px solid #334155">
          <span style="color:#94a3b8">${entry.time}</span>
          <span style="color:#c084fc;font-weight:600">${entry.method}</span>
          <span style="color:${statusColor};font-weight:600">${entry.status}</span>
          <span style="color:#e2e8f0">${entry.path}</span>
          ${cacheTag}
          <span style="color:#64748b">${entry.duration}ms</span>
        </div>`;
      }).join('');
    }
  }

  function clearRequestLog() {
    requestLog.length = 0;
    updateDebugPanel();
  }

  async function testAPIConnection() {
    if (typeof APIIntegration !== 'undefined') {
      const result = await APIIntegration.system.health();
      if (result.success) {
        showSuccess('API连接正常', '后端服务响应正常');
      } else {
        showError('API连接失败', result.message || '无法连接到后端服务', { retry: true });
      }
    }
  }

  function toggleAPIMode() {
    const current = getAPIMode();
    setAPIMode(!current);
    showSuccess('API模式已切换', !current ? '已切换到真实API模式' : '已切换到模拟数据模式');
    updateDebugPanel();
  }

  // =========================================================================
  // 全局错误处理
  // =========================================================================
  function setupGlobalErrorHandlers() {
    // 全局未捕获错误
    window.addEventListener('error', (e) => {
      console.error('[Global Error]', e.error || e.message);
    });

    // 未处理的Promise拒绝
    window.addEventListener('unhandledrejection', (e) => {
      console.error('[Unhandled Promise]', e.reason);
    });

    // 网络状态变化
    window.addEventListener('online', () => {
      showSuccess('网络已恢复', '已重新连接到网络');
    });
    window.addEventListener('offline', () => {
      showError('网络已断开', '当前处于离线状态，将使用本地模拟数据');
    });
  }

  // =========================================================================
  // API事件监听
  // =========================================================================
  function setupAPIListeners() {
    if (typeof APIIntegration === 'undefined') return;

    // 监听加载状态
    APIIntegration.onLoadingChange((isLoading) => {
      if (isLoading) {
        showLoading();
      } else {
        hideLoading();
      }
    });

    // 监听错误
    APIIntegration.onError((data) => {
      const status = data.error?.status || 0;
      let title = '请求失败';
      let message = data.error?.message || '未知错误';

      if (status === 401) {
        title = '登录已过期';
        message = '请重新登录';
      } else if (status === 403) {
        title = '权限不足';
        message = '您没有权限执行此操作';
      } else if (status === 404) {
        title = '资源不存在';
        message = '请求的资源不存在';
      } else if (status >= 500) {
        title = '服务器错误';
        message = '服务器暂时不可用，请稍后重试';
      } else if (status === 0) {
        title = '网络错误';
        message = '无法连接到服务器，已自动切换到模拟数据';
      }

      showError(title, message, { retry: status >= 500 || status === 0 });
    });
  }

  // =========================================================================
  // 骨架屏
  // =========================================================================
  function showSkeleton(container, count = 3) {
    const skeletonHTML = Array.from({ length: count }, () => `
      <div style="background:#fff;border-radius:16px;padding:16px;margin-bottom:12px">
        <div style="display:flex;gap:12px;align-items:center">
          <div style="width:48px;height:48px;border-radius:12px;background:linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%);background-size:200% 100%;animation:shimmer 1.5s infinite"></div>
          <div style="flex:1">
            <div style="height:14px;width:60%;border-radius:7px;background:linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;margin-bottom:8px"></div>
            <div style="height:12px;width:40%;border-radius:6px;background:linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%);background-size:200% 100%;animation:shimmer 1.5s infinite"></div>
          </div>
        </div>
      </div>
    `).join('');

    // 添加shimmer动画
    if (!document.getElementById('skeleton-style')) {
      const style = document.createElement('style');
      style.id = 'skeleton-style';
      style.textContent = '@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }';
      document.head.appendChild(style);
    }

    if (typeof container === 'string') {
      container = document.getElementById(container);
    }
    if (container) {
      container.innerHTML = skeletonHTML;
    }
  }

  // =========================================================================
  // 公开API
  // =========================================================================
  return {
    init,
    // 加载
    showLoading,
    hideLoading,
    isLoading,
    showSkeleton,
    // 错误/成功
    showError,
    showSuccess,
    setLastAction,
    retryLastAction,
    // API状态
    getAPIMode,
    setAPIMode,
    getAPIBaseURL,
    setAPIBaseURL,
    getToken,
    setToken,
    // 调试面板
    toggleDebugPanel,
    logRequest,
    clearRequestLog,
    testAPIConnection,
    toggleAPIMode,
  };
})();

// 自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AppState.init());
} else {
  AppState.init();
}

// 键盘快捷键：Ctrl+Shift+D 打开调试面板
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'D') {
    e.preventDefault();
    AppState.toggleDebugPanel();
  }
});
