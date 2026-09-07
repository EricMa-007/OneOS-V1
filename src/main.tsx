/**
 * OneOS 应用入口
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/design-tokens.css';
import './styles/global.css';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { appInitializer } from './shared/kernel/app-initializer';
import { logger } from './shared/kernel/logger';

// 显示致命错误到页面
function showFatalError(error: Error, context: string) {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding:40px;font-family:system-ui;background:#FFF5F5;min-height:100vh;color:#2D3436;">
        <div style="max-width:600px;margin:0 auto;">
          <div style="width:64px;height:64px;border-radius:16px;background:linear-gradient(135deg,#FF6B6B,#EE5A6F);display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <h1 style="font-size:20px;font-weight:700;margin:0 0 8px;">应用启动失败</h1>
          <p style="font-size:14px;color:#636E72;margin:0 0 16px;">${context}</p>
          <div style="background:#FFFFFF;border:1px solid #FED7D7;border-radius:8px;padding:16px;margin-bottom:16px;">
            <div style="font-size:12px;color:#E53E3E;font-weight:600;margin-bottom:8px;">错误信息</div>
            <div style="font-size:13px;font-family:monospace;color:#2D3436;white-space:pre-wrap;word-break:break-all;">${error.message}</div>
          </div>
          ${error.stack ? `<div style="background:#F7FAFC;border-radius:8px;padding:16px;margin-bottom:16px;max-height:300px;overflow:auto;">
            <div style="font-size:12px;color:#718096;font-weight:600;margin-bottom:8px;">调用栈</div>
            <div style="font-size:11px;font-family:monospace;color:#4A5568;white-space:pre-wrap;">${error.stack}</div>
          </div>` : ''}
          <button onclick="location.reload()" style="padding:10px 20px;border-radius:8px;background:#8B5CF6;color:white;border:none;font-size:14px;font-weight:600;cursor:pointer;">刷新页面重试</button>
        </div>
      </div>
    `;
  }
  console.error('[OneOS Fatal Error]', context, error);
}

// 全局错误捕获
window.addEventListener('error', (event) => {
  if (event.error) {
    showFatalError(event.error, '全局运行时错误');
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
  showFatalError(error, '未处理的Promise拒绝');
});

// 初始化应用
async function bootstrap() {
  try {
    console.log('[OneOS] 开始初始化...');
    await appInitializer.initialize();
    console.log('[OneOS] 初始化完成，开始渲染...');

    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error('找不到root元素');
    }

    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <ErrorBoundary>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('[OneOS] 渲染完成');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    showFatalError(error, '应用初始化或渲染失败');
  }
}

bootstrap();
