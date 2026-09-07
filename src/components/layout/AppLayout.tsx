/**
 * OneOS 应用布局容器
 * 桌面端：侧边栏 + 顶栏 + 内容区
 * 移动端：顶栏 + 内容区 + 底部导航
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useAppStore, NavKey } from '../../stores/app-store';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { Loading } from '../ui/Loading';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useShortcuts } from '../../shared/hooks/useShortcuts';
import { useTheme } from '../../shared/hooks/useTheme';
import { usePWA } from '../../shared/hooks/usePWA';
import { I18nProvider } from '../../shared/i18n';
import { EncryptionService } from '../../shared/security/encryption';

// 路由级代码分割 - 懒加载页面组件
const DashboardPage = lazy(() => import('../../pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const NotesPage = lazy(() => import('../../pages/NotesPage').then(m => ({ default: m.NotesPage })));
const EditorPage = lazy(() => import('../../pages/EditorPage').then(m => ({ default: m.EditorPage })));
const GraphPage = lazy(() => import('../../pages/GraphPage').then(m => ({ default: m.GraphPage })));
const CalendarPage = lazy(() => import('../../pages/CalendarPage').then(m => ({ default: m.CalendarPage })));
const AIPage = lazy(() => import('../../pages/AIPage').then(m => ({ default: m.AIPage })));
const SocialPage = lazy(() => import('../../pages/SocialPage').then(m => ({ default: m.SocialPage })));
const VoicePage = lazy(() => import('../../pages/VoicePage').then(m => ({ default: m.VoicePage })));
const SearchPage = lazy(() => import('../../pages/SearchPage').then(m => ({ default: m.SearchPage })));
const KnowledgeBasePage = lazy(() => import('../../pages/KnowledgeBasePage').then(m => ({ default: m.KnowledgeBasePage })));
const SettingsPage = lazy(() => import('../../pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

const pageMap: Record<NavKey, React.LazyExoticComponent<React.FC>> = {
  dashboard: DashboardPage,
  notes: NotesPage,
  editor: EditorPage,
  graph: GraphPage,
  calendar: CalendarPage,
  ai: AIPage,
  social: SocialPage,
  voice: VoicePage,
  search: SearchPage,
  knowledge: KnowledgeBasePage,
  settings: SettingsPage,
};

// 页面加载占位符
const PageLoader: React.FC = () => (
  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Loading text="加载中..." size="md" />
  </div>
);

export const AppLayout: React.FC = () => {
  const { currentNav, sidebarCollapsed, focusMode } = useAppStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const CurrentPage = pageMap[currentNav] || DashboardPage;

  // 包裹 Suspense 的页面组件
  const PageWithSuspense = (
    <Suspense fallback={<PageLoader />}>
      <CurrentPage />
    </Suspense>
  );

  // 专注模式：只显示内容区
  if (focusMode) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {PageWithSuspense}
        </div>
      </div>
    );
  }

  // 移动端布局
  if (isMobile) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Topbar isMobile={true} />
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px',
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
        }}>
          {PageWithSuspense}
        </div>
        <BottomNav />
      </div>
    );
  }

  // 桌面端布局
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar />
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: sidebarCollapsed ? '24px 32px' : '24px',
        }}>
          {PageWithSuspense}
        </div>
      </div>
    </div>
  );
};
