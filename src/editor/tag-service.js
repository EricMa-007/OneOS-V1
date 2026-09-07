// ============================================
// OneOS V2 - 标签管理服务模块
// 标签提取、统计、管理、筛选、颜色、嵌套
// ============================================

(function() {
  'use strict';

  // 预设标签颜色
  const PRESET_COLORS = [
    '#7C6FF0', // 紫色
    '#4ECDC4', // 青色
    '#FF6B6B', // 红色
    '#FFD93D', // 黄色
    '#6BCB77', // 绿色
    '#FF9F43', // 橙色
    '#54A0FF', // 蓝色
    '#5F27CD', // 深紫
    '#EE5A6F', // 粉红
    '#00D2D3', // 青绿
    '#FECA57', // 金黄
    '#FF9FF3', // 浅粉
  ];

  // 标签分类（预设）
  const CATEGORY_MAP = {
    '方法论': '#3D4A6B',
    '哲学': '#B56B3A',
    '技术': '#5A7A4E',
    '社会': '#C9A23F',
    '艺术': '#9B6BA0',
    '日常': '#6B6960',
    '归档': '#9B998F',
  };

  // 标签数据缓存
  let allTags = {};       // { tagName: { name, count, color, category, notes: [], parent, children: [] } }
  let tagList = [];        // 排序后的标签列表
  let lastScanTime = 0;
  const SCAN_INTERVAL = 5000;

  // 自定义标签配置（存储在localStorage）
  const CUSTOM_CONFIG_KEY = 'oneos_tag_config';

  function loadCustomConfig() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_CONFIG_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function saveCustomConfig(config) {
    localStorage.setItem(CUSTOM_CONFIG_KEY, JSON.stringify(config));
  }

  // ============================================
  // 从笔记内容中提取标签
  // ============================================

  function extractTagsFromContent(content) {
    if (!content) return [];
    const tags = [];
    // 匹配 #标签 格式（不在代码块内）
    const regex = /(?:^|\s)#([\u4e00-\u9fa5a-zA-Z][\u4e00-\u9fa5a-zA-Z0-9_-]*)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      tags.push(match[1]);
    }
    return [...new Set(tags)];
  }

  // ============================================
  // 扫描所有笔记，构建标签索引
  // ============================================

  async function scanAllTags(notes) {
    if (!notes || notes.length === 0) {
      if (window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes) {
        notes = Object.values(window.KNOWLEDGE_BASE.notes);
      } else if (window.DataAdapter && window.DataAdapter.getAllNotes) {
        notes = window.DataAdapter.getAllNotes();
      } else {
        console.warn('[TagService] 没有可用的笔记数据');
        return;
      }
    }

    const customConfig = loadCustomConfig();
    allTags = {};
    let colorIndex = 0;

    notes.forEach(note => {
      // 从笔记的 tags 字段获取
      const noteTags = note.tags || [];
      // 从内容中提取
      const contentTags = extractTagsFromContent(note.content || '');
      // 合并
      const allNoteTags = [...new Set([...noteTags, ...contentTags])];

      allNoteTags.forEach(tagName => {
        if (!allTags[tagName]) {
          // 确定标签颜色
          let color = customConfig[tagName]?.color;
          if (!color) {
            // 尝试从分类映射
            const category = Object.keys(CATEGORY_MAP).find(cat => tagName.includes(cat));
            color = category ? CATEGORY_MAP[category] : PRESET_COLORS[colorIndex % PRESET_COLORS.length];
            colorIndex++;
          }

          allTags[tagName] = {
            name: tagName,
            count: 0,
            color: color,
            category: customConfig[tagName]?.category || '',
            notes: [],
            parent: customConfig[tagName]?.parent || null,
            children: [],
            createdAt: customConfig[tagName]?.createdAt || new Date().toISOString(),
          };
        }
        allTags[tagName].count++;
        allTags[tagName].notes.push({
          id: note.id,
          title: note.title || note.name || '',
          updatedAt: note.updatedAt || note.createdAt || '',
        });
      });
    });

    // 构建父子关系
    Object.values(allTags).forEach(tag => {
      if (tag.parent && allTags[tag.parent]) {
        allTags[tag.parent].children.push(tag.name);
      }
    });

    // 排序（按使用频率降序）
    tagList = Object.values(allTags).sort((a, b) => b.count - a.count);
    lastScanTime = Date.now();

    console.log(`[TagService] 扫描完成: ${tagList.length}个标签, ${notes.length}篇笔记`);
  }

  // ============================================
  // 获取所有标签
  // ============================================

  async function getAllTags(forceRescan = false) {
    const now = Date.now();
    if (forceRescan || now - lastScanTime > SCAN_INTERVAL || tagList.length === 0) {
      await scanAllTags();
    }
    return tagList;
  }

  // ============================================
  // 获取标签云数据（按频率调整大小）
  // ============================================

  async function getTagCloud(forceRescan = false) {
    const tags = await getAllTags(forceRescan);
    if (tags.length === 0) return [];

    const maxCount = Math.max(...tags.map(t => t.count));
    const minCount = Math.min(...tags.map(t => t.count));

    return tags.map(tag => {
      // 计算字体大小（12px - 24px）
      const ratio = maxCount === minCount ? 0.5 : (tag.count - minCount) / (maxCount - minCount);
      const fontSize = 12 + ratio * 12;
      // 计算不透明度（0.6 - 1.0）
      const opacity = 0.6 + ratio * 0.4;

      return {
        ...tag,
        fontSize,
        opacity,
        weight: 400 + Math.round(ratio * 300),
      };
    });
  }

  // ============================================
  // 获取指定标签的笔记
  // ============================================

  async function getNotesByTag(tagName, forceRescan = false) {
    const tags = await getAllTags(forceRescan);
    const tag = allTags[tagName];
    return tag ? tag.notes : [];
  }

  // ============================================
  // 标签管理操作
  // ============================================

  // 重命名标签
  function renameTag(oldName, newName) {
    if (!allTags[oldName] || allTags[newName]) return false;

    const customConfig = loadCustomConfig();
    const oldConfig = customConfig[oldName] || {};

    // 更新所有笔记中的标签
    if (window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes) {
      Object.values(window.KNOWLEDGE_BASE.notes).forEach(note => {
        if (note.tags && note.tags.includes(oldName)) {
          note.tags = note.tags.map(t => t === oldName ? newName : t);
        }
        if (note.content) {
          note.content = note.content.replace(new RegExp(`#${oldName}(?=\\s|$)`, 'g'), `#${newName}`);
        }
      });
    }

    // 更新自定义配置
    customConfig[newName] = { ...oldConfig, name: newName };
    delete customConfig[oldName];
    saveCustomConfig(customConfig);

    // 重新扫描
    lastScanTime = 0;
    console.log(`[TagService] 标签重命名: ${oldName} -> ${newName}`);
    return true;
  }

  // 删除标签
  function deleteTag(tagName) {
    if (!allTags[tagName]) return false;

    // 从所有笔记中移除标签
    if (window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes) {
      Object.values(window.KNOWLEDGE_BASE.notes).forEach(note => {
        if (note.tags) {
          note.tags = note.tags.filter(t => t !== tagName);
        }
        if (note.content) {
          note.content = note.content.replace(new RegExp(`#${tagName}(?=\\s|$)`, 'g'), '');
        }
      });
    }

    // 移除自定义配置
    const customConfig = loadCustomConfig();
    delete customConfig[tagName];
    saveCustomConfig(customConfig);

    lastScanTime = 0;
    console.log(`[TagService] 标签删除: ${tagName}`);
    return true;
  }

  // 合并标签（将源标签合并到目标标签）
  function mergeTags(sourceName, targetName) {
    if (!allTags[sourceName] || !allTags[targetName]) return false;

    // 将源标签的笔记转移到目标标签
    if (window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes) {
      Object.values(window.KNOWLEDGE_BASE.notes).forEach(note => {
        if (note.tags && note.tags.includes(sourceName)) {
          if (!note.tags.includes(targetName)) {
            note.tags.push(targetName);
          }
          note.tags = note.tags.filter(t => t !== sourceName);
        }
        if (note.content) {
          note.content = note.content.replace(new RegExp(`#${sourceName}(?=\\s|$)`, 'g'), `#${targetName}`);
        }
      });
    }

    // 移除源标签配置
    const customConfig = loadCustomConfig();
    delete customConfig[sourceName];
    saveCustomConfig(customConfig);

    lastScanTime = 0;
    console.log(`[TagService] 标签合并: ${sourceName} -> ${targetName}`);
    return true;
  }

  // 设置标签颜色
  function setTagColor(tagName, color) {
    const customConfig = loadCustomConfig();
    if (!customConfig[tagName]) customConfig[tagName] = {};
    customConfig[tagName].color = color;
    saveCustomConfig(customConfig);

    if (allTags[tagName]) {
      allTags[tagName].color = color;
    }
    return true;
  }

  // 设置标签父级（嵌套标签）
  function setTagParent(tagName, parentName) {
    const customConfig = loadCustomConfig();
    if (!customConfig[tagName]) customConfig[tagName] = {};
    customConfig[tagName].parent = parentName;
    saveCustomConfig(customConfig);

    if (allTags[tagName]) {
      // 移除旧父级关系
      if (allTags[tagName].parent && allTags[allTags[tagName].parent]) {
        allTags[allTags[tagName].parent].children = allTags[allTags[tagName].parent].children.filter(c => c !== tagName);
      }
      // 设置新父级
      allTags[tagName].parent = parentName;
      if (parentName && allTags[parentName]) {
        allTags[parentName].children.push(tagName);
      }
    }
    return true;
  }

  // ============================================
  // 标签统计
  // ============================================

  function getTagStats() {
    return {
      totalTags: tagList.length,
      totalTaggings: tagList.reduce((sum, t) => sum + t.count, 0),
      topTags: tagList.slice(0, 10),
      orphanTags: tagList.filter(t => t.count === 1),
      nestedTags: tagList.filter(t => t.parent),
      lastScanTime: lastScanTime ? new Date(lastScanTime).toLocaleTimeString() : '从未扫描',
    };
  }

  // ============================================
  // 搜索标签
  // ============================================

  function searchTags(query) {
    if (!query) return tagList;
    const q = query.toLowerCase();
    return tagList.filter(tag =>
      tag.name.toLowerCase().includes(q) ||
      (tag.category && tag.category.toLowerCase().includes(q))
    );
  }

  // ============================================
  // 暴露 API
  // ============================================

  const TagService = {
    // 扫描和获取
    scanAllTags,
    getAllTags,
    getTagCloud,
    getNotesByTag,
    searchTags,

    // 管理操作
    renameTag,
    deleteTag,
    mergeTags,
    setTagColor,
    setTagParent,

    // 统计
    getTagStats,

    // 工具
    extractTagsFromContent,

    // 常量
    PRESET_COLORS,
    CATEGORY_MAP,
  };

  if (typeof window !== 'undefined') {
    window.TagService = TagService;
  }

  console.log('[TagService] 标签管理服务模块已加载');

})();
