/**
 * OneOS 底部导航（移动端）
 */

import React from 'react';
import { useAppStore, NavKey } from '../../stores/app-store';
import { Icon, IconName } from '../ui/Icon';

interface NavItem {
  key: NavKey;
  label: string;
  icon: IconName;
  activeColor: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: '首页', icon: 'home', activeColor: '#8B5CF6' },
  { key: 'notes', label: '笔记', icon: 'file', activeColor: '#00CEC9' },
  { key: 'ai', label: 'AI', icon: 'sparkles', activeColor: '#74B9FF' },
  { key: 'graph', label: '图谱', icon: 'network', activeColor: '#FDCB6E' },
  { key: 'social', label: '社交', icon: 'users', activeColor: '#FD79A8' },
];

export const BottomNav: React.FC = () => {
  const { currentNav, setCurrentNav } = useAppStore();

  return (
    <nav style={{
      height: 'calc(64px + env(safe-area-inset-bottom))',
      paddingBottom: 'env(safe-area-inset-bottom)',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      flexShrink: 0,
      boxShadow: '0 -2px 12px rgba(0,0,0,0.04)',
      zIndex: 100,
    }}>
      {navItems.map((item) => {
        const isActive = currentNav === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setCurrentNav(item.key)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              position: 'relative',
            }}
          >
            {/* 选中指示器 */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 32,
                height: 3,
                background: item.activeColor,
                borderRadius: '0 0 3px 3px',
              }} />
            )}
            <div style={{
              width: 40,
              height: 28,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isActive ? `${item.activeColor}15` : 'transparent',
              transition: 'all var(--duration-fast)',
            }}>
              <Icon
                name={item.icon}
                size="md"
                color={isActive ? item.activeColor : 'var(--text-tertiary)'}
              />
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? item.activeColor : 'var(--text-tertiary)',
              transition: 'all var(--duration-fast)',
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
