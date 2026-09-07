/**
 * OneOS 侧边栏导航（桌面端）
 */

import React from 'react';
import { useAppStore, NavKey } from '../../stores/app-store';
import { Icon, IconName } from '../ui/Icon';

interface NavItem {
  key: NavKey;
  label: string;
  icon: IconName;
  color: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: '仪表盘', icon: 'home', color: '#8B5CF6' },
  { key: 'notes', label: '笔记', icon: 'file', color: '#00CEC9' },
  { key: 'editor', label: '编辑器', icon: 'edit', color: '#FD79A8' },
  { key: 'graph', label: '知识图谱', icon: 'network', color: '#FDCB6E' },
  { key: 'calendar', label: '日历', icon: 'calendar', color: '#00B894' },
  { key: 'ai', label: 'AI 对话', icon: 'sparkles', color: '#74B9FF' },
  { key: 'social', label: '社交', icon: 'users', color: '#FD79A8' },
  { key: 'voice', label: '语音', icon: 'mic', color: '#FF6B6B' },
  { key: 'search', label: '搜索', icon: 'search', color: '#A29BFE' },
  { key: 'knowledge', label: '知识库', icon: 'database', color: '#8B5CF6' },
  { key: 'settings', label: '设置', icon: 'settings', color: '#737373' },
];

export const Sidebar: React.FC = () => {
  const { currentNav, setCurrentNav, sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      style={{
        width: sidebarCollapsed ? 64 : 240,
        height: '100%',
        background: '#FFFFFF',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--duration-base) var(--ease-standard)',
        flexShrink: 0,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Logo区域 */}
      <div style={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        padding: sidebarCollapsed ? 0 : '0 16px',
        borderBottom: '1px solid var(--border-light)',
        flexShrink: 0,
      }}>
        {!sidebarCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 16,
              boxShadow: 'var(--shadow-primary)',
            }}>
              O
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>OneOS</span>
          </div>
        )}
        {sidebarCollapsed && (
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 16,
          }}>
            O
          </div>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            transition: 'all var(--duration-fast)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
        >
          <Icon name={sidebarCollapsed ? 'chevron-right' : 'chevron-left'} size="sm" />
        </button>
      </div>

      {/* 导航列表 */}
      <nav style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
        {navItems.map((item) => {
          const isActive = currentNav === item.key;
          return (
            <div
              key={item.key}
              onClick={() => setCurrentNav(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                height: 40,
                padding: sidebarCollapsed ? 0 : '0 12px',
                borderRadius: 8,
                cursor: 'pointer',
                marginBottom: 2,
                background: isActive ? 'var(--color-primary-50)' : 'transparent',
                color: isActive ? item.color : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                transition: 'all var(--duration-fast) var(--ease-standard)',
                position: 'relative',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3,
                  height: 20,
                  background: item.color,
                  borderRadius: '0 2px 2px 0',
                }} />
              )}
              <Icon name={item.icon} size="md" color={isActive ? item.color : 'currentColor'} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </div>
          );
        })}
      </nav>

      {/* 底部用户信息 */}
      <div style={{
        padding: sidebarCollapsed ? 8 : 12,
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        gap: sidebarCollapsed ? 0 : 10,
        justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'var(--gradient-pink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          fontWeight: 600,
          fontSize: 14,
          flexShrink: 0,
        }}>
          我
        </div>
        {!sidebarCollapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              OneOS 用户
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>本地模式</div>
          </div>
        )}
      </div>
    </aside>
  );
};
