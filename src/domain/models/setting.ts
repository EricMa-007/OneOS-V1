/**
 * 设置领域模型
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';
export type DensityMode = 'compact' | 'comfortable' | 'spacious';
export type EditorMode = 'wysiwyg' | 'markdown' | 'split';
export type AIServiceProvider = 'ollama' | 'openai' | 'anthropic' | 'doubao';

export interface AppSettings {
  // 外观
  theme: ThemeMode;
  accentColor: string;
  fontSize: FontSize;
  density: DensityMode;
  fontFamily: string;
  showAnimations: boolean;
  reduceMotion: boolean;

  // 编辑器
  editorMode: EditorMode;
  editorFontSize: number;
  editorLineHeight: number;
  autoSave: boolean;
  autoSaveInterval: number; // 秒
  spellCheck: boolean;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;

  // 知识图谱
  graphNodeSize: number;
  graphLinkDistance: number;
  graphChargeStrength: number;
  graphShowLabels: boolean;
  graphColorBy: 'tag' | 'folder' | 'type' | 'none';

  // AI
  aiProvider: AIServiceProvider;
  aiModel: string;
  aiApiKey?: string;
  aiApiBase?: string;
  aiTemperature: number;
  aiMaxTokens: number;
  aiStreamResponse: boolean;
  defaultPersonaId?: string;

  // 语音
  voiceLanguage: string;
  voiceAutoTranscribe: boolean;
  voiceAutoSaveNote: boolean;
  ttsVoice: string;
  ttsRate: number;
  ttsPitch: number;

  // 数据
  dataEncryption: boolean;
  autoBackup: boolean;
  backupInterval: number; // 小时
  backupLocation?: string;
  retentionDays: number;

  // 通知
  notificationsEnabled: boolean;
  notificationSound: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string; // HH:mm

  // 快捷键
  customShortcuts: Record<string, string>;

  // 元数据
  version: string;
  lastUpdated: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  accentColor: '#8B5CF6',
  fontSize: 'medium',
  density: 'comfortable',
  fontFamily: 'Inter',
  showAnimations: true,
  reduceMotion: false,

  editorMode: 'wysiwyg',
  editorFontSize: 15,
  editorLineHeight: 1.7,
  autoSave: true,
  autoSaveInterval: 30,
  spellCheck: true,
  wordWrap: true,
  lineNumbers: false,
  minimap: false,

  graphNodeSize: 20,
  graphLinkDistance: 120,
  graphChargeStrength: -300,
  graphShowLabels: true,
  graphColorBy: 'tag',

  aiProvider: 'ollama',
  aiModel: 'llama3.1',
  aiTemperature: 0.7,
  aiMaxTokens: 4096,
  aiStreamResponse: true,

  voiceLanguage: 'zh-CN',
  voiceAutoTranscribe: true,
  voiceAutoSaveNote: true,
  ttsVoice: 'default',
  ttsRate: 1,
  ttsPitch: 1,

  dataEncryption: false,
  autoBackup: true,
  backupInterval: 24,
  retentionDays: 30,

  notificationsEnabled: true,
  notificationSound: true,
  dailyReminder: false,
  dailyReminderTime: '21:00',

  customShortcuts: {},

  version: '1.1.0',
  lastUpdated: new Date().toISOString(),
};

export function mergeSettings(current: AppSettings, updates: Partial<AppSettings>): AppSettings {
  return {
    ...current,
    ...updates,
    lastUpdated: new Date().toISOString(),
  };
}
