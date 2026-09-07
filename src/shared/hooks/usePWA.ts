/**
 * OneOS PWA 注册Hook
 * 注册Service Worker，支持离线访问、应用安装、更新提示
 * 
 * 作者：A06 林克（DevOps工程师）
 */

import { useEffect, useState, useCallback } from 'react';

export interface PWAStatus {
  isInstallable: boolean;
  isInstalled: boolean;
  isOfflineReady: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export const usePWA = () => {
  const [status, setStatus] = useState<PWAStatus>({
    isInstallable: false,
    isInstalled: false,
    isOfflineReady: false,
    updateAvailable: false,
    registration: null,
  });

  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  // 注册Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('[PWA] 当前浏览器不支持Service Worker');
      return;
    }

    let registration: ServiceWorkerRegistration | null = null;

    const registerSW = async () => {
      try {
        registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        setStatus((prev) => ({
          ...prev,
          registration,
          isOfflineReady: true,
        }));

        console.log('[PWA] Service Worker注册成功:', registration.scope);

        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setStatus((prev) => ({ ...prev, updateAvailable: true }));
                console.log('[PWA] 发现新版本，可刷新更新');
              }
            });
          }
        });

        // 监听Controller变化（更新完成后自动刷新）
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      } catch (error) {
        console.error('[PWA] Service Worker注册失败:', error);
      }
    };

    // 页面加载完成后注册
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }

    return () => {
      // 清理
    };
  }, []);

  // 监听安装提示
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setStatus((prev) => ({ ...prev, isInstallable: true }));
      console.log('[PWA] 应用可安装');
    };

    const handleAppInstalled = () => {
      setStatus((prev) => ({ ...prev, isInstalled: true, isInstallable: false }));
      setDeferredPrompt(null);
      console.log('[PWA] 应用已安装');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 检查是否已安装（standalone模式）
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setStatus((prev) => ({ ...prev, isInstalled: true }));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 触发安装
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('[PWA] 没有可安装的提示事件');
      return false;
    }

    try {
      (deferredPrompt as any).prompt();
      const choiceResult = await (deferredPrompt as any).userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] 用户接受安装');
        setStatus((prev) => ({ ...prev, isInstalled: true }));
      } else {
        console.log('[PWA] 用户拒绝安装');
      }
      setDeferredPrompt(null);
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('[PWA] 安装失败:', error);
      return false;
    }
  }, [deferredPrompt]);

  // 检查更新
  const checkForUpdates = useCallback(async () => {
    if (!status.registration) return;
    try {
      await status.registration.update();
      console.log('[PWA] 已检查更新');
    } catch (error) {
      console.error('[PWA] 检查更新失败:', error);
    }
  }, [status.registration]);

  // 应用更新（跳过等待，激活新SW）
  const applyUpdate = useCallback(async () => {
    if (!status.registration?.waiting) return;
    status.registration.waiting.postMessage('SKIP_WAITING');
  }, [status.registration]);

  return {
    ...status,
    installApp,
    checkForUpdates,
    applyUpdate,
  };
};

export default usePWA;
