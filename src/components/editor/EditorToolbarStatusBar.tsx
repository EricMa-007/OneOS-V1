/**
 * OneOS 编辑器工具栏和状态栏
 * 从EditorPage提取
 * 
 * 作者：A09 珀耳塞福涅（文档主管）
 */

import React from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Tag } from '../ui/Tag';

// ==================== 编辑器工具栏 ====================

export type EditorMode = 'edit' | 'preview' | 'split';

interface EditorToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  onFormatText: (format: string) => void;
  onToggleOutline: () => void;
  showOutline: boolean;
  title: string;
  onTitleChange: (title: string) => void;
}

const FORMAT_BUTTONS = [
  { format: 'bold', icon: 'bold', label: '加粗' },
  { format: 'italic', icon: 'italic', label: '斜体' },
  { format: 'underline', icon: 'underline', label: '下划线' },
  { format: 'strikethrough', icon: 'strikethrough', label: '删除线' },
  { format: 'heading1', icon: 'heading-1', label: '标题1' },
  { format: 'heading2', icon: 'heading-2', label: '标题2' },
  { format: 'heading3', icon: 'heading-3', label: '标题3' },
  { format: 'quote', icon: 'quote', label: '引用' },
  { format: 'code', icon: 'code', label: '代码' },
  { format: 'link', icon: 'link', label: '链接' },
  { format: 'image', icon: 'image', label: '图片' },
  { format: 'list', icon: 'list', label: '列表' },
  { format: 'ordered-list', icon: 'list-ordered', label: '有序列表' },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  mode,
  onModeChange,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isDirty,
  onFormatText,
  onToggleOutline,
  showOutline,
  title,
  onTitleChange,
}) => {
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-secondary)' }}>
      {/* 标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="无标题"
          style={{
            flex: 1,
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: '4px 8px',
            borderRadius: 6,
          }}
          onFocus={(e) => (e.target.style.background = 'var(--color-bg-tertiary)')}
          onBlur={(e) => (e.target.style.background = 'transparent')}
        />
        {isDirty && (
          <Tag color="warning" style={{ fontSize: 11 }}>
            未保存
          </Tag>
        )}
        <Button variant="primary" size="sm" onClick={onSave}>
          <Icon name="save" size={14} style={{ marginRight: 6 }} />
          保存
        </Button>
      </div>

      {/* 格式工具栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 16px', flexWrap: 'wrap' }}>
        {/* 撤销/重做 */}
        <div style={{ display: 'flex', gap: 2, marginRight: 8 }}>
          <Button variant="ghost" size="sm" onClick={onUndo} disabled={!canUndo} title="撤销">
            <Icon name="undo" size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onRedo} disabled={!canRedo} title="重做">
            <Icon name="redo" size={14} />
          </Button>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--color-border)', marginRight: 8 }} />

        {/* 格式按钮 */}
        {FORMAT_BUTTONS.map((btn) => (
          <Button
            key={btn.format}
            variant="ghost"
            size="sm"
            onClick={() => onFormatText(btn.format)}
            title={btn.label}
            style={{ minWidth: 32, padding: '4px 6px' }}
          >
            <Icon name={btn.icon as any} size={14} />
          </Button>
        ))}

        <div style={{ flex: 1 }} />

        {/* 大纲切换 */}
        <Button
          variant={showOutline ? 'primary' : 'ghost'}
          size="sm"
          onClick={onToggleOutline}
          title="大纲"
        >
          <Icon name="list" size={14} style={{ marginRight: 6 }} />
          大纲
        </Button>

        {/* 模式切换 */}
        <div style={{ display: 'flex', background: 'var(--color-bg-tertiary)', borderRadius: 6, padding: 2 }}>
          {(['edit', 'split', 'preview'] as EditorMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              style={{
                padding: '4px 10px',
                border: 'none',
                background: mode === m ? 'var(--color-bg-primary)' : 'transparent',
                color: mode === m ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {m === 'edit' ? '编辑' : m === 'split' ? '分屏' : '预览'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==================== 编辑器状态栏 ====================

interface EditorStatusBarProps {
  wordCount: number;
  charCount: number;
  readingTime: number;
  cursorLine: number;
  cursorColumn: number;
  isSaved: boolean;
  lastSaved?: string;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  wordCount,
  charCount,
  readingTime,
  cursorLine,
  cursorColumn,
  isSaved,
  lastSaved,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '6px 16px',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="type" size={12} />
        <span>{wordCount} 字</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="hash" size={12} />
        <span>{charCount} 字符</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Icon name="clock" size={12} />
        <span>约 {readingTime} 分钟阅读</span>
      </div>
      <div style={{ flex: 1 }} />
      <div>
        行 {cursorLine}, 列 {cursorColumn}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: isSaved ? '#00B894' : '#FDCB6E',
          }}
        />
        <span>{isSaved ? '已保存' : '编辑中'}</span>
      </div>
      {lastSaved && <div>上次保存: {lastSaved}</div>}
    </div>
  );
};

export default { EditorToolbar, EditorStatusBar };
