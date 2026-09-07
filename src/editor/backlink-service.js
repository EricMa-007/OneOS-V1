// ============================================
// OneOS V2 - 反向链接与知识关联模块
// 扫描所有笔记，构建引用关系图，计算反向链接
// ============================================

(function() {
  'use strict';

  // 缓存
  let linkGraph = {};       // { noteId: { outLinks: [], inLinks: [] } }
  let allNotes = [];        // 所有笔记缓存
  let lastScanTime = 0;     // 上次扫描时间
  const SCAN_INTERVAL = 5000; // 扫描间隔（毫秒）

  // ============================================
  // 扫描所有笔记，构建引用关系图
  // ============================================

  async function scanAllNotes(notes) {
    if (!notes || notes.length === 0) {
      // 尝试从全局获取
      if (window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes) {
        notes = Object.values(window.KNOWLEDGE_BASE.notes);
      } else if (window.DataAdapter && window.DataAdapter.getAllNotes) {
        notes = window.DataAdapter.getAllNotes();
      } else {
        console.warn('[Backlinks] 没有可用的笔记数据');
        return;
      }
    }

    allNotes = notes;
    linkGraph = {};

    // 初始化所有笔记的图节点
    notes.forEach(note => {
      linkGraph[note.id] = {
        id: note.id,
        title: note.title || note.name || '',
        outLinks: [],  // 出站链接（这篇笔记引用了哪些）
        inLinks: [],   // 入站链接（哪些笔记引用了这篇）
      };
    });

    // 扫描每篇笔记的出站链接
    notes.forEach(note => {
      const content = note.content || '';
      const wikilinks = extractWikilinks(content);
      const markdownLinks = extractMarkdownLinks(content);

      const allLinks = [...wikilinks, ...markdownLinks];

      allLinks.forEach(link => {
        // 尝试匹配目标笔记
        const targetNote = findNoteByLink(link, notes);
        if (targetNote) {
          // 添加出站链接
          if (!linkGraph[note.id].outLinks.find(l => l.targetId === targetNote.id)) {
            linkGraph[note.id].outLinks.push({
              targetId: targetNote.id,
              targetTitle: targetNote.title,
              context: extractLinkContext(content, link.full),
              linkText: link.displayText || link.text,
            });
          }
          // 添加入站链接到目标笔记
          if (!linkGraph[targetNote.id].inLinks.find(l => l.sourceId === note.id)) {
            linkGraph[targetNote.id].inLinks.push({
              sourceId: note.id,
              sourceTitle: note.title,
              context: extractLinkContext(content, link.full),
              linkText: link.displayText || link.text,
            });
          }
        } else {
          // 未找到目标笔记，记录为死链
          if (!linkGraph[note.id].deadLinks) linkGraph[note.id].deadLinks = [];
          linkGraph[note.id].deadLinks.push({
            name: link.name || link.text,
            displayText: link.displayText || link.text,
            context: extractLinkContext(content, link.full),
          });
        }
      });
    });

    lastScanTime = Date.now();
    console.log(`[Backlinks] 扫描完成: ${notes.length}篇笔记, 构建了引用关系图`);
  }

  // ============================================
  // 提取双链 [[note]] 或 [[note|text]]
  // ============================================

  function extractWikilinks(content) {
    if (!content) return [];
    const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
    const links = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      links.push({
        type: 'wikilink',
        name: match[1].trim(),
        displayText: match[2] ? match[2].trim() : match[1].trim(),
        full: match[0],
      });
    }
    return links;
  }

  // ============================================
  // 提取 Markdown 链接 [text](url)
  // ============================================

  function extractMarkdownLinks(content) {
    if (!content) return [];
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const links = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      const url = match[2];
      // 只处理内部链接（不是 http/https 开头）
      if (!url.startsWith('http') && !url.startsWith('mailto:')) {
        links.push({
          type: 'markdown',
          name: url,
          text: match[1],
          displayText: match[1],
          full: match[0],
        });
      }
    }
    return links;
  }

  // ============================================
  // 根据链接查找目标笔记
  // ============================================

  function findNoteByLink(link, notes) {
    const name = (link.name || '').toLowerCase().trim();
    if (!name) return null;

    // 1. 精确匹配 ID
    let found = notes.find(n => n.id === name);
    if (found) return found;

    // 2. 精确匹配标题
    found = notes.find(n => (n.title || '').toLowerCase() === name);
    if (found) return found;

    // 3. 精确匹配文件名
    found = notes.find(n => (n.name || '').toLowerCase() === name || (n.name || '').toLowerCase() === name + '.md');
    if (found) return found;

    // 4. 模糊匹配标题（包含）
    found = notes.find(n => (n.title || '').toLowerCase().includes(name));
    if (found) return found;

    return null;
  }

  // ============================================
  // 提取链接上下文（前后各100字）
  // ============================================

  function extractLinkContext(content, linkFull, contextLength = 100) {
    if (!content || !linkFull) return '';
    const index = content.indexOf(linkFull);
    if (index === -1) return '';

    const start = Math.max(0, index - contextLength);
    const end = Math.min(content.length, index + linkFull.length + contextLength);
    let context = content.slice(start, end);

    // 高亮链接文本
    context = context.replace(linkFull, `【${linkFull}】`);

    // 添加省略号
    if (start > 0) context = '...' + context;
    if (end < content.length) context = context + '...';

    return context;
  }

  // ============================================
  // 获取指定笔记的反向链接
  // ============================================

  async function getBacklinks(noteId, forceRescan = false) {
    const now = Date.now();
    if (forceRescan || now - lastScanTime > SCAN_INTERVAL || Object.keys(linkGraph).length === 0) {
      await scanAllNotes();
    }

    if (!linkGraph[noteId]) {
      return { inLinks: [], outLinks: [], deadLinks: [], linkCount: 0 };
    }

    const node = linkGraph[noteId];
    return {
      inLinks: node.inLinks || [],
      outLinks: node.outLinks || [],
      deadLinks: node.deadLinks || [],
      linkCount: (node.inLinks?.length || 0) + (node.outLinks?.length || 0),
    };
  }

  // ============================================
  // 获取所有未创建的笔记链接（死链）
  // ============================================

  function getAllDeadLinks() {
    const deadLinks = [];
    Object.values(linkGraph).forEach(node => {
      if (node.deadLinks && node.deadLinks.length > 0) {
        node.deadLinks.forEach(link => {
          deadLinks.push({
            sourceId: node.id,
            sourceTitle: node.title,
            ...link,
          });
        });
      }
    });
    return deadLinks;
  }

  // ============================================
  // 获取链接统计
  // ============================================

  function getLinkStats() {
    let totalOutLinks = 0;
    let totalInLinks = 0;
    let totalDeadLinks = 0;
    let isolatedNotes = 0; // 没有任何链接的笔记

    Object.values(linkGraph).forEach(node => {
      totalOutLinks += node.outLinks?.length || 0;
      totalInLinks += node.inLinks?.length || 0;
      totalDeadLinks += node.deadLinks?.length || 0;
      if ((node.outLinks?.length || 0) === 0 && (node.inLinks?.length || 0) === 0) {
        isolatedNotes++;
      }
    });

    return {
      totalNotes: Object.keys(linkGraph).length,
      totalOutLinks,
      totalInLinks,
      totalDeadLinks,
      isolatedNotes,
      lastScanTime: lastScanTime ? new Date(lastScanTime).toLocaleTimeString() : '从未扫描',
    };
  }

  // ============================================
  // 查找相关笔记（基于共同链接）
  // ============================================

  function getRelatedNotes(noteId, limit = 5) {
    if (!linkGraph[noteId]) return [];

    const node = linkGraph[noteId];
    const relatedMap = {};

    // 出站链接的笔记也链接到的笔记
    node.outLinks?.forEach(link => {
      const targetNode = linkGraph[link.targetId];
      if (targetNode) {
        targetNode.outLinks?.forEach(l2 => {
          if (l2.targetId !== noteId) {
            relatedMap[l2.targetId] = (relatedMap[l2.targetId] || 0) + 1;
          }
        });
        targetNode.inLinks?.forEach(l2 => {
          if (l2.sourceId !== noteId) {
            relatedMap[l2.sourceId] = (relatedMap[l2.sourceId] || 0) + 1;
          }
        });
      }
    });

    // 入站链接的笔记也链接到的笔记
    node.inLinks?.forEach(link => {
      const sourceNode = linkGraph[link.sourceId];
      if (sourceNode) {
        sourceNode.outLinks?.forEach(l2 => {
          if (l2.targetId !== noteId) {
            relatedMap[l2.targetId] = (relatedMap[l2.targetId] || 0) + 1;
          }
        });
      }
    });

    // 排序并返回
    return Object.entries(relatedMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, score]) => {
        const n = linkGraph[id];
        return {
          id,
          title: n?.title || id,
          relevance: score,
        };
      });
  }

  // ============================================
  // 暴露 API
  // ============================================

  const BacklinkService = {
    scanAllNotes,
    getBacklinks,
    getAllDeadLinks,
    getLinkStats,
    getRelatedNotes,
    extractWikilinks,
    extractMarkdownLinks,
    extractLinkContext,
    findNoteByLink,
  };

  if (typeof window !== 'undefined') {
    window.BacklinkService = BacklinkService;
  }

  console.log('[BacklinkService] 反向链接与知识关联模块已加载');

})();
