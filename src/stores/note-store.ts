/**
 * 笔记Store（Zustand）
 * 管理笔记列表、当前笔记、查询条件等状态
 */

import { create } from 'zustand';
import { Note, CreateNoteInput, UpdateNoteInput, NoteQuery, NoteStats } from '../domain/models/note';
import { NoteService } from '../modules/note/services/note-service';
import { IndexedDBNoteRepository } from '../infrastructure/indexeddb/note-repository';
import { eventBus, EVENTS } from '../shared/kernel/event-bus';
import { logger } from '../shared/kernel/logger';

// 初始化Service
const noteRepository = new IndexedDBNoteRepository();
const noteService = new NoteService(noteRepository);

interface NoteState {
  // 数据
  notes: Note[];
  currentNoteId: string | null;
  stats: NoteStats | null;

  // 查询
  query: NoteQuery;
  setQuery: (query: Partial<NoteQuery>) => void;
  resetQuery: () => void;

  // 加载状态
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // 操作
  fetchNotes: () => Promise<void>;
  fetchStats: () => Promise<void>;
  getNote: (id: string) => Note | undefined;
  createNote: (input: CreateNoteInput) => Promise<Note>;
  updateNote: (id: string, input: UpdateNoteInput) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  duplicateNote: (id: string) => Promise<Note>;
  moveToFolder: (id: string, folderId: string | null) => Promise<Note>;
  toggleFavorite: (id: string) => Promise<Note>;
  selectNote: (id: string | null) => void;
  refresh: () => Promise<void>;
}

const defaultQuery: NoteQuery = {
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  deleted: false,
};

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNoteId: null,
  stats: null,
  query: { ...defaultQuery },
  isLoading: false,
  isSaving: false,
  error: null,

  setQuery: (query) => {
    set({ query: { ...get().query, ...query } });
    get().fetchNotes();
  },

  resetQuery: () => {
    set({ query: { ...defaultQuery } });
    get().fetchNotes();
  },

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await noteService.query(get().query);
      set({ notes, isLoading: false });
    } catch (err) {
      logger.error('获取笔记列表失败', err);
      set({ isLoading: false, error: '获取笔记列表失败' });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await noteService.getStats();
      set({ stats });
    } catch (err) {
      logger.error('获取笔记统计失败', err);
    }
  },

  getNote: (id) => get().notes.find((n) => n.id === id),

  createNote: async (input) => {
    set({ isSaving: true });
    try {
      const note = await noteService.create(input);
      set((state) => ({
        notes: [note, ...state.notes],
        currentNoteId: note.id,
        isSaving: false,
      }));
      get().fetchStats();
      return note;
    } catch (err) {
      logger.error('创建笔记失败', err);
      set({ isSaving: false, error: '创建笔记失败' });
      throw err;
    }
  },

  updateNote: async (id, input) => {
    set({ isSaving: true });
    try {
      const note = await noteService.update(id, input);
      set((state) => ({
        notes: state.notes.map((n) => (n.id === id ? note : n)),
        isSaving: false,
      }));
      get().fetchStats();
      return note;
    } catch (err) {
      logger.error('更新笔记失败', err);
      set({ isSaving: false, error: '更新笔记失败' });
      throw err;
    }
  },

  deleteNote: async (id) => {
    try {
      await noteService.delete(id);
      set((state) => ({
        notes: state.notes.filter((n) => n.id !== id),
        currentNoteId: state.currentNoteId === id ? null : state.currentNoteId,
      }));
      get().fetchStats();
    } catch (err) {
      logger.error('删除笔记失败', err);
      throw err;
    }
  },

  duplicateNote: async (id) => {
    const note = await noteService.duplicate(id);
    set((state) => ({ notes: [note, ...state.notes] }));
    get().fetchStats();
    return note;
  },

  moveToFolder: async (id, folderId) => {
    return get().updateNote(id, { folderId });
  },

  toggleFavorite: async (id) => {
    return get().updateNote(id, {}); // NoteService处理逻辑
  },

  selectNote: (id) => {
    set({ currentNoteId: id });
    if (id) {
      eventBus.emit(EVENTS.NOTE.SELECTED, { id });
    }
  },

  refresh: async () => {
    await Promise.all([get().fetchNotes(), get().fetchStats()]);
  },
}));

// 导出Service供外部使用
export { noteService, noteRepository };
