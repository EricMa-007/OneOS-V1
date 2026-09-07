/**
 * OneOS 编辑器画布和大纲
 * 从EditorPage提取
 * 
 * 作者：A09 珀耳塞福涅（文档主管）
 */

import React, { useRef, useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { EditorMode } from './EditorToolbarStatusBar';

// ==================== 编辑器画布 ====================

interface EditorCanvasProps {
  mode: EditorMode;
  content: string;
  onContentChange: (content: string) => void;
  onCursorChange: (line: number, column: number) => void;
  editorRef: React.RefObject<HTMLTextAreaElement>;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  mode,
  content,
  onContentChange,
  onCursorChange,
  editorRef,
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // 简单的Markdown渲染
  const renderMarkdown = (text: string): string => {
    let html = text;
    // 标题
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // 粗体
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // 斜体
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // 代码块
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // 行内代码
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    // 引用
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    // 链接
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
    // 列表
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    // 换行
    html = html.replace(/\n/g, '<br/>');
    return html;
  };

  const handleCursorChange = () => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const text = textarea.value.substring(0, textarea.selectionStart);
    const lines = text.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    onCursorChange(line, column);
  };

  const showEditor = mode === 'edit' || mode === 'split';
  const showPreview = mode === 'preview' || mode === 'split';

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* 编辑区 */}
      {showEditor && (
        <div
          style={{
            flex: mode === 'split' ? 1 : 1,
            display: 'flex',
            flexDirection: 'column',
            borderRight: mode === 'split' ? '1px solid var(--color-border)' : 'none',
          }}
        >
          <textarea
            ref={editorRef}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyUp={handleCursorChange}
            onClick={handleCursorChange}
            placeholder="开始写作..."
            style={{
              flex: 1,
              padding: '24px 32px',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: 15,
              lineHeight: 1.8,
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg-primary)',
              fontFamily: 'inherit',
            }}
            spellCheck={false}
          />
        </div>
      )}

      {/* 预览区 */}
      {showPreview && (
        <div
          ref={previewRef}
          style={{
            flex: mode === 'split' ? 1 : 1,
            padding: '24px 32px',
            overflow: 'auto',
            background: 'var(--color-bg-primary)',
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      )}
    </div>
  );
};

// ==================== 编辑器大纲 ====================

interface OutlineItem {
  level: number;
  text: string;
  id: string;
}

interface EditorOutlineProps {
  outline: OutlineItem[];
  onItemClick: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const EditorOutline: React.FC<EditorOutlineProps> = ({
  outline,
  onItemClick,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        width: 260,
        borderLeft: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          文档大纲
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
            padding: 4,
            borderRadius: 4,
          }}
        >
          <Icon name="x" size={16} />
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {outline.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-tertiary)', fontSize: 13 }}>
            暂无大纲
            <div style={{ fontSize: 11, marginTop: 4 }}>使用 # 标题语法创建大纲</div>
          </div>
        ) : (
          outline.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick(item.id)}
              style={{
                padding: '6px 16px',
                paddingLeft: 16 + (item.level - 1) * 16,
                cursor: 'pointer',
                fontSize: 13,
                color: item.level === 1 ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontWeight: item.level <= 2 ? 600 : 400,
                transition: 'background 0.2s',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-tertiary)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {item.text}
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--color-border)', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
        {outline.length} 个标题
      </div>
    </div>
  );
};

export default { EditorCanvas, EditorOutline };
