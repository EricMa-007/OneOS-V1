// ============================================
// OneOS V2 - 知识图谱数据服务
// 从笔记、反向链接、标签构建图谱数据
// ============================================

(function() {
  'use strict';

  // 预设颜色
  const COLORS = {
    primary: '#7C6FF0',
    teal: '#4ECDC4',
    orange: '#FFA07A',
    green: '#6BCB77',
    gold: '#FFD93D',
    pink: '#FD79A8',
    lavender: '#A29BFE',
    red: '#FF6B6B',
    blue: '#4ECDC4',
    gray: '#95A5A6',
  };

  // 标签颜色映射
  const TAG_COLOR_MAP = {
    '方法论': COLORS.primary,
    '哲学': COLORS.lavender,
    '技术': COLORS.teal,
    '社会': COLORS.orange,
    '艺术': COLORS.pink,
    '日常': COLORS.green,
    '归档': COLORS.gray,
    '产品': COLORS.gold,
    '设计': COLORS.pink,
    '学习': COLORS.blue,
    '思考': COLORS.lavender,
    '创作': COLORS.orange,
  };

  /**
   * 从笔记列表构建图谱数据
   * @param {Array} notes - 笔记列表
   * @param {Object} options - 配置选项
   * @returns {Object} { nodes, edges }
   */
  function buildGraphFromNotes(notes, options = {}) {
    const {
      includeTags = true,
      includeBacklinks = true,
      minConnections = 0,
      maxNodes = 200,
    } = options;

    const nodes = [];
    const edges = [];
    const nodeMap = new Map();
    const edgeSet = new Set();

    // 1. 添加笔记节点
    notes.slice(0, maxNodes).forEach((note, index) => {
      const node = {
        id: note.id,
        label: note.title || note.name || note.id,
        type: 'note',
        color: getNoteColor(note),
        radius: getNoteRadius(note, notes),
        data: note,
        // 初始位置（圆形布局）
        x: undefined,
        y: undefined,
      };
      nodes.push(node);
      nodeMap.set(note.id, node);
    });

    // 2. 添加标签节点
    if (includeTags) {
      const tagMap = new Map();
      notes.forEach(note => {
        const tags = extractTags(note);
        tags.forEach(tag => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, []);
          }
          tagMap.get(tag).push(note.id);
        });
      });

      tagMap.forEach((noteIds, tagName) => {
        const tagId = `tag:${tagName}`;
        const tagNode = {
          id: tagId,
          label: `#${tagName}`,
          type: 'tag',
          color: TAG_COLOR_MAP[tagName] || COLORS.gold,
          radius: 15 + Math.min(noteIds.length * 2, 15),
          data: { name: tagName, noteCount: noteIds.length },
        };
        nodes.push(tagNode);
        nodeMap.set(tagId, tagNode);

        // 标签和笔记之间的边
        noteIds.forEach(noteId => {
          addEdge(edges, edgeSet, tagId, noteId, 0.5);
        });
      });
    }

    // 3. 添加反向链接边
    if (includeBacklinks) {
      notes.forEach(note => {
        const links = extractLinks(note);
        links.forEach(link => {
          const targetId = resolveLinkTarget(link, notes);
          if (targetId && nodeMap.has(targetId)) {
            addEdge(edges, edgeSet, note.id, targetId, 1);
          }
        });
      });
    }

    // 4. 过滤孤立节点（可选）
    if (minConnections > 0) {
      const degreeMap = new Map();
      edges.forEach(edge => {
        degreeMap.set(edge.source, (degreeMap.get(edge.source) || 0) + 1);
        degreeMap.set(edge.target, (degreeMap.get(edge.target) || 0) + 1);
      });
      const filteredNodes = nodes.filter(n => (degreeMap.get(n.id) || 0) >= minConnections);
      const filteredEdges = edges.filter(e =>
        filteredNodes.some(n => n.id === e.source) &&
        filteredNodes.some(n => n.id === e.target)
      );
      return { nodes: filteredNodes, edges: filteredEdges };
    }

    return { nodes, edges };
  }

  /**
   * 从笔记提取标签
   */
  function extractTags(note) {
    const tags = [];
    // 从 tags 字段
    if (note.tags && Array.isArray(note.tags)) {
      tags.push(...note.tags);
    }
    // 从内容中提取 #标签
    if (note.content) {
      const tagRegex = /#([\u4e00-\u9fa5a-zA-Z0-9_-]+)/g;
      let match;
      while ((match = tagRegex.exec(note.content)) !== null) {
        tags.push(match[1]);
      }
    }
    return [...new Set(tags)];
  }

  /**
   * 从笔记提取链接
   */
  function extractLinks(note) {
    const links = [];
    if (!note.content) return links;

    // 双链 [[note]] 或 [[note|text]]
    const wikiLinkRegex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
    let match;
    while ((match = wikiLinkRegex.exec(note.content)) !== null) {
      links.push({ type: 'wiki', target: match[1].trim() });
    }

    // Markdown 链接 [text](url)
    const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    while ((match = mdLinkRegex.exec(note.content)) !== null) {
      if (!match[2].startsWith('http')) {
        links.push({ type: 'markdown', target: match[2].trim() });
      }
    }

    return links;
  }

  /**
   * 解析链接目标为笔记ID
   */
  function resolveLinkTarget(link, notes) {
    const target = link.target;
    // 直接是ID
    if (notes.some(n => n.id === target)) return target;
    // 匹配标题
    const note = notes.find(n =>
      (n.title || n.name || '').toLowerCase() === target.toLowerCase()
    );
    if (note) return note.id;
    // 模糊匹配
    const fuzzy = notes.find(n =>
      (n.title || n.name || '').toLowerCase().includes(target.toLowerCase())
    );
    return fuzzy ? fuzzy.id : null;
  }

  /**
   * 获取笔记颜色
   */
  function getNoteColor(note) {
    if (note.color) return note.color;
    const tags = extractTags(note);
    for (const tag of tags) {
      if (TAG_COLOR_MAP[tag]) return TAG_COLOR_MAP[tag];
    }
    // 根据ID哈希生成颜色
    const colors = Object.values(COLORS);
    let hash = 0;
    for (let i = 0; i < note.id.length; i++) {
      hash = note.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * 获取笔记半径（根据连接数和字数）
   */
  function getNoteRadius(note, allNotes) {
    const baseRadius = 18;
    const contentLength = note.content ? note.content.length : 0;
    const linksCount = extractLinks(note).length;
    const tagsCount = extractTags(note).length;
    const score = contentLength / 500 + linksCount * 2 + tagsCount;
    return baseRadius + Math.min(score, 15);
  }

  /**
   * 添加边（去重）
   */
  function addEdge(edges, edgeSet, source, target, weight = 1) {
    if (source === target) return;
    const key = [source, target].sort().join('-');
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push({ source, target, weight });
  }

  /**
   * 计算图谱统计
   */
  function getGraphStats(nodes, edges) {
    const degreeMap = new Map();
    nodes.forEach(n => degreeMap.set(n.id, 0));
    edges.forEach(e => {
      degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
      degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
    });

    const degrees = Array.from(degreeMap.values());
    const maxDegree = Math.max(...degrees, 0);
    const avgDegree = degrees.length > 0
      ? (degrees.reduce((a, b) => a + b, 0) / degrees.length).toFixed(2)
      : 0;

    // 连通分量
    const visited = new Set();
    let components = 0;
    const adjacency = new Map();
    nodes.forEach(n => adjacency.set(n.id, []));
    edges.forEach(e => {
      adjacency.get(e.source)?.push(e.target);
      adjacency.get(e.target)?.push(e.source);
    });

    nodes.forEach(n => {
      if (!visited.has(n.id)) {
        components++;
        const stack = [n.id];
        while (stack.length > 0) {
          const current = stack.pop();
          if (visited.has(current)) continue;
          visited.add(current);
          adjacency.get(current)?.forEach(neighbor => stack.push(neighbor));
        }
      }
    });

    // 节点类型统计
    const typeCount = {};
    nodes.forEach(n => {
      const type = n.type || 'note';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      maxDegree,
      avgDegree,
      components,
      density: nodes.length > 1
        ? ((2 * edges.length) / (nodes.length * (nodes.length - 1))).toFixed(4)
        : 0,
      typeCount,
      isolatedNodes: degrees.filter(d => d === 0).length,
    };
  }

  /**
   * 导出图谱为JSON
   */
  function exportGraphJSON(nodes, edges, stats) {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      nodes: nodes.map(n => ({
        id: n.id,
        label: n.label,
        type: n.type,
        color: n.color,
        radius: n.radius,
        x: n.x,
        y: n.y,
      })),
      edges: edges.map(e => ({
        source: e.source,
        target: e.target,
        weight: e.weight,
      })),
      stats,
    };
  }

  /**
   * 从JSON导入图谱
   */
  function importGraphJSON(json) {
    if (!json || !json.nodes || !json.edges) {
      throw new Error('Invalid graph JSON format');
    }
    return {
      nodes: json.nodes,
      edges: json.edges,
    };
  }

  // ============================================
  // 暴露 API
  // ============================================

  const GraphDataService = {
    buildGraphFromNotes,
    extractTags,
    extractLinks,
    getGraphStats,
    exportGraphJSON,
    importGraphJSON,
    COLORS,
    TAG_COLOR_MAP,
  };

  if (typeof window !== 'undefined') {
    window.GraphDataService = GraphDataService;
  }

  console.log('[GraphDataService] 知识图谱数据服务已加载');

})();
