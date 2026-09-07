/**
 * 编辑器Store（Zustand）
 */

import { create } from 'zustand';
import { Note } from '../domain/models/note';

export type EditorMode = 'wysiwyg' | 'markdown' | 'split';
export type EditorPanel = 'backlinks' | 'outline' | 'tags' | 'properties' | 'none';

interface EditorState {
  // 当前编辑的笔记
  currentNote: Note | null;
  currentNoteId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // 编辑器状态
  mode: EditorMode;
  activePanel: EditorPanel;
  isFullscreen: boolean;
  isFocusMode: boolean;
  showLineNumbers: boolean;
  showMinimap: boolean;
  wordWrap: boolean;
  spellCheck: boolean;

  // 编辑状态
  content: string;
  title: string;
  isDirty: boolean;
  lastSavedAt: string | null;
  cursorPosition: { line: number; column: number };
  selection: { start: number; end: number } | null;

  // 历史记录
  undoStack: Array<{ content: string; title: string }>;
  redoStack: Array<{ content: string; title: string }>;
  canUndo: boolean;
  canRedo: boolean;

  // 操作
  setCurrentNote: (note: Note | null) => void;
  setMode: (mode: EditorMode) => void;
  setActivePanel: (panel: EditorPanel) => void;
  toggleFullscreen: () => void;
  toggleFocusMode: () => void;
  setContent: (content: string) => void;
  setTitle: (title: string) => void;
  markDirty: () => void;
  markClean: () => void;
  save: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  insertText: (text: string) => void;
  formatText: (format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'link' | 'image' | 'quote' | 'list' | 'orderedList' | 'heading' | 'hr') => void;
  setCursorPosition: (pos: { line: number; column: number }) => void;
  setSelection: (selection: { start: number; end: number } | null) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  currentNote: null,
  currentNoteId: null,
  isLoading: false,
  isSaving: false,
  error: null,

  mode: 'wysiwyg',
  activePanel: 'none',
  isFullscreen: false,
  isFocusMode: false,
  showLineNumbers: false,
  showMinimap: false,
  wordWrap: true,
  spellCheck: true,

  content: '',
  title: '',
  isDirty: false,
  lastSavedAt: null,
  cursorPosition: { line: 1, column: 1 },
  selection: null,

  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  setCurrentNote: (note) => {
    set({
      currentNote: note,
      currentNoteId: note?.id ?? null,
      content: note?.content || '',
      title: note?.title || '',
      isDirty: false,
      undoStack: [],
      redoStack: [],
      canUndo: false,
      canRedo: false,
    });
  },

  setMode: (mode) => set({ mode }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  toggleFullscreen: () => set({ isFullscreen: !get().isFullscreen }),
  toggleFocusMode: () => set({ isFocusMode: !get().isFocusMode }),

  setContent: (content) => {
    const state = get();
    set({
      content,
      isDirty: true,
      undoStack: [...state.undoStack, { content: state.content, title: state.title }].slice(-50),
      redoStack: [],
      canUndo: true,
      canRedo: false,
    });
  },

  setTitle: (title) => {
    const state = get();
    set({
      title,
      isDirty: true,
      undoStack: [...state.undoStack, { content: state.content, title: state.title }].slice(-50),
      redoStack: [],
      canUndo: true,
      canRedo: false,
    });
  },

  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false, lastSavedAt: new Date().toISOString() }),

  save: async () => {
    // 实际保存逻辑在NoteService中处理
    set({ isSaving: true });
    await new Promise((r) => setTimeout(r, 100)); // 模拟保存
    set({ isSaving: false, isDirty: false, lastSavedAt: new Date().toISOString() });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const previous = state.undoStack[state.undoStack.length - 1];
    set({
      content: previous.content,
      title: previous.title,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, { content: state.content, title: state.title }],
      canUndo: state.undoStack.length > 1,
      canRedo: true,
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    set({
      content: next.content,
      title: next.title,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, { content: state.content, title: state.title }],
      canRedo: state.redoStack.length > 1,
      canUndo: true,
      isDirty: true,
    });
  },

  insertText: (text) => {
    const state = get();
    const { content, selection } = state;
    if (selection) {
      const newContent = content.slice(0, selection.start) + text + content.slice(selection.end);
      get().setContent(newContent);
    } else {
      get().setContent(content + text);
    }
  },

  formatText: (format) => {
    const state = get();
    const { content, selection } = state;
    if (!selection) return;
    const selectedText = content.slice(selection.start, selection.end);
    let formatted = '';
    switch (format) {
      case 'bold': formatted = `**${selectedText}**`; break;
      case 'italic': formatted = `*${selectedText}*`; break;
      case 'underline': formatted = `<u>${selectedText}</u>`; break;
      case 'strikethrough': formatted = `~~${selectedText}~~`; break;
      case 'code': formatted = `\`${selectedText}\``; break;
      case 'link': formatted = `[${selectedText}](url)`; break;
      case 'image': formatted = `![${selectedText}](url)`; break;
      case 'quote': formatted = `> ${selectedText}`; break;
      case 'list': formatted = `- ${selectedText}`; break;
      case 'orderedList': formatted = `1. ${selectedText}`; break;
      case 'heading': formatted = `# ${selectedText}`; break;
      case 'hr': formatted = `\n---\n`; break;
    }
    const newContent = content.slice(0, selection.start) + formatted + content.slice(selection.end);
    get().setContent(newContent);
  },

  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setSelection: (selection) => set({ selection }),

  reset: () => set({
    currentNote: null,
    currentNoteId: null,
    content: '',
    title: '',
    isDirty: false,
    undoStack: [],
    redoStack: [],
    canUndo: false,
    canRedo: false,
  }),
}));
