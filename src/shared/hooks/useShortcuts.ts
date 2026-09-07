/**
 * OneOS 全局快捷键系统
 * 支持自定义快捷键、命令面板、快捷操作
 * 
 * 作者：A02 墨菲斯（全栈工程师）
 */

import { useEffect, useCallback } from 'react';
import { useAppStore, NavKey } from '../stores/app-store';

// 快捷键配置
export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: string;
}

// 预设快捷键
export const DEFAULT_SHORTCUTS: Record<string, ShortcutConfig> = {
  // 导航
  'goto-dashboard': { key: '1', ctrl: true, description: '跳转到仪表盘', category: '导航' },
  'goto-notes': { key: '2', ctrl: true, description: '跳转到笔记', category: '导航' },
  'goto-editor': { key: '3', ctrl: true, description: '跳转到编辑器', category: '导航' },
  'goto-graph': { key: '4', ctrl: true, description: '跳转到知识图谱', category: '导航' },
  'goto-calendar': { key: '5', ctrl: true, description: '跳转到日历', category: '导航' },
  'goto-ai': { key: '6', ctrl: true, description: '跳转到AI助手', category: '导航' },
  'goto-social': { key: '7', ctrl: true, description: '跳转到社交', category: '导航' },
  'goto-search': { key: '8', ctrl: true, description: '跳转到搜索', category: '导航' },
  'goto-settings': { key: '9', ctrl: true, description: '跳转到设置', category: '导航' },

  // 操作
  'command-palette': { key: 'k', ctrl: true, description: '打开命令面板', category: '操作' },
  'quick-search': { key: 'k', ctrl: true, shift: true, description: '快速搜索', category: '操作' },
  'new-note': { key: 'n', ctrl: true, description: '新建笔记', category: '操作' },
  'save': { key: 's', ctrl: true, description: '保存', category: '操作' },
  'focus-mode': { key: 'f', ctrl: true, shift: true, description: '切换专注模式', category: '操作' },
  'toggle-sidebar': { key: 'b', ctrl: true, description: '切换侧边栏', category: '操作' },

  // 导航历史
  'go-back': { key: 'ArrowLeft', alt: true, description: '返回', category: '导航历史' },
  'go-forward': { key: 'ArrowRight', alt: true, description: '前进', category: '导航历史' },

  // 帮助
  'help': { key: '?', shift: true, description: '显示快捷键帮助', category: '帮助' },
};

// 导航键映射
const NAV_KEY_MAP: Record<string, NavKey> = {
  '1': 'dashboard',
  '2': 'notes',
  '3': 'editor',
  '4': 'graph',
  '5': 'calendar',
  '6': 'ai',
  '7': 'social',
  '8': 'search',
  '9': 'settings',
};

/**
 * 全局快捷键Hook
 */
export const useShortcuts = () => {
  const { setCurrentNav, sidebarCollapsed, setSidebarCollapsed, focusMode, setFocusMode } = useAppStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // 忽略输入框中的快捷键（除了全局命令）
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

    // Ctrl/Cmd + K 命令面板（全局可用）
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      // 触发命令面板（通过自定义事件）
      window.dispatchEvent(new CustomEvent('oneos:open-command-palette'));
      return;
    }

    // 输入框中忽略其他快捷键
    if (isInput) return;

    // Ctrl/Cmd + 数字键 导航
    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
      const navKey = NAV_KEY_MAP[event.key];
      if (navKey) {
        event.preventDefault();
        setCurrentNav(navKey);
        return;
      }
    }

    // Ctrl/Cmd + B 切换侧边栏
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      setSidebarCollapsed(!sidebarCollapsed);
      return;
    }

    // Ctrl/Cmd + Shift + F 专注模式
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
      event.preventDefault();
      setFocusMode(!focusMode);
      return;
    }

    // Ctrl/Cmd + N 新建笔记
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'n') {
      event.preventDefault();
      setCurrentNav('notes');
      // 触发新建笔记
      window.dispatchEvent(new CustomEvent('oneos:new-note'));
      return;
    }

    // ? 显示快捷键帮助
    if (event.shiftKey && event.key === '?') {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent('oneos:show-shortcuts'));
      return;
    }

    // Alt + 左右箭头 导航历史
    if (event.altKey && event.key === 'ArrowLeft') {
      event.preventDefault();
      window.history.back();
      return;
    }
    if (event.altKey && event.key === 'ArrowRight') {
      event.preventDefault();
      window.history.forward();
      return;
    }
  }, [setCurrentNav, sidebarCollapsed, setSidebarCollapsed, focusMode, setFocusMode]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * 快捷键显示组件
 */
export const ShortcutHint: React.FC<{ shortcut: string }> = ({ shortcut }) => (
  <kbd style={{
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    background: 'var(--color-neutral-100)',
    border: '1px solid var(--color-neutral-200)',
    borderRadius: 4,
    fontFamily: 'monospace',
  }}>
    {shortcut}
  </kbd>
);

export default useShortcuts;
