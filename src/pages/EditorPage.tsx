/**
 * OneOS 编辑器页面
 * 主页面组件，负责状态管理和布局
 * 具体UI委托给EditorToolbar、EditorCanvas、EditorOutline、EditorStatusBar
 * 
 * 功能：
 * - Markdown编辑（编辑/分屏/预览三种模式）
 * - 格式工具栏（加粗/斜体/标题/引用/代码等）
 * - 文档大纲（自动提取标题）
 * - 实时统计（字数/字符数/阅读时间）
 * - 自动保存（2秒防抖）
 * - 撤销/重做
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useEditorStore } from '../stores/editor-store';
import { useNoteStore } from '../stores/note-store';
import { useAppStore } from '../stores/app-store';
import { useToast } from '../components/ui/Toast';
import { EmptyState } from '../components/ui/EmptyState';
import { EditorToolbar, EditorMode } from '../components/editor/EditorToolbarStatusBar';
import { EditorStatusBar } from '../components/editor/EditorToolbarStatusBar';
import { EditorCanvas, EditorOutline } from '../components/editor/EditorCanvasOutline';

export const EditorPage: React.FC = () => {
  const {
    currentNoteId,
    content,
    title,
    isDirty,
    mode,
    setContent,
    setTitle,
    save,
    undo,
    redo,
    canUndo,
    canRedo,
    formatText,
  } = useEditorStore();

  const { notes, currentNoteId: storeNoteId, selectNote } = useNoteStore();
  const { setCurrentNav } = useAppStore();
  const toast = useToast();

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [editorMode, setEditorMode] = useState<EditorMode>('edit');
  const [showOutline, setShowOutline] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>();

  // 同步笔记到编辑器
  useEffect(() => {
    if (storeNoteId) {
      const note = notes.find((n) => n.id === storeNoteId);
      if (note) useEditorStore.getState().setCurrentNote(note);
    }
  }, [storeNoteId, notes]);

  // 自动保存（2秒防抖）
  useEffect(() => {
    if (!isDirty || !currentNoteId) return;
    const timer = setTimeout(() => {
      handleSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [isDirty, content, title, currentNoteId]);

  // 统计字数
  useEffect(() => {
    const plainText = content.replace(/[#*`>\[\]()!\-_~]/g, '').trim();
    const words = plainText.split(/\s+/).filter(Boolean).length;
    setWordCount(words);
    setCharCount(content.length);
    setReadingTime(Math.max(1, Math.ceil(words / 300)));
  }, [content]);

  // 提取大纲
  const outline = useMemo(() => {
    const headings: Array<{ level: number; text: string; id: string }> = [];
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2],
          id: `heading-${index}`,
        });
      }
    });
    return headings;
  }, [content]);

  // 保存
  const handleSave = useCallback(() => {
    save();
    setLastSaved(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
  }, [save]);

  // 格式化文本
  const handleFormatText = useCallback(
    (format: string) => {
      formatText(format);
      editorRef.current?.focus();
    },
    [formatText]
  );

  // 光标位置变化
  const handleCursorChange = useCallback((line: number, column: number) => {
    setCursorPosition({ line, column });
  }, []);

  // 大纲项点击
  const handleOutlineClick = useCallback((id: string) => {
    const index = parseInt(id.replace('heading-', ''));
    const lines = content.split('\n');
    let position = 0;
    for (let i = 0; i < index && i < lines.length; i++) {
      position += lines[i].length + 1;
    }
    if (editorRef.current) {
      editorRef.current.focus();
      editorRef.current.setSelectionRange(position, position);
    }
  }, [content]);

  // 没有选中笔记时显示空状态
  if (!currentNoteId && !storeNoteId) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon="file-text"
          title="选择一篇笔记开始编辑"
          description="从左侧笔记列表中选择，或创建新笔记"
          actionLabel="去笔记列表"
          onAction={() => setCurrentNav('notes')}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* 工具栏 */}
      <EditorToolbar
        mode={editorMode}
        onModeChange={setEditorMode}
        onSave={handleSave}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        isDirty={isDirty}
        onFormatText={handleFormatText}
        onToggleOutline={() => setShowOutline(!showOutline)}
        showOutline={showOutline}
        title={title}
        onTitleChange={setTitle}
      />

      {/* 主内容区 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 编辑器画布 */}
        <EditorCanvas
          mode={editorMode}
          content={content}
          onContentChange={setContent}
          onCursorChange={handleCursorChange}
          editorRef={editorRef}
        />

        {/* 大纲面板 */}
        <EditorOutline
          outline={outline}
          onItemClick={handleOutlineClick}
          isOpen={showOutline}
          onClose={() => setShowOutline(false)}
        />
      </div>

      {/* 状态栏 */}
      <EditorStatusBar
        wordCount={wordCount}
        charCount={charCount}
        readingTime={readingTime}
        cursorLine={cursorPosition.line}
        cursorColumn={cursorPosition.column}
        isSaved={!isDirty}
        lastSaved={lastSaved}
      />
    </div>
  );
};

export default EditorPage;
