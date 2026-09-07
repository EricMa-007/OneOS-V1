/**
 * OneOS 命令面板（Cmd+K）
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAppStore, NavKey } from '../../stores/app-store';
import { useSearchStore } from '../../stores/search-store';
import { Icon, IconName } from '../ui/Icon';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: IconName;
  iconColor: string;
  type: 'navigation' | 'action' | 'command';
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setCurrentNav } = useAppStore();
  const { query, setQuery, results } = useSearchStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen, setQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, getCommands().length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const commands = getCommands();
        if (commands[selectedIndex]) {
          commands[selectedIndex].action();
          setCommandPaletteOpen(false);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, selectedIndex, setCommandPaletteOpen]);

  const getCommands = (): CommandItem[] => {
    const navCommands: CommandItem[] = [
      { id: 'nav-dashboard', label: '前往仪表盘', icon: 'home', iconColor: '#8B5CF6', type: 'navigation', action: () => setCurrentNav('dashboard'), shortcut: '1' },
      { id: 'nav-notes', label: '前往笔记', icon: 'file', iconColor: '#00CEC9', type: 'navigation', action: () => setCurrentNav('notes'), shortcut: '2' },
      { id: 'nav-editor', label: '前往编辑器', icon: 'edit', iconColor: '#FD79A8', type: 'navigation', action: () => setCurrentNav('editor'), shortcut: '3' },
      { id: 'nav-graph', label: '前往知识图谱', icon: 'network', iconColor: '#FDCB6E', type: 'navigation', action: () => setCurrentNav('graph'), shortcut: '4' },
      { id: 'nav-calendar', label: '前往日历', icon: 'calendar', iconColor: '#00B894', type: 'navigation', action: () => setCurrentNav('calendar'), shortcut: '5' },
      { id: 'nav-ai', label: '前往AI对话', icon: 'sparkles', iconColor: '#74B9FF', type: 'navigation', action: () => setCurrentNav('ai'), shortcut: '6' },
      { id: 'nav-social', label: '前往社交', icon: 'users', iconColor: '#FD79A8', type: 'navigation', action: () => setCurrentNav('social'), shortcut: '7' },
      { id: 'nav-voice', label: '前往语音', icon: 'mic', iconColor: '#FF6B6B', type: 'navigation', action: () => setCurrentNav('voice'), shortcut: '8' },
      { id: 'nav-settings', label: '前往设置', icon: 'settings', iconColor: '#737373', type: 'navigation', action: () => setCurrentNav('settings'), shortcut: '9' },
    ];

    const actionCommands: CommandItem[] = [
      { id: 'action-new-note', label: '新建笔记', icon: 'plus', iconColor: '#8B5CF6', type: 'action', action: () => { setCurrentNav('notes'); }, shortcut: 'N' },
      { id: 'action-search', label: '全局搜索', icon: 'search', iconColor: '#00CEC9', type: 'action', action: () => setCurrentNav('search') },
      { id: 'action-toggle-theme', label: '切换主题', icon: 'moon', iconColor: '#FDCB6E', type: 'action', action: () => useAppStore.getState().toggleTheme() },
      { id: 'action-toggle-focus', label: '专注模式', icon: 'maximize', iconColor: '#00B894', type: 'action', action: () => useAppStore.getState().toggleFocusMode() },
    ];

    const allCommands = [...navCommands, ...actionCommands];

    if (!query.trim()) return allCommands;

    const kw = query.toLowerCase();
    return allCommands.filter(
      (c) => c.label.toLowerCase().includes(kw) || c.description?.toLowerCase().includes(kw)
    );
  };

  if (!commandPaletteOpen) return null;

  const commands = getCommands();

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
      onClick={() => setCommandPaletteOpen(false)}
    >
      {/* 遮罩 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
      }} />

      {/* 面板 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: 'oneos-scaleIn 0.2s ease-out',
        }}
      >
        {/* 搜索输入 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <Icon name="search" size="md" color="var(--text-tertiary)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="输入命令或搜索..."
            style={{
              flex: 1,
              fontSize: 16,
              color: 'var(--text-primary)',
              outline: 'none',
              border: 'none',
              background: 'none',
            }}
          />
          <kbd style={{
            fontSize: 11,
            padding: '2px 6px',
            background: 'var(--color-neutral-100)',
            borderRadius: 4,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}>
            ESC
          </kbd>
        </div>

        {/* 命令列表 */}
        <div style={{
          maxHeight: 400,
          overflow: 'auto',
          padding: 8,
        }}>
          {commands.length === 0 && (
            <div style={{
              padding: '32px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: 14,
            }}>
              没有找到匹配的命令
            </div>
          )}
          {commands.map((cmd, index) => (
            <div
              key={cmd.id}
              onClick={() => { cmd.action(); setCommandPaletteOpen(false); }}
              onMouseEnter={() => setSelectedIndex(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                background: selectedIndex === index ? 'var(--color-primary-50)' : 'transparent',
                transition: 'background 0.1s',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${cmd.iconColor}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name={cmd.icon} size="sm" color={cmd.iconColor} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {cmd.label}
                </div>
                {cmd.description && (
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {cmd.description}
                  </div>
                )}
              </div>
              {cmd.shortcut && (
                <kbd style={{
                  fontSize: 11,
                  padding: '2px 6px',
                  background: 'var(--color-neutral-100)',
                  borderRadius: 4,
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  ⌘{cmd.shortcut}
                </kbd>
              )}
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '10px 20px',
          borderTop: '1px solid var(--border-light)',
          background: 'var(--color-neutral-50)',
          fontSize: 11,
          color: 'var(--text-tertiary)',
        }}>
          <span>↑↓ 选择</span>
          <span>↵ 执行</span>
          <span>ESC 关闭</span>
        </div>
      </div>
    </div>
  );
};
