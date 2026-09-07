// ============================================
// OneOS V2 - 设置与状态持久化模块
// 封装用户设置、应用状态的持久化逻辑
// 使用 localStorage 存储小数据，IndexedDB 存储大数据
// ============================================

(function() {
  'use strict';

  const STORAGE_KEY = 'oneos_settings';
  const DB = window.OneOSDB;
  const SETTINGS_STORE = 'settings';

  // 默认设置
  const DEFAULT_SETTINGS = {
    // 外观设置
    appearance: {
      theme: 'light',           // light | dark | auto
      accentColor: '#7C6FF0',   // 主强调色
      density: 'regular',       // compact | regular | comfortable
      fontScale: 1.0,           // 字体缩放 0.8 - 1.5
      fontFamily: 'system',     // system | sans | serif | mono
      animations: true,         // 是否启用动画
      glassmorphism: true,      // 是否启用玻璃拟态效果
    },

    // 编辑器设置
    editor: {
      defaultMode: 'wysiwyg',   // wysiwyg | source | split
      fontSize: 16,              // 编辑器字体大小
      lineHeight: 1.7,           // 行高
      tabSize: 2,                // Tab缩进
      spellCheck: true,          // 拼写检查
      autoSave: true,            // 自动保存
      autoSaveInterval: 3000,    // 自动保存间隔（毫秒）
      wordWrap: true,            // 自动换行
      lineNumbers: false,        // 显示行号
      minimap: false,            // 显示小地图
    },

    // 行为设置
    behavior: {
      confirmDelete: true,       // 删除前确认
      autoArchive: false,        // 自动归档旧笔记
      autoArchiveDays: 90,       // 自动归档天数
      defaultFolder: '未分类',    // 默认文件夹
      newNoteTemplate: '',        // 新笔记模板
      shortcutsEnabled: true,     // 启用快捷键
      sidebarCollapsed: false,    // 侧边栏默认折叠
    },

    // AI设置
    ai: {
      enabled: true,              // 启用AI功能
      provider: 'ollama',         // ollama | openai | anthropic
      model: 'llama3',            // 默认模型
      baseUrl: 'http://localhost:11434', // API地址
      temperature: 0.7,           // 温度参数
      maxTokens: 2048,            // 最大token数
      streamOutput: true,         // 流式输出
      autoSuggest: true,          // 自动建议
      personaId: 'default',       // 默认人设ID
      ragEnabled: true,           // 启用RAG检索
      ragTopK: 5,                 // RAG检索数量
    },

    // 语音设置
    voice: {
      asrEnabled: true,           // 启用语音识别
      asrLanguage: 'zh-CN',      // 识别语言
      ttsEnabled: true,           // 启用语音合成
      ttsVoice: '',               // TTS音色
      ttsRate: 1.0,               // 语速
      ttsPitch: 1.0,              // 音调
      voiceCommands: true,        // 启用语音命令
    },

    // 社交设置
    social: {
      silentInbox: true,          // 静默收件箱
      timeWindowEnabled: false,   // 启用时间窗口
      timeWindowStart: '09:00',   // 时间窗口开始
      timeWindowEnd: '21:00',     // 时间窗口结束
      showOnlineStatus: false,    // 显示在线状态
      readReceipts: false,        // 已读回执
      notificationSound: false,   // 通知声音
      maxCircles: 3,              // 最大圈子数
      maxCircleMembers: 10,       // 圈子最大人数
    },

    // 数据设置
    data: {
      autoBackup: true,           // 自动备份
      backupInterval: 'daily',    // 备份频率 daily | weekly
      backupLocation: 'local',    // 备份位置
      exportFormat: 'markdown',   // 导出格式
      encryptionEnabled: false,   // 启用加密
      compressionEnabled: true,   // 启用压缩
    },

    // 隐私设置
    privacy: {
      telemetry: false,           // 遥测数据
      crashReports: true,         // 崩溃报告
      usageStats: false,          // 使用统计
      localOnly: true,            // 仅本地模式
      dataExport: true,           // 允许数据导出
      accountDeletion: true,      // 允许账户删除
    },

    // 系统信息（只读）
    system: {
      version: '2.0.0',
      buildDate: new Date().toISOString(),
      firstRun: true,
      lastSync: null,
      totalNotes: 0,
      storageUsed: 0,
    },
  };

  // 内存缓存
  let settingsCache = null;
  let cacheDirty = false;

  // ============================================
  // 设置加载与保存
  // ============================================

  /**
   * 加载设置（从 localStorage）
   * @returns {object} 设置对象
   */
  function loadSettings() {
    if (settingsCache && !cacheDirty) {
      return settingsCache;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 深度合并默认设置，确保新增的设置项有默认值
        settingsCache = deepMerge(DEFAULT_SETTINGS, parsed);
      } else {
        settingsCache = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (err) {
      console.error('[SettingsDB] 加载设置失败，使用默认设置:', err);
      settingsCache = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }

    cacheDirty = false;
    return settingsCache;
  }

  /**
   * 保存设置（到 localStorage）
   * @param {object} [settings] - 要保存的设置，不传则保存当前缓存
   * @returns {Promise<void>}
   */
  async function saveSettings(settings) {
    if (settings) {
      settingsCache = settings;
    }
    if (!settingsCache) {
      settingsCache = loadSettings();
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsCache));
      cacheDirty = false;
    } catch (err) {
      console.error('[SettingsDB] 保存设置失败:', err);
      throw err;
    }
  }

  /**
   * 获取设置值（支持点路径，如 'appearance.theme'）
   * @param {string} [path] - 设置路径
   * @param {*} [defaultValue] - 默认值
   * @returns {*}
   */
  function getSetting(path, defaultValue) {
    const settings = loadSettings();
    if (!path) return settings;

    const value = path.split('.').reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : undefined;
    }, settings);

    return value !== undefined ? value : defaultValue;
  }

  /**
   * 设置值（支持点路径）
   * @param {string} path - 设置路径
   * @param {*} value - 要设置的值
   * @param {boolean} [autoSave=true] - 是否自动保存
   * @returns {Promise<void>}
   */
  async function setSetting(path, value, autoSave = true) {
    const settings = loadSettings();
    const keys = path.split('.');
    let obj = settings;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;

    cacheDirty = true;

    if (autoSave) {
      await saveSettings();
    }
  }

  /**
   * 批量更新设置
   * @param {object} updates - 要更新的设置（扁平对象，key为点路径）
   * @returns {Promise<void>}
   */
  async function updateSettings(updates) {
    const settings = loadSettings();

    Object.entries(updates).forEach(([path, value]) => {
      const keys = path.split('.');
      let obj = settings;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) {
          obj[keys[i]] = {};
        }
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
    });

    cacheDirty = true;
    await saveSettings();
  }

  /**
   * 重置设置为默认值
   * @param {string} [section] - 要重置的部分，不传则重置全部
   * @returns {Promise<void>}
   */
  async function resetSettings(section) {
    if (section) {
      const settings = loadSettings();
      if (DEFAULT_SETTINGS[section]) {
        settings[section] = JSON.parse(JSON.stringify(DEFAULT_SETTINGS[section]));
        cacheDirty = true;
        await saveSettings();
      }
    } else {
      settingsCache = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      cacheDirty = true;
      await saveSettings();
    }
  }

  // ============================================
  // 应用状态持久化（IndexedDB）
  // ============================================

  /**
   * 保存应用状态（大体积数据，如UI状态、临时数据）
   * @param {string} key - 状态key
   * @param {*} value - 状态值
   * @returns {Promise<void>}
   */
  async function saveState(key, value) {
    if (!DB) {
      console.warn('[SettingsDB] IndexedDB未初始化，状态未保存');
      return;
    }
    await DB.put(SETTINGS_STORE, { key, value, updatedAt: new Date().toISOString() });
  }

  /**
   * 加载应用状态
   * @param {string} key - 状态key
   * @param {*} [defaultValue] - 默认值
   * @returns {Promise<*>}
   */
  async function loadState(key, defaultValue) {
    if (!DB) {
      return defaultValue;
    }
    const record = await DB.get(SETTINGS_STORE, key);
    return record ? record.value : defaultValue;
  }

  /**
   * 删除应用状态
   * @param {string} key - 状态key
   * @returns {Promise<void>}
   */
  async function removeState(key) {
    if (!DB) return;
    await DB.remove(SETTINGS_STORE, key);
  }

  // ============================================
  // 导入导出
  // ============================================

  /**
   * 导出设置为JSON
   * @returns {Promise<string>} JSON字符串
   */
  async function exportSettings() {
    const settings = loadSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * 从JSON导入设置
   * @param {string} json - JSON字符串
   * @param {boolean} [merge=true] - 是否合并（true: 合并，false: 覆盖）
   * @returns {Promise<void>}
   */
  async function importSettings(json, merge = true) {
    try {
      const imported = JSON.parse(json);
      if (merge) {
        const current = loadSettings();
        settingsCache = deepMerge(current, imported);
      } else {
        settingsCache = deepMerge(DEFAULT_SETTINGS, imported);
      }
      cacheDirty = true;
      await saveSettings();
    } catch (err) {
      console.error('[SettingsDB] 导入设置失败:', err);
      throw new Error('无效的设置JSON格式');
    }
  }

  // ============================================
  // 工具函数
  // ============================================

  /**
   * 深度合并两个对象（target被source覆盖）
   * @param {object} target - 目标对象
   * @param {object} source - 源对象
   * @returns {object} 合并后的对象
   */
  function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  /**
   * 获取存储使用情况
   * @returns {object}
   */
  function getStorageInfo() {
    const settingsStr = localStorage.getItem(STORAGE_KEY) || '';
    return {
      localStorageUsed: new Blob([settingsStr]).size,
      localStorageTotal: 5 * 1024 * 1024, // 约5MB
      percentage: (new Blob([settingsStr]).size / (5 * 1024 * 1024) * 100).toFixed(2),
    };
  }

  /**
   * 检查是否首次运行
   * @returns {boolean}
   */
  function isFirstRun() {
    return !localStorage.getItem(STORAGE_KEY);
  }

  /**
   * 标记首次运行完成
   */
  function markFirstRunComplete() {
    const settings = loadSettings();
    settings.system.firstRun = false;
    saveSettings();
  }

  // ============================================
  // 暴露API
  // ============================================

  const SettingsDB = {
    // 设置加载与保存
    loadSettings,
    saveSettings,
    getSetting,
    setSetting,
    updateSettings,
    resetSettings,

    // 应用状态
    saveState,
    loadState,
    removeState,

    // 导入导出
    exportSettings,
    importSettings,

    // 工具
    getStorageInfo,
    isFirstRun,
    markFirstRunComplete,
    deepMerge,

    // 默认设置（只读）
    DEFAULT_SETTINGS,
  };

  if (typeof window !== 'undefined') {
    window.SettingsDB = SettingsDB;
  }

  console.log('[SettingsDB] 设置数据模块已加载');

})();
