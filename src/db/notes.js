// ============================================
// OneOS V2 - 笔记数据操作模块
// 封装笔记相关的业务逻辑，基于IndexedDB核心层
// ============================================

(function() {
  'use strict';

  const DB = window.OneOSDB;
  const STORE = 'notes';

  // ============================================
  // 笔记CRUD
  // ============================================

  /**
   * 创建新笔记
   * @param {object} noteData - 笔记数据
   * @returns {Promise<object>} 创建的笔记
   */
  async function createNote(noteData = {}) {
    const now = new Date().toISOString();
    const note = {
      id: noteData.id || `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: noteData.title || '无标题笔记',
      content: noteData.content || '',
      folder: noteData.folder || '未分类',
      tags: noteData.tags || [],
      createdAt: noteData.createdAt || now,
      updatedAt: now,
      wordCount: countWords(noteData.content || ''),
      backlinks: noteData.backlinks || [],
      type: noteData.type || 'note', // note | card | summary | meta
      elevationLevel: noteData.elevationLevel || 0, // 0=原文, 1=卡片, 2=摘要, 3=元知识
      archived: noteData.archived || false,
      pinned: noteData.pinned || false,
      ...noteData,
    };

    await DB.add(STORE, note);
    return note;
  }

  /**
   * 获取笔记
   * @param {string} id - 笔记ID
   * @returns {Promise<object|undefined>}
   */
  async function getNote(id) {
    return DB.get(STORE, id);
  }

  /**
   * 更新笔记
   * @param {string} id - 笔记ID
   * @param {object} updates - 要更新的字段
   * @returns {Promise<object>} 更新后的笔记
   */
  async function updateNote(id, updates) {
    const note = await DB.get(STORE, id);
    if (!note) {
      throw new Error(`笔记不存在: ${id}`);
    }

    const updatedNote = {
      ...note,
      ...updates,
      id: note.id, // 确保ID不变
      updatedAt: new Date().toISOString(),
      wordCount: updates.content !== undefined
        ? countWords(updates.content)
        : note.wordCount,
    };

    await DB.put(STORE, updatedNote);
    return updatedNote;
  }

  /**
   * 删除笔记
   * @param {string} id - 笔记ID
   * @returns {Promise<void>}
   */
  async function deleteNote(id) {
    return DB.remove(STORE, id);
  }

  /**
   * 批量删除笔记
   * @param {string[]} ids - 笔记ID数组
   * @returns {Promise<void>}
   */
  async function deleteNotes(ids) {
    return DB.bulkRemove(STORE, ids);
  }

  // ============================================
  // 笔记查询
  // ============================================

  /**
   * 获取所有笔记
   * @param {object} [options] - 查询选项
   * @param {string} [options.sortBy='updatedAt'] - 排序字段
   * @param {string} [options.order='desc'] - 排序方向
   * @param {boolean} [options.includeArchived=false] - 是否包含已归档
   * @param {number} [options.limit] - 返回数量限制
   * @returns {Promise<object[]>}
   */
  async function getAllNotes(options = {}) {
    const { sortBy = 'updatedAt', order = 'desc', includeArchived = false, limit } = options;

    let notes = await DB.getAll(STORE);

    // 过滤已归档
    if (!includeArchived) {
      notes = notes.filter(n => !n.archived);
    }

    // 排序
    notes.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      if (order === 'desc') {
        return bVal.localeCompare ? bVal.localeCompare(aVal) : bVal - aVal;
      }
      return aVal.localeCompare ? aVal.localeCompare(bVal) : aVal - bVal;
    });

    // 限制数量
    if (limit) {
      notes = notes.slice(0, limit);
    }

    return notes;
  }

  /**
   * 按文件夹获取笔记
   * @param {string} folder - 文件夹名称
   * @param {object} [options] - 查询选项
   * @returns {Promise<object[]>}
   */
  async function getNotesByFolder(folder, options = {}) {
    let notes = await DB.getByIndex(STORE, 'folder', folder);
    if (!options.includeArchived) {
      notes = notes.filter(n => !n.archived);
    }
    return notes;
  }

  /**
   * 按标签获取笔记
   * @param {string} tag - 标签名称
   * @returns {Promise<object[]>}
   */
  async function getNotesByTag(tag) {
    const allNotes = await DB.getAll(STORE);
    return allNotes.filter(n => (n.tags || []).includes(tag));
  }

  /**
   * 按升维层级获取笔记
   * @param {number} level - 层级（0=原文, 1=卡片, 2=摘要, 3=元知识）
   * @returns {Promise<object[]>}
   */
  async function getNotesByLevel(level) {
    const allNotes = await DB.getAll(STORE);
    return allNotes.filter(n => n.elevationLevel === level);
  }

  /**
   * 搜索笔记
   * @param {string} keyword - 搜索关键词
   * @param {object} [options] - 搜索选项
   * @param {string[]} [options.fields=['title','content']] - 搜索字段
   * @param {boolean} [options.includeArchived=false] - 是否包含已归档
   * @returns {Promise<Array<{item: object, score: number}>>}
   */
  async function searchNotes(keyword, options = {}) {
    const { fields = ['title', 'content'], includeArchived = false } = options;

    let results = await DB.search(STORE, keyword, fields);

    if (!includeArchived) {
      results = results.filter(r => !r.item.archived);
    }

    return results;
  }

  /**
   * 获取最近编辑的笔记
   * @param {number} [limit=10] - 返回数量
   * @returns {Promise<object[]>}
   */
  async function getRecentNotes(limit = 10) {
    return getAllNotes({ sortBy: 'updatedAt', order: 'desc', limit });
  }

  /**
   * 获取置顶笔记
   * @returns {Promise<object[]>}
   */
  async function getPinnedNotes() {
    const allNotes = await DB.getAll(STORE);
    return allNotes.filter(n => n.pinned && !n.archived);
  }

  // ============================================
  // 笔记统计
  // ============================================

  /**
   * 获取笔记统计信息
   * @returns {Promise<object>}
   */
  async function getNoteStats() {
    const allNotes = await DB.getAll(STORE, { includeArchived: true });
    const activeNotes = allNotes.filter(n => !n.archived);

    const levelCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
    const folderCounts = {};
    const tagCounts = {};
    let totalWords = 0;

    activeNotes.forEach(note => {
      // 层级统计
      const level = note.elevationLevel || 0;
      levelCounts[level] = (levelCounts[level] || 0) + 1;

      // 文件夹统计
      const folder = note.folder || '未分类';
      folderCounts[folder] = (folderCounts[folder] || 0) + 1;

      // 标签统计
      (note.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      // 字数统计
      totalWords += note.wordCount || 0;
    });

    return {
      total: allNotes.length,
      active: activeNotes.length,
      archived: allNotes.length - activeNotes.length,
      totalWords,
      levelCounts,
      folderCounts,
      tagCounts: Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
      folders: Object.entries(folderCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    };
  }

  // ============================================
  // 知识升维操作
  // ============================================

  /**
   * 将笔记升维到下一层级
   * @param {string} id - 笔记ID
   * @param {object} [elevatedData] - 升维后的笔记数据
   * @returns {Promise<{original: object, elevated: object}>}
   */
  async function elevateNote(id, elevatedData = {}) {
    const original = await DB.get(STORE, id);
    if (!original) {
      throw new Error(`笔记不存在: ${id}`);
    }

    const currentLevel = original.elevationLevel || 0;
    if (currentLevel >= 3) {
      throw new Error('笔记已达到最高层级（元知识）');
    }

    const nextLevel = currentLevel + 1;
    const levelNames = ['原文', '卡片', '摘要', '元知识'];

    // 创建升维后的新笔记
    const elevated = await createNote({
      title: elevatedData.title || `[${levelNames[nextLevel]}] ${original.title}`,
      content: elevatedData.content || original.content,
      folder: elevatedData.folder || original.folder,
      tags: elevatedData.tags || original.tags,
      type: elevatedData.type || ['note', 'card', 'summary', 'meta'][nextLevel],
      elevationLevel: nextLevel,
      backlinks: [original.id, ...(original.backlinks || [])],
      ...elevatedData,
    });

    // 更新原笔记，标记已升维
    await updateNote(id, {
      elevatedTo: elevated.id,
      elevationStatus: 'elevated',
    });

    return { original, elevated };
  }

  // ============================================
  // 反向链接
  // ============================================

  /**
   * 获取笔记的反向链接（哪些笔记引用了当前笔记）
   * @param {string} id - 笔记ID
   * @returns {Promise<object[]>}
   */
  async function getBacklinks(id) {
    const allNotes = await DB.getAll(STORE);
    return allNotes.filter(n => {
      // 检查backlinks数组
      if (n.backlinks && n.backlinks.includes(id)) return true;
      // 检查内容中的 [[id]] 或 [[title]] 引用
      if (n.content && (n.content.includes(`[[${id}]]`) || n.content.includes(`[[${n.title}]]`))) {
        return true;
      }
      return false;
    });
  }

  // ============================================
  // 导入导出
  // ============================================

  /**
   * 导出笔记为Markdown文件内容
   * @param {string} id - 笔记ID
   * @returns {Promise<string>} Markdown内容
   */
  async function exportNoteToMarkdown(id) {
    const note = await DB.get(STORE, id);
    if (!note) {
      throw new Error(`笔记不存在: ${id}`);
    }

    const frontmatter = [
      '---',
      `title: ${note.title}`,
      `date: ${note.createdAt}`,
      `updated: ${note.updatedAt}`,
      `tags: [${(note.tags || []).join(', ')}]`,
      `folder: ${note.folder}`,
      `type: ${note.type}`,
      `level: ${note.elevationLevel}`,
      '---',
      '',
    ].join('\n');

    return frontmatter + (note.content || '');
  }

  /**
   * 从Markdown内容导入笔记
   * @param {string} markdown - Markdown内容
   * @returns {Promise<object>} 导入的笔记
   */
  async function importNoteFromMarkdown(markdown) {
    const { metadata, content } = parseFrontmatter(markdown);

    return createNote({
      title: metadata.title || '导入的笔记',
      content,
      folder: metadata.folder || '导入',
      tags: metadata.tags || [],
      type: metadata.type || 'note',
      elevationLevel: parseInt(metadata.level) || 0,
      createdAt: metadata.date || new Date().toISOString(),
    });
  }

  // ============================================
  // 工具函数
  // ============================================

  /**
   * 计算字数（中文按字符，英文按单词）
   * @param {string} text - 文本
   * @returns {number}
   */
  function countWords(text) {
    if (!text) return 0;
    // 中文字符数
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    // 英文单词数
    const englishWords = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  /**
   * 解析Markdown Frontmatter
   * @param {string} markdown - Markdown内容
   * @returns {{metadata: object, content: string}}
   */
  function parseFrontmatter(markdown) {
    const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) {
      return { metadata: {}, content: markdown };
    }

    const metadata = {};
    match[1].split('\n').forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();
        // 处理数组
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
        }
        metadata[key] = value;
      }
    });

    return { metadata, content: match[2] };
  }

  // ============================================
  // 暴露API
  // ============================================

  const NotesDB = {
    // CRUD
    createNote,
    getNote,
    updateNote,
    deleteNote,
    deleteNotes,

    // 查询
    getAllNotes,
    getNotesByFolder,
    getNotesByTag,
    getNotesByLevel,
    searchNotes,
    getRecentNotes,
    getPinnedNotes,

    // 统计
    getNoteStats,

    // 升维
    elevateNote,

    // 反向链接
    getBacklinks,

    // 导入导出
    exportNoteToMarkdown,
    importNoteFromMarkdown,

    // 工具
    countWords,
    parseFrontmatter,
  };

  if (typeof window !== 'undefined') {
    window.NotesDB = NotesDB;
  }

  console.log('[NotesDB] 笔记数据模块已加载');

})();
