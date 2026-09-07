/**
 * OneOS 顶部栏
 */

import React, { useState } from 'react';
import { useAppStore } from '../../stores/app-store';
import { Icon } from '../ui/Icon';
import { useSearchStore } from '../../stores/search-store';

interface TopbarProps {
  isMobile?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({ isMobile = false }) => {
  const { currentNav, setCommandPaletteOpen, toggleSidebar, sidebarCollapsed } = useAppStore();
  const { setQuery } = useSearchStore();
  const [searchFocused, setSearchFocused] = useState(false);

  const navTitles: Record<string, string> = {
    dashboard: '仪表盘',
    notes: '笔记',
    editor: '编辑器',
    graph: '知识图谱',
    calendar: '日历',
    ai: 'AI 对话',
    social: '社交',
    voice: '语音',
    search: '搜索',
    settings: '设置',
  };

  return (
    <header style={{
      height: 56,
      background: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      padding: isMobile ? '0 12px' : '0 20px',
      gap: 12,
      flexShrink: 0,
      zIndex: 10,
    }}>
      {/* 移动端菜单按钮 */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <Icon name="menu" size="md" />
        </button>
      )}

      {/* 页面标题 */}
      <h1 style={{
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--text-primary)',
        margin: 0,
        flexShrink: 0,
      }}>
        {navTitles[currentNav] || 'OneOS'}
      </h1>

      {/* 搜索框（桌面端） */}
      {!isMobile && (
        <div
          style={{
            flex: 1,
            maxWidth: 400,
            margin: '0 auto',
            position: 'relative',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 36,
            padding: '0 12px',
            background: searchFocused ? '#FFFFFF' : 'var(--color-neutral-100)',
            border: searchFocused ? '2px solid var(--color-primary-500)' : '1px solid transparent',
            borderRadius: 10,
            cursor: 'text',
            transition: 'all var(--duration-fast)',
            boxShadow: searchFocused ? '0 0 0 3px rgba(139,92,246,0.1)' : 'none',
          }}
          onClick={() => setCommandPaletteOpen(true)}
          >
            <Icon name="search" size="sm" color="var(--text-tertiary)" />
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)', flex: 1 }}>
              搜索笔记、标签、联系人...
            </span>
            <kbd style={{
              fontSize: 11,
              padding: '2px 6px',
              background: 'var(--color-neutral-200)',
              borderRadius: 4,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
            }}>
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      {/* 右侧操作区 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginLeft: 'auto',
      }}>
        {/* 新建按钮 */}
        <button
          style={{
            height: 36,
            padding: '0 14px',
            borderRadius: 10,
            background: 'var(--gradient-primary)',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: 'var(--shadow-primary)',
            transition: 'all var(--duration-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <Icon name="plus" size="sm" />
          {!isMobile && <span>新建</span>}
        </button>

        {/* 通知 */}
        <button
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Icon name="bell" size="md" />
          <span style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--color-error)',
            border: '2px solid #FFFFFF',
          }} />
        </button>

        {/* 设置 */}
        {!isMobile && (
          <button
            onClick={() => useAppStore.getState().setCurrentNav('settings')}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <Icon name="settings" size="md" />
          </button>
        )}
      </div>
    </header>
  );
};
