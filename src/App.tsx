/**
 * OneOS 应用根组件
 */

import React, { useEffect } from 'react';
import { useAppStore } from './stores/app-store';
import { AppLayout } from './components/layout/AppLayout';
import { CommandPalette } from './components/layout/CommandPalette';
import { Loading } from './components/ui/Loading';
import { logger } from './shared/kernel/logger';
import { eventBus, EVENTS } from './shared/kernel/event-bus';

const App: React.FC = () => {
  const { initialized, isLoading, loadingMessage, currentNav } = useAppStore();

  useEffect(() => {
    logger.info('OneOS 应用启动', { nav: currentNav });

    // 监听导航变化
    const unsubscribe = eventBus.on(EVENTS.APP.NAV_CHANGED, (nav) => {
      logger.debug('导航变化', nav);
    });

    return () => {
      unsubscribe();
    };
  }, [currentNav]);

  // 初始化加载
  if (!initialized || isLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-gradient-page)',
      }}>
        <Loading text={loadingMessage || 'OneOS 加载中...'} size="lg" />
      </div>
    );
  }

  return (
    <div className="oneos-app" style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--bg-gradient-page)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--text-primary)',
    }}>
      <AppLayout />
      <CommandPalette />
    </div>
  );
};

export default App;
