// ============================================
// OneOS V2 - RAG 知识库检索模块
// 检索增强生成：从用户笔记中检索相关内容，作为AI对话上下文
// ============================================

(function() {
  'use strict';

  // ============================================
  // 配置
  // ============================================
  const CONFIG = {
    maxResults: 5,           // 最大检索结果数
    minScore: 0.1,           // 最小相关度阈值
    contextMaxChars: 3000,   // 上下文最大字符数
    useSemanticSearch: true,  // 是否启用语义检索（需要Ollama）
    indexRefreshInterval: 30000, // 索引刷新间隔（毫秒）
  };

  // ============================================
  // 状态
  // ============================================
  let notesIndex = [];        // 笔记索引数组
  let invertedIndex = {};     // 倒排索引：词 -> [{noteId, score}]
  let lastIndexTime = 0;      // 上次索引时间
  let isIndexing = false;     // 是否正在索引
  let ragEnabled = true;      // RAG是否启用

  // ============================================
  // 中文分词（简易版）
  // ============================================

  // 停用词
  const STOP_WORDS = new Set([
    '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个',
    '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好',
    '自己', '这', '那', '他', '她', '它', '们', '这个', '那个', '什么', '怎么',
    '为什么', '可以', '因为', '所以', '但是', '如果', '虽然', '而且', '或者',
    '与', '及', '或', '等', '之', '其', '此', '该', '本', '每', '各',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as',
    'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'both', 'each', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 'just', 'also', 'now', 'well', 'back', 'even',
    'still', 'way', 'take', 'since', 'while', 'because', 'but', 'and',
  ]);

  /**
   * 简易中文分词
   * 策略：英文按空格和标点分词，中文按2-gram分词
   */
  function tokenize(text) {
    if (!text) return [];

    const tokens = [];
    // 转为小写
    const lowerText = text.toLowerCase();

    // 提取英文单词
    const englishWords = lowerText.match(/[a-z][a-z0-9_-]*/g) || [];
    englishWords.forEach(word => {
      if (word.length > 1 && !STOP_WORDS.has(word)) {
        tokens.push(word);
      }
    });

    // 提取中文2-gram
    const chineseChars = lowerText.match(/[\u4e00-\u9fa5]/g) || [];
    for (let i = 0; i < chineseChars.length - 1; i++) {
      const bigram = chineseChars[i] + chineseChars[i + 1];
      if (!STOP_WORDS.has(bigram)) {
        tokens.push(bigram);
      }
    }

    // 提取数字
    const numbers = lowerText.match(/\d+(\.\d+)?/g) || [];
    numbers.forEach(num => {
      if (num.length > 1) tokens.push(num);
    });

    return tokens;
  }

  // ============================================
  // 索引构建
  // ============================================

  /**
   * 从IndexedDB加载所有笔记并构建索引
   */
  async function buildIndex() {
    if (isIndexing) {
      console.log('[RAG] 正在索引中，跳过');
      return;
    }

    isIndexing = true;
    const startTime = Date.now();

    try {
      // 从数据层获取所有笔记
      let notes = [];
      if (window.NotesDB) {
        notes = await window.NotesDB.getAllNotes();
      } else if (window.DataAdapter && window.DataAdapter.getAllNotes) {
        notes = window.DataAdapter.getAllNotes();
      } else if (window.KNOWLEDGE_BASE && window.KNOWLEDGE_BASE.notes) {
        notes = Object.values(window.KNOWLEDGE_BASE.notes);
      }

      // 过滤已归档和空内容笔记
      notes = notes.filter(n => !n.archived && n.content && n.content.trim().length > 0);

      // 构建笔记索引
      notesIndex = notes.map(note => ({
        id: note.id,
        title: note.title || '',
        content: note.content || '',
        folder: note.folder || '',
        tags: note.tags || [],
        wordCount: note.wordCount || 0,
        updatedAt: note.updatedAt || note.createdAt || '',
        tokens: tokenize(`${note.title || ''} ${note.content || ''}`),
      }));

      // 构建倒排索引
      invertedIndex = {};
      const docFreq = {}; // 文档频率

      notesIndex.forEach(note => {
        const termFreq = {};
        note.tokens.forEach(token => {
          termFreq[token] = (termFreq[token] || 0) + 1;
        });

        Object.entries(termFreq).forEach(([term, freq]) => {
          if (!invertedIndex[term]) invertedIndex[term] = [];
          invertedIndex[term].push({
            noteId: note.id,
            tf: freq,
            score: 0, // 稍后计算TF-IDF
          });
          docFreq[term] = (docFreq[term] || 0) + 1;
        });
      });

      // 计算TF-IDF分数
      const totalDocs = notesIndex.length;
      Object.entries(invertedIndex).forEach(([term, postings]) => {
        const idf = Math.log((totalDocs + 1) / (docFreq[term] + 1)) + 1;
        postings.forEach(posting => {
          posting.score = posting.tf * idf;
        });
      });

      lastIndexTime = Date.now();
      const duration = lastIndexTime - startTime;
      console.log(`[RAG] 索引构建完成: ${notesIndex.length}篇笔记, ${Object.keys(invertedIndex).length}个词, 耗时${duration}ms`);

    } catch (err) {
      console.error('[RAG] 索引构建失败:', err);
    } finally {
      isIndexing = false;
    }
  }

  /**
   * 检查是否需要刷新索引
   */
  async function ensureIndex() {
    const now = Date.now();
    if (notesIndex.length === 0 || now - lastIndexTime > CONFIG.indexRefreshInterval) {
      await buildIndex();
    }
  }

  // ============================================
  // 关键词检索（TF-IDF）
  // ============================================

  /**
   * 关键词检索
   * @param {string} query - 查询文本
   * @param {number} limit - 结果数量
   * @returns {Array} 检索结果
   */
  function keywordSearch(query, limit = CONFIG.maxResults) {
    if (!query || !query.trim() || notesIndex.length === 0) return [];

    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const noteScores = {};

    queryTokens.forEach(token => {
      const postings = invertedIndex[token];
      if (!postings) return;

      postings.forEach(posting => {
        if (!noteScores[posting.noteId]) {
          noteScores[posting.noteId] = {
            noteId: posting.noteId,
            score: 0,
            matchedTerms: [],
          };
        }
        noteScores[posting.noteId].score += posting.score;
        noteScores[posting.noteId].matchedTerms.push(token);
      });
    });

    // 标题匹配加权
    const queryLower = query.toLowerCase();
    notesIndex.forEach(note => {
      if (note.title.toLowerCase().includes(queryLower)) {
        if (noteScores[note.id]) {
          noteScores[note.id].score *= 1.5; // 标题匹配加50%权重
        }
      }
    });

    // 排序并返回
    const results = Object.values(noteScores)
      .filter(r => r.score >= CONFIG.minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => {
        const note = notesIndex.find(n => n.id === r.noteId);
        return {
          ...note,
          score: r.score,
          matchedTerms: [...new Set(r.matchedTerms)],
          searchType: 'keyword',
        };
      });

    return results;
  }

  // ============================================
  // 语义检索（基于嵌入向量，需要Ollama）
  // ============================================

  /**
   * 语义检索
   * @param {string} query - 查询文本
   * @param {number} limit - 结果数量
   * @returns {Array} 检索结果
   */
  async function semanticSearch(query, limit = CONFIG.maxResults) {
    if (!query || !query.trim() || notesIndex.length === 0) return [];
    if (!window.OllamaService) return [];

    try {
      // 生成查询向量
      const queryEmbedding = await window.OllamaService.generateEmbedding(query);
      if (!queryEmbedding || !queryEmbedding.embedding) return [];

      // 为每篇笔记生成向量并计算相似度
      // 注意：为了性能，这里只对标题+前500字生成向量
      const results = [];
      for (const note of notesIndex) {
        const noteText = `${note.title} ${note.content.slice(0, 500)}`;
        try {
          const noteEmbedding = await window.OllamaService.generateEmbedding(noteText);
          if (noteEmbedding && noteEmbedding.embedding) {
            const similarity = cosineSimilarity(queryEmbedding.embedding, noteEmbedding.embedding);
            results.push({
              ...note,
              score: similarity,
              matchedTerms: [],
              searchType: 'semantic',
            });
          }
        } catch (e) {
          // 单篇笔记向量生成失败，跳过
          continue;
        }
      }

      return results
        .filter(r => r.score >= 0.3) // 语义相似度阈值
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

    } catch (err) {
      console.error('[RAG] 语义检索失败:', err);
      return [];
    }
  }

  /**
   * 余弦相似度
   */
  function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // ============================================
  // 混合检索（关键词 + 语义）
  // ============================================

  /**
   * 混合检索
   * @param {string} query - 查询文本
   * @param {number} limit - 结果数量
   * @returns {Array} 检索结果
   */
  async function hybridSearch(query, limit = CONFIG.maxResults) {
    if (!ragEnabled) return [];

    await ensureIndex();

    // 关键词检索
    const keywordResults = keywordSearch(query, limit);

    // 语义检索（如果启用且Ollama可用）
    let semanticResults = [];
    if (CONFIG.useSemanticSearch && window.OllamaService) {
      try {
        semanticResults = await semanticSearch(query, limit);
      } catch (e) {
        console.warn('[RAG] 语义检索失败，使用关键词检索结果');
      }
    }

    // 合并结果（RRF - Reciprocal Rank Fusion）
    const merged = {};

    keywordResults.forEach((r, idx) => {
      if (!merged[r.id]) merged[r.id] = { ...r, rrfScore: 0, sources: [] };
      merged[r.id].rrfScore += 1 / (60 + idx + 1);
      merged[r.id].sources.push('keyword');
    });

    semanticResults.forEach((r, idx) => {
      if (!merged[r.id]) merged[r.id] = { ...r, rrfScore: 0, sources: [] };
      merged[r.id].rrfScore += 1 / (60 + idx + 1);
      merged[r.id].sources.push('semantic');
    });

    return Object.values(merged)
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .slice(0, limit);
  }

  // ============================================
  // 上下文构建
  // ============================================

  /**
   * 构建RAG上下文（用于AI对话）
   * @param {string} query - 用户查询
   * @param {number} limit - 检索结果数量
   * @returns {object} { context: string, sources: Array }
   */
  async function buildContext(query, limit = CONFIG.maxResults) {
    const results = await hybridSearch(query, limit);

    if (results.length === 0) {
      return { context: '', sources: [] };
    }

    // 构建上下文字符串
    let context = '\n\n=== 参考资料（来自你的知识库）===\n';
    const sources = [];
    let charCount = 0;

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      // 截取相关片段（前后各100字）
      const snippet = extractRelevantSnippet(result.content, query, 200);

      const entry = `\n[${i + 1}] 《${result.title}》\n${snippet}\n`;

      if (charCount + entry.length > CONFIG.contextMaxChars) break;

      context += entry;
      charCount += entry.length;
      sources.push({
        id: result.id,
        title: result.title,
        snippet: snippet,
        score: result.score || result.rrfScore,
        searchType: result.searchType || (result.sources ? result.sources.join('+') : 'unknown'),
      });
    }

    context += '\n=== 参考资料结束 ===\n';
    context += '请基于以上参考资料回答用户问题。如果参考资料中没有相关内容，请基于你的知识回答，并说明这不是来自用户知识库的内容。引用资料时请标注[编号]。\n\n';

    return { context, sources };
  }

  /**
   * 提取相关片段
   */
  function extractRelevantSnippet(content, query, maxLength = 200) {
    if (!content) return '';

    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();

    // 找到第一个匹配位置
    let matchIndex = -1;
    const queryTokens = tokenize(query);
    for (const token of queryTokens) {
      const idx = contentLower.indexOf(token);
      if (idx !== -1) {
        matchIndex = idx;
        break;
      }
    }

    if (matchIndex === -1) {
      // 没有匹配，返回前maxLength字
      return content.slice(0, maxLength) + (content.length > maxLength ? '...' : '');
    }

    // 围绕匹配位置截取
    const start = Math.max(0, matchIndex - Math.floor(maxLength / 3));
    const end = Math.min(content.length, start + maxLength);
    const snippet = content.slice(start, end);

    return (start > 0 ? '...' : '') + snippet + (end < content.length ? '...' : '');
  }

  // ============================================
  // 引用来源格式化
  // ============================================

  /**
   * 格式化引用来源（用于UI显示）
   * @param {Array} sources
   * @returns {string} HTML字符串
   */
  function formatSources(sources) {
    if (!sources || sources.length === 0) return '';

    let html = '\n\n---\n\n**参考来源：**\n';
    sources.forEach((source, idx) => {
      const scorePercent = Math.round((source.score || 0) * 100);
      html += `[${idx + 1}] 《${source.title}》 相关度: ${scorePercent}%\n`;
    });

    return html;
  }

  // ============================================
  // 状态管理
  // ============================================

  function enableRAG() {
    ragEnabled = true;
    console.log('[RAG] 已启用');
  }

  function disableRAG() {
    ragEnabled = false;
    console.log('[RAG] 已禁用');
  }

  function isRAGEnabled() {
    return ragEnabled;
  }

  function getIndexStats() {
    return {
      noteCount: notesIndex.length,
      termCount: Object.keys(invertedIndex).length,
      lastIndexTime: lastIndexTime ? new Date(lastIndexTime).toLocaleString() : '从未索引',
      isIndexing: isIndexing,
      ragEnabled: ragEnabled,
      config: { ...CONFIG },
    };
  }

  function refreshIndex() {
    lastIndexTime = 0; // 强制刷新
    return buildIndex();
  }

  // ============================================
  // 暴露 API
  // ============================================

  const RAGService = {
    // 配置
    CONFIG,

    // 索引
    buildIndex,
    ensureIndex,
    refreshIndex,
    getIndexStats,

    // 检索
    keywordSearch,
    semanticSearch,
    hybridSearch,

    // 上下文
    buildContext,
    extractRelevantSnippet,

    // 工具
    tokenize,
    cosineSimilarity,
    formatSources,

    // 状态
    enableRAG,
    disableRAG,
    isRAGEnabled,
  };

  if (typeof window !== 'undefined') {
    window.RAGService = RAGService;
  }

  console.log('[RAGService] RAG知识库检索模块已加载');

})();
