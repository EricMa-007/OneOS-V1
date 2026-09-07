/**
 * 全局搜索Store（Zustand）
 */

import { create } from 'zustand';

export type SearchType = 'all' | 'notes' | 'tags' | 'folders' | 'contacts' | 'circles' | 'posts' | 'conversations' | 'commands';
export type SearchScope = 'global' | 'current-note' | 'current-folder';

export interface SearchResult {
  id: string;
  type: SearchType;
  title: string;
  description?: string;
  excerpt?: string;
  highlight?: { field: string; text: string }[];
  icon?: string;
  color?: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  type: SearchType;
  timestamp: string;
}

export interface SearchFilter {
  type: SearchType;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  folderId?: string;
}

interface SearchState {
  // 状态
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // 查询
  query: string;
  activeType: SearchType;
  scope: SearchScope;
  filters: SearchFilter;

  // 结果
  results: SearchResult[];
  groupedResults: Record<SearchType, SearchResult[]>;
  selectedIndex: number;
  totalCount: number;

  // 历史
  history: SearchHistoryItem[];
  showHistory: boolean;

  // 操作
  open: () => void;
  close: () => void;
  toggle: () => void;
  setQuery: (query: string) => void;
  setActiveType: (type: SearchType) => void;
  setScope: (scope: SearchScope) => void;
  setFilters: (filters: Partial<SearchFilter>) => void;
  resetFilters: () => void;

  search: (query?: string) => Promise<void>;
  selectResult: (index: number) => void;
  navigateToResult: (result: SearchResult) => void;
  nextResult: () => void;
  prevResult: () => void;

  addToHistory: (query: string, type: SearchType) => void;
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;

  getSuggestions: () => string[];
  clear: () => void;
}

const DEFAULT_FILTERS: SearchFilter = {
  type: 'all',
};

export const useSearchStore = create<SearchState>((set, get) => ({
  isOpen: false,
  isLoading: false,
  error: null,

  query: '',
  activeType: 'all',
  scope: 'global',
  filters: { ...DEFAULT_FILTERS },

  results: [],
  groupedResults: {} as Record<SearchType, SearchResult[]>,
  selectedIndex: 0,
  totalCount: 0,

  history: [],
  showHistory: true,

  open: () => set({ isOpen: true, showHistory: true }),
  close: () => set({ isOpen: false, query: '', results: [], selectedIndex: 0 }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  setQuery: (query) => {
    set({ query, selectedIndex: 0, showHistory: !query });
    if (query.length >= 2) {
      get().search(query);
    } else {
      set({ results: [], totalCount: 0 });
    }
  },
  setActiveType: (type) => set({ activeType: type, selectedIndex: 0 }),
  setScope: (scope) => set({ scope }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  search: async (query) => {
    const searchQuery = query || get().query;
    if (!searchQuery.trim()) {
      set({ results: [], totalCount: 0 });
      return;
    }
    set({ isLoading: true });
    // 实际调用SearchService
    await new Promise((r) => setTimeout(r, 200));
    set({ isLoading: false });
  },

  selectResult: (index) => set({ selectedIndex: index }),
  navigateToResult: (result) => {
    // 根据结果类型导航到对应页面
    get().addToHistory(get().query, result.type);
    get().close();
  },
  nextResult: () => set((state) => ({
    selectedIndex: Math.min(state.selectedIndex + 1, state.results.length - 1),
  })),
  prevResult: () => set((state) => ({
    selectedIndex: Math.max(state.selectedIndex - 1, 0),
  })),

  addToHistory: (query, type) => {
    if (!query.trim()) return;
    const item: SearchHistoryItem = {
      id: `sh_${Date.now()}`,
      query,
      type,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({
      history: [item, ...state.history.filter((h) => h.query !== query)].slice(0, 50),
    }));
  },
  clearHistory: () => set({ history: [] }),
  removeHistoryItem: (id) => set((state) => ({ history: state.history.filter((h) => h.id !== id) })),

  getSuggestions: () => {
    return get().history.slice(0, 5).map((h) => h.query);
  },

  clear: () => set({
    query: '',
    results: [],
    selectedIndex: 0,
    totalCount: 0,
    isLoading: false,
    error: null,
  }),
}));
