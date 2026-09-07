/**
 * OneOS 应用全局Store（Zustand）
 * 管理应用级状态：导航、加载、主题、Toast等
 */

import { create } from 'zustand';

export type NavKey =
  | 'dashboard'
  | 'notes'
  | 'editor'
  | 'graph'
  | 'calendar'
  | 'ai'
  | 'social'
  | 'voice'
  | 'search'
  | 'knowledge'
  | 'settings';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface AppState {
  // 导航
  currentNav: NavKey;
  setCurrentNav: (nav: NavKey) => void;

  // 加载状态
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (isLoading: boolean, message?: string) => void;

  // 侧边栏
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // 移动端抽屉
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;

  // 主题
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // 专注模式
  focusMode: boolean;
  setFocusMode: (focus: boolean) => void;
  toggleFocusMode: () => void;

  // Toast
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // 快捷键面板
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // 应用初始化
  initialized: boolean;
  setInitialized: (initialized: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentNav: 'dashboard',
  setCurrentNav: (nav) => set({ currentNav: nav }),

  isLoading: false,
  loadingMessage: '',
  setLoading: (isLoading, message = '') => set({ isLoading, loadingMessage: message }),

  sidebarCollapsed: false,
  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  mobileDrawerOpen: false,
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),

  theme: 'light',
  setTheme: (theme) => {
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('oneos-theme', theme);
  },
  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },

  focusMode: false,
  setFocusMode: (focus) => set({ focusMode: focus }),
  toggleFocusMode: () => set({ focusMode: !get().focusMode }),

  toasts: [],
  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newToast = { ...toast, id };
    set({ toasts: [...get().toasts, newToast] });
    const duration = toast.duration ?? 3000;
    setTimeout(() => get().removeToast(id), duration);
  },
  removeToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  clearToasts: () => set({ toasts: [] }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  initialized: false,
  setInitialized: (initialized) => set({ initialized }),
}));
