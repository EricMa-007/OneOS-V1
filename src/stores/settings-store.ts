/**
 * 设置Store（Zustand）
 */

import { create } from 'zustand';
import { AppSettings, DEFAULT_SETTINGS, mergeSettings } from '../domain/models/setting';

interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // 操作
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;

  // 便捷方法
  setTheme: (theme: AppSettings['theme']) => void;
  setAccentColor: (color: string) => void;
  setFontSize: (size: AppSettings['fontSize']) => void;
  setDensity: (density: AppSettings['density']) => void;
  setEditorMode: (mode: AppSettings['editorMode']) => void;
  setAIProvider: (provider: AppSettings['aiProvider']) => void;
  setAIModel: (model: string) => void;
  setAIAPIKey: (key: string) => void;
  setAutoSave: (enabled: boolean) => void;
  setShowAnimations: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setNotifications: (enabled: boolean) => void;
  setDailyReminder: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;

  // 导入导出
  exportSettings: () => string;
  importSettings: (json: string) => Promise<boolean>;

  // 快捷键
  setShortcut: (action: string, shortcut: string) => void;
  removeShortcut: (action: string) => void;
  resetShortcuts: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  isLoading: false,
  isSaving: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      // 从localStorage加载
      const saved = localStorage.getItem('oneos-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ settings: mergeSettings(DEFAULT_SETTINGS, parsed) });
      }
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: '加载设置失败' });
    }
  },

  updateSettings: async (updates) => {
    set({ isSaving: true });
    const newSettings = mergeSettings(get().settings, updates);
    set({ settings: newSettings });
    localStorage.setItem('oneos-settings', JSON.stringify(newSettings));
    // 应用主题
    if (updates.theme) {
      document.documentElement.setAttribute('data-theme', updates.theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : updates.theme);
    }
    set({ isSaving: false });
  },

  resetSettings: async () => {
    set({ isSaving: true });
    set({ settings: { ...DEFAULT_SETTINGS } });
    localStorage.removeItem('oneos-settings');
    set({ isSaving: false });
  },

  setTheme: (theme) => get().updateSettings({ theme }),
  setAccentColor: (color) => get().updateSettings({ accentColor: color }),
  setFontSize: (size) => get().updateSettings({ fontSize: size }),
  setDensity: (density) => get().updateSettings({ density }),
  setEditorMode: (mode) => get().updateSettings({ editorMode: mode }),
  setAIProvider: (provider) => get().updateSettings({ aiProvider: provider }),
  setAIModel: (model) => get().updateSettings({ aiModel: model }),
  setAIAPIKey: (key) => get().updateSettings({ aiApiKey: key }),
  setAutoSave: (enabled) => get().updateSettings({ autoSave: enabled }),
  setShowAnimations: (enabled) => get().updateSettings({ showAnimations: enabled }),
  setReduceMotion: (enabled) => get().updateSettings({ reduceMotion: enabled }),
  setNotifications: (enabled) => get().updateSettings({ notificationsEnabled: enabled }),
  setDailyReminder: (enabled) => get().updateSettings({ dailyReminder: enabled }),
  setDailyReminderTime: (time) => get().updateSettings({ dailyReminderTime: time }),

  exportSettings: () => JSON.stringify(get().settings, null, 2),

  importSettings: async (json) => {
    try {
      const parsed = JSON.parse(json);
      await get().updateSettings(parsed);
      return true;
    } catch (err) {
      set({ error: '导入设置失败：无效的JSON格式' });
      return false;
    }
  },

  setShortcut: (action, shortcut) => {
    const customShortcuts = { ...get().settings.customShortcuts, [action]: shortcut };
    get().updateSettings({ customShortcuts });
  },
  removeShortcut: (action) => {
    const customShortcuts = { ...get().settings.customShortcuts };
    delete customShortcuts[action];
    get().updateSettings({ customShortcuts });
  },
  resetShortcuts: () => get().updateSettings({ customShortcuts: {} }),
}));
