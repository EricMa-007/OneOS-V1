// ============================================
// OneOS V2 - 数据适配层
// 桥接 IndexedDB 数据层与现有应用的 KNOWLEDGE_BASE 格式
// 实现：启动时加载、变更时自动保存、种子数据导入
// ============================================

(function() {
  'use strict';

  // 自动保存定时器
  let autoSaveTimer = null;
  const AUTO_SAVE_DELAY = 1500; // 1.5秒防抖

  // 数据变更标记
  let isDirty = false;
  let pendingNotes = {}; // 待保存的笔记 {id: note}

  // ============================================
  // 数据格式转换
  // ============================================

  /**
   * 将 IndexedDB 笔记格式转换为 KNOWLEDGE_BASE 格式
   * @param {object} dbNote - IndexedDB 中的笔记
   * @returns {object} KNOWLEDGE_BASE 格式的笔记
   */
  function dbNoteToKB(dbNote) {
    return {
      id: dbNote.id,
      name: dbNote.name || `${dbNote.title}.md`,
      title: dbNote.title,
      folder: dbNote.folder || '未分类',
      content: dbNote.content || '',
      tags: dbNote.tags || [],
      backlinks: dbNote.backlinks || [],
      createdAt: dbNote.createdAt,
      updatedAt: dbNote.updatedAt,
      readCount: dbNote.readCount || 0,
      wordCount: dbNote.wordCount || 0,
      type: dbNote.type || 'note',
      elevationLevel: dbNote.elevationLevel || 0,
      archived: dbNote.archived || false,
      pinned: dbNote.pinned || false,
    };
  }

  /**
   * 将 KNOWLEDGE_BASE 笔记格式转换为 IndexedDB 格式
   * @param {object} kbNote - KNOWLEDGE_BASE 格式的笔记
   * @returns {object} IndexedDB 格式的笔记
   */
  function kbNoteToDB(kbNote) {
    return {
      id: kbNote.id,
      name: kbNote.name || `${kbNote.title}.md`,
      title: kbNote.title,
      folder: kbNote.folder || '未分类',
      content: kbNote.content || '',
      tags: kbNote.tags || [],
      backlinks: kbNote.backlinks || [],
      createdAt: kbNote.createdAt || new Date().toISOString(),
      updatedAt: kbNote.updatedAt || new Date().toISOString(),
      readCount: kbNote.readCount || 0,
      wordCount: kbNote.wordCount || countWords(kbNote.content || ''),
      type: kbNote.type || 'note',
      elevationLevel: kbNote.elevationLevel || 0,
      archived: kbNote.archived || false,
      pinned: kbNote.pinned || false,
    };
  }

  /**
   * 计算字数
   */
  function countWords(text) {
    if (!text) return 0;
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  // ============================================
  // 初始化与加载
  // ============================================

  /**
   * 初始化数据层：从 IndexedDB 加载数据到 KNOWLEDGE_BASE
   * 如果数据库为空，导入种子数据
   * @returns {Promise<object>} 加载的 KNOWLEDGE_BASE
   */
  async function initDataLayer() {
    console.log('[DataAdapter] 开始初始化数据层...');

    try {
      // 确保 IndexedDB 已打开
      if (!window.OneOSDB) {
        console.error('[DataAdapter] OneOSDB 未加载');
        return null;
      }
      await window.OneOSDB.openDatabase();

      // 检查数据库中是否有笔记
      const noteCount = await window.OneOSDB.count('notes');
      console.log(`[DataAdapter] 数据库中笔记数量: ${noteCount}`);

      if (noteCount === 0) {
        // 数据库为空，导入种子数据（如果有全局 KNOWLEDGE_BASE）
        if (window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes) {
          console.log('[DataAdapter] 数据库为空，导入种子数据...');
          await importSeedData();
        } else {
          console.log('[DataAdapter] 数据库为空且无种子数据，创建默认笔记');
          await createDefaultNote();
        }
      }

      // 从 IndexedDB 加载所有笔记到 KNOWLEDGE_BASE
      await loadFromDB();

      // 恢复上次紧急保存的数据（如果有）
      await restoreEmergencySave();

      console.log('[DataAdapter] 数据层初始化完成');
      return window.KNOWLEDGE_BASE;
    } catch (err) {
      console.error('[DataAdapter] 数据层初始化失败:', err);
      // 初始化失败时，确保KNOWLEDGE_BASE存在，避免应用崩溃
      if (!window.KNOWLEDGE_BASE) {
        window.KNOWLEDGE_BASE = { notes: {}, folders: [] };
      }
      return window.KNOWLEDGE_BASE;
    }
  }

  /**
   * 从 IndexedDB 加载所有笔记到 KNOWLEDGE_BASE
   */
  async function loadFromDB() {
    const dbNotes = await window.OneOSDB.getAll('notes');
    const kbNotes = {};

    dbNotes.forEach(dbNote => {
      kbNotes[dbNote.id] = dbNoteToKB(dbNote);
    });

    // 确保 KNOWLEDGE_BASE 存在
    if (!window.KNOWLEDGE_BASE) {
      window.KNOWLEDGE_BASE = { notes: {}, folders: [] };
    }
    window.KNOWLEDGE_BASE.notes = kbNotes;

    // 重建文件夹列表（从笔记中提取）
    rebuildFolders();

    console.log(`[DataAdapter] 从数据库加载 ${dbNotes.length} 篇笔记`);
  }

  /**
   * 从笔记数据重建文件夹列表
   */
  function rebuildFolders() {
    if (!window.KNOWLEDGE_BASE) return;

    const folderMap = {};
    const notes = window.KNOWLEDGE_BASE.notes || {};

    Object.values(notes).forEach(note => {
      const folderName = note.folder || '未分类';
      if (!folderMap[folderName]) {
        folderMap[folderName] = {
          id: `f-${folderName.toLowerCase().replace(/\s+/g, '-')}`,
          name: folderName,
          icon: '📁',
          children: [],
        };
      }
      folderMap[folderName].children.push({
        id: note.id,
        name: note.name || `${note.title}.md`,
      });
    });

    window.KNOWLEDGE_BASE.folders = Object.values(folderMap).sort((a, b) =>
      a.name.localeCompare(b.name, 'zh-CN')
    );
  }

  // ============================================
  // 种子数据导入
  // ============================================

  /**
   * 导入种子数据（从全局 KNOWLEDGE_BASE 到 IndexedDB）
   */
  async function importSeedData() {
    const kbNotes = window.KNOWLEDGE_BASE.notes || {};
    const dbNotes = Object.values(kbNotes).map(kbNoteToDB);

    if (dbNotes.length > 0) {
      await window.OneOSDB.bulkPut('notes', dbNotes);
      console.log(`[DataAdapter] 导入 ${dbNotes.length} 篇种子笔记到数据库`);
    }
  }

  /**
   * 创建默认笔记
   */
  async function createDefaultNote() {
    const now = new Date().toISOString();
    const defaultNote = {
      id: 'n-oneos-1',
      name: '知识升维的四层结构.md',
      title: '知识升维的四层结构',
      folder: 'OneOS 核心',
      content: '# 知识升维的四层结构\n\nOneOS 的核心哲学是知识的持续升维。\n\n## 第一层：原文\n\n原始信息的记录，未经加工。\n\n## 第二层：卡片\n\n提炼核心观点，形成独立的知识卡片。\n\n## 第三层：摘要\n\n跨卡片的主题归纳，形成结构化的知识摘要。\n\n## 第四层：元知识\n\n关于知识的知识，认知框架的升维。\n',
      tags: ['知识管理', '升维', '核心概念'],
      backlinks: [],
      createdAt: now,
      updatedAt: now,
      readCount: 0,
      wordCount: 0,
      type: 'note',
      elevationLevel: 0,
    };
    defaultNote.wordCount = countWords(defaultNote.content);

    await window.OneOSDB.add('notes', defaultNote);
    console.log('[DataAdapter] 创建默认笔记');
  }

  // ============================================
  // 自动保存机制
  // ============================================

  /**
   * 标记笔记为待保存（防抖自动保存）
   * @param {string} noteId - 笔记ID
   * @param {object} noteData - 笔记数据（可选，不传则从 KNOWLEDGE_BASE 读取）
   */
  function markNoteDirty(noteId, noteData) {
    isDirty = true;

    // 从 KNOWLEDGE_BASE 获取最新数据
    if (!noteData && window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes) {
      noteData = window.KNOWLEDGE_BASE.notes[noteId];
    }

    if (noteData) {
      pendingNotes[noteId] = { ...noteData };
    }

    // 防抖自动保存
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    autoSaveTimer = setTimeout(() => {
      flushPendingNotes();
    }, AUTO_SAVE_DELAY);
  }

  /**
   * 立即保存所有待保存的笔记（带重试机制）
   * @param {number} retryCount - 当前重试次数
   */
  async function flushPendingNotes(retryCount = 0) {
    const noteIds = Object.keys(pendingNotes);
    if (noteIds.length === 0) return;

    console.log(`[DataAdapter] 自动保存 ${noteIds.length} 篇笔记...`);

    try {
      const dbNotes = noteIds.map(id => kbNoteToDB(pendingNotes[id]));
      await window.OneOSDB.bulkPut('notes', dbNotes);
      pendingNotes = {};
      isDirty = false;
      console.log('[DataAdapter] 自动保存完成');
    } catch (err) {
      console.error('[DataAdapter] 自动保存失败:', err);
      // 重试机制：最多重试3次，每次间隔500ms
      if (retryCount < 3) {
        console.log(`[DataAdapter] 自动保存重试 (${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 500));
        await flushPendingNotes(retryCount + 1);
      } else {
        console.error('[DataAdapter] 自动保存重试3次后仍失败，数据保留在内存中');
        // 保存失败时，将数据临时保存到localStorage作为兜底
        try {
          localStorage.setItem('oneos_pending_notes', JSON.stringify(pendingNotes));
          localStorage.setItem('oneos_pending_timestamp', Date.now().toString());
        } catch (e) {
          console.error('[DataAdapter] localStorage兜底保存也失败:', e);
        }
      }
    }
  }

  /**
   * 立即保存单篇笔记
   * @param {string} noteId - 笔记ID
   * @param {object} [noteData] - 笔记数据
   */
  async function saveNoteNow(noteId, noteData) {
    if (!noteData && window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes) {
      noteData = window.KNOWLEDGE_BASE.notes[noteId];
    }
    if (!noteData) return;

    const dbNote = kbNoteToDB(noteData);
    await window.OneOSDB.put('notes', dbNote);

    // 从待保存列表中移除
    delete pendingNotes[noteId];

    console.log(`[DataAdapter] 笔记已保存: ${noteId}`);
  }

  // ============================================
  // 笔记操作（同步到 IndexedDB）
  // ============================================

  /**
   * 创建新笔记（同步到 IndexedDB 和 KNOWLEDGE_BASE）
   * @param {object} noteData - 笔记数据
   * @returns {Promise<object>} 创建的笔记
   */
  async function createNote(noteData) {
    const now = new Date().toISOString();
    const newId = noteData.id || `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const note = {
      id: newId,
      name: noteData.name || `${noteData.title || '无标题'}.md`,
      title: noteData.title || '无标题笔记',
      folder: noteData.folder || '未分类',
      content: noteData.content || '',
      tags: noteData.tags || [],
      backlinks: noteData.backlinks || [],
      createdAt: noteData.createdAt || now,
      updatedAt: now,
      readCount: 0,
      wordCount: countWords(noteData.content || ''),
      type: noteData.type || 'note',
      elevationLevel: noteData.elevationLevel || 0,
      archived: false,
      pinned: false,
    };

    // 保存到 IndexedDB
    await window.OneOSDB.add('notes', kbNoteToDB(note));

    // 同步到 KNOWLEDGE_BASE
    if (!window.KNOWLEDGE_BASE) {
      window.KNOWLEDGE_BASE = { notes: {}, folders: [] };
    }
    window.KNOWLEDGE_BASE.notes[newId] = note;
    rebuildFolders();

    console.log(`[DataAdapter] 创建笔记: ${newId}`);
    return note;
  }

  /**
   * 删除笔记（同步到 IndexedDB 和 KNOWLEDGE_BASE）
   * @param {string} noteId - 笔记ID
   */
  async function deleteNote(noteId) {
    // 从 IndexedDB 删除
    await window.OneOSDB.remove('notes', noteId);

    // 从 KNOWLEDGE_BASE 删除
    if (window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes) {
      delete window.KNOWLEDGE_BASE.notes[noteId];
      rebuildFolders();
    }

    // 从待保存列表移除
    delete pendingNotes[noteId];

    console.log(`[DataAdapter] 删除笔记: ${noteId}`);
  }

  /**
   * 更新笔记内容（标记为待保存，防抖自动保存）
   * @param {string} noteId - 笔记ID
   * @param {string} content - 新内容
   */
  function updateNoteContent(noteId, content) {
    if (window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes && window.KNOWLEDGE_BASE.notes[noteId]) {
      window.KNOWLEDGE_BASE.notes[noteId].content = content;
      window.KNOWLEDGE_BASE.notes[noteId].updatedAt = new Date().toISOString();
      window.KNOWLEDGE_BASE.notes[noteId].wordCount = countWords(content);
      markNoteDirty(noteId);
    }
  }

  // ============================================
  // 数据导出
  // ============================================

  /**
   * 导出所有笔记为 JSON
   * @returns {Promise<object>}
   */
  async function exportAllNotes() {
    return window.OneOSDB.exportAll();
  }

  /**
   * 导出单篇笔记为 Markdown
   * @param {string} noteId - 笔记ID
   * @returns {Promise<string>}
   */
  async function exportNoteToMarkdown(noteId) {
    if (window.NotesDB) {
      return window.NotesDB.exportNoteToMarkdown(noteId);
    }
    // 降级实现
    const note = window.KNOWLEDGE_BASE?.notes?.[noteId];
    if (!note) return '';
    return `# ${note.title}\n\n${note.content}`;
  }

  // ============================================
  // 状态查询
  // ============================================

  /**
   * 获取数据层状态
   * @returns {object}
   */
  function getStatus() {
    return {
      isDirty,
      pendingCount: Object.keys(pendingNotes).length,
      totalNotes: window.KNOWLEDGE_BASE ? Object.keys(window.KNOWLEDGE_BASE.notes || {}).length : 0,
      autoSaveDelay: AUTO_SAVE_DELAY,
    };
  }

  /**
   * 页面隐藏/卸载前保存所有待保存数据
   * 使用visibilitychange事件，在页面隐藏时就开始保存，
   * 比beforeunload更早，有更多时间完成异步操作
   */
  function saveBeforeUnload() {
    if (isDirty && Object.keys(pendingNotes).length > 0) {
      console.log('[DataAdapter] 页面隐藏/卸载前触发保存');
      // 立即尝试保存（异步，可能无法完成，但尽量保存）
      flushPendingNotes();
    }
  }

  /**
   * 同步保存关键数据（用于beforeunload最后兜底）
   * 尝试使用localStorage临时保存待保存数据，
   * 下次启动时恢复
   */
  function emergencySave() {
    if (isDirty && Object.keys(pendingNotes).length > 0) {
      try {
        const pendingData = JSON.stringify(pendingNotes);
        localStorage.setItem('oneos_pending_notes', pendingData);
        localStorage.setItem('oneos_pending_timestamp', Date.now().toString());
        console.log('[DataAdapter] 紧急保存到localStorage:', Object.keys(pendingNotes).length, '篇笔记');
      } catch (e) {
        console.error('[DataAdapter] 紧急保存失败:', e);
      }
    }
  }

  /**
   * 从localStorage恢复紧急保存的数据
   */
  async function restoreEmergencySave() {
    try {
      const pendingData = localStorage.getItem('oneos_pending_notes');
      const timestamp = localStorage.getItem('oneos_pending_timestamp');
      if (pendingData && timestamp) {
        const notes = JSON.parse(pendingData);
        const noteIds = Object.keys(notes);
        if (noteIds.length > 0) {
          console.log('[DataAdapter] 恢复紧急保存的数据:', noteIds.length, '篇笔记');
          const dbNotes = noteIds.map(id => kbNoteToDB(notes[id]));
          await window.OneOSDB.bulkPut('notes', dbNotes);
          // 同步到KNOWLEDGE_BASE
          if (window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes) {
            noteIds.forEach(id => {
              window.KNOWLEDGE_BASE.notes[id] = notes[id];
            });
          }
        }
        // 清除临时数据
        localStorage.removeItem('oneos_pending_notes');
        localStorage.removeItem('oneos_pending_timestamp');
      }
    } catch (e) {
      console.error('[DataAdapter] 恢复紧急保存数据失败:', e);
    }
  }

  // ============================================
  // 暴露 API
  // ============================================

  const DataAdapter = {
    // 初始化
    initDataLayer,
    loadFromDB,
    rebuildFolders,

    // 格式转换
    dbNoteToKB,
    kbNoteToDB,

    // 自动保存
    markNoteDirty,
    flushPendingNotes,
    saveNoteNow,

    // 笔记操作
    createNote,
    deleteNote,
    updateNoteContent,

    // 导出
    exportAllNotes,
    exportNoteToMarkdown,

    // 状态
    getStatus,
    saveBeforeUnload,
    emergencySave,
    restoreEmergencySave,

    // 常量
    AUTO_SAVE_DELAY,
  };

  if (typeof window !== 'undefined') {
    window.DataAdapter = DataAdapter;
  }

  // 监听页面隐藏（比beforeunload更早，有更多时间保存）
  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        saveBeforeUnload();
      }
    });
    // beforeunload最后兜底，使用localStorage紧急保存
    window.addEventListener('beforeunload', emergencySave);
  }

  console.log('[DataAdapter] 数据适配层已加载');

})();
