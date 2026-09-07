// ============================================
// OneOS V2 - 全局搜索服务
// 倒排索引 + 关键词搜索 + 模糊匹配 + 语义排序
// ============================================

(function() {
  'use strict';

  // ============================================
  // 中文分词器（2-gram + 英文单词）
  // ============================================
  function tokenize(text) {
    if (!text) return [];
    const tokens = [];
    // 英文单词
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    englishWords.forEach(word => tokens.push(word.toLowerCase()));
    // 中文2-gram
    const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || [];
    for (let i = 0; i < chineseChars.length - 1; i++) {
      tokens.push(chineseChars[i] + chineseChars[i + 1]);
    }
    // 单字（用于短文本）
    if (chineseChars.length === 1) {
      tokens.push(chineseChars[0]);
    }
    // 数字
    const numbers = text.match(/\d+/g) || [];
    numbers.forEach(num => tokens.push(num));
    return [...new Set(tokens)];
  }

  // ============================================
  // 倒排索引
  // ============================================
  class InvertedIndex {
    constructor() {
      this.index = new Map(); // token -> Set(docId)
      this.docFreq = new Map(); // token -> 文档频率
      this.docCount = 0;
      this.docLengths = new Map(); // docId -> 文档长度
    }

    addDocument(docId, text) {
      const tokens = tokenize(text);
      const tokenSet = new Set(tokens);
      this.docLengths.set(docId, tokens.length);
      tokenSet.forEach(token => {
        if (!this.index.has(token)) {
          this.index.set(token, new Set());
        }
        this.index.get(token).add(docId);
        this.docFreq.set(token, (this.docFreq.get(token) || 0) + 1);
      });
      this.docCount++;
    }

    removeDocument(docId) {
      this.index.forEach((docSet, token) => {
        if (docSet.has(docId)) {
          docSet.delete(docId);
          this.docFreq.set(token, (this.docFreq.get(token) || 1) - 1);
          if (docSet.size === 0) {
            this.index.delete(token);
            this.docFreq.delete(token);
          }
        }
      });
      this.docLengths.delete(docId);
      this.docCount = Math.max(0, this.docCount - 1);
    }

    updateDocument(docId, text) {
      this.removeDocument(docId);
      this.addDocument(docId, text);
    }

    search(token) {
      return this.index.get(token) || new Set();
    }

    getTF(token, docId) {
      // 简化版：词频 = 1（因为我们用Set去重了）
      return this.index.get(token)?.has(docId) ? 1 : 0;
    }

    getIDF(token) {
      const df = this.docFreq.get(token) || 0;
      if (df === 0) return 0;
      return Math.log((this.docCount + 1) / (df + 1)) + 1;
    }

    getTFIDF(token, docId) {
      return this.getTF(token, docId) * this.getIDF(token);
    }

    clear() {
      this.index.clear();
      this.docFreq.clear();
      this.docLengths.clear();
      this.docCount = 0;
    }

    size() {
      return this.index.size;
    }
  }

  // ============================================
  // 模糊匹配（编辑距离）
  // ============================================
  function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function fuzzyMatch(query, text, threshold = 0.7) {
    if (!query || !text) return 0;
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    // 完全包含
    if (t.includes(q)) return 1;
    // 编辑距离相似度
    const distance = levenshteinDistance(q, t);
    const maxLen = Math.max(q.length, t.length);
    const similarity = 1 - distance / maxLen;
    return similarity >= threshold ? similarity : 0;
  }

  // ============================================
  // 搜索结果高亮
  // ============================================
  function highlightText(text, query, maxLength = 200) {
    if (!text || !query) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    if (index === -1) {
      // 模糊匹配：找最接近的位置
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }
    // 计算上下文窗口
    const halfWindow = Math.floor((maxLength - query.length) / 2);
    let start = Math.max(0, index - halfWindow);
    let end = Math.min(text.length, index + query.length + halfWindow);
    let prefix = start > 0 ? '...' : '';
    let suffix = end < text.length ? '...' : '';
    const snippet = text.slice(start, end);
    // 高亮匹配部分
    const highlightIndex = index - start;
    return (
      prefix +
      snippet.slice(0, highlightIndex) +
      `<mark style="background:#FFD93D;padding:0 2px;border-radius:2px">${snippet.slice(highlightIndex, highlightIndex + query.length)}</mark>` +
      snippet.slice(highlightIndex + query.length) +
      suffix
    );
  }

  // ============================================
  // 全局搜索服务
  // ============================================
  class SearchService {
    constructor() {
      this.titleIndex = new InvertedIndex();
      this.contentIndex = new InvertedIndex();
      this.tagIndex = new InvertedIndex();
      this.documents = new Map(); // docId -> document
      this.isIndexed = false;
      this.searchHistory = [];
      this.maxHistory = 20;
    }

    // 构建索引
    buildIndex(documents) {
      this.titleIndex.clear();
      this.contentIndex.clear();
      this.tagIndex.clear();
      this.documents.clear();

      documents.forEach(doc => {
        this.documents.set(doc.id, doc);
        // 标题索引（权重高）
        this.titleIndex.addDocument(doc.id, doc.title || doc.name || '');
        // 内容索引
        this.contentIndex.addDocument(doc.id, doc.content || '');
        // 标签索引
        const tags = (doc.tags || []).join(' ');
        this.tagIndex.addDocument(doc.id, tags);
      });

      this.isIndexed = true;
      console.log(`[SearchService] 索引构建完成: ${documents.length} 篇文档, ${this.titleIndex.size() + this.contentIndex.size() + this.tagIndex.size()} 个词条`);
    }

    // 添加文档
    addDocument(doc) {
      this.documents.set(doc.id, doc);
      this.titleIndex.addDocument(doc.id, doc.title || doc.name || '');
      this.contentIndex.addDocument(doc.id, doc.content || '');
      this.tagIndex.addDocument(doc.id, (doc.tags || []).join(' '));
    }

    // 更新文档
    updateDocument(doc) {
      this.addDocument(doc);
    }

    // 删除文档
    removeDocument(docId) {
      this.documents.delete(docId);
      this.titleIndex.removeDocument(docId);
      this.contentIndex.removeDocument(docId);
      this.tagIndex.removeDocument(docId);
    }

    // 搜索
    search(query, options = {}) {
      const {
        limit = 20,
        offset = 0,
        searchTitle = true,
        searchContent = true,
        searchTags = true,
        fuzzy = true,
        fuzzyThreshold = 0.6,
      } = options;

      if (!query || !query.trim()) return [];

      const queryTokens = tokenize(query);
      const scores = new Map(); // docId -> score
      const matchedFields = new Map(); // docId -> matched fields

      // 标题搜索（权重3）
      if (searchTitle) {
        queryTokens.forEach(token => {
          this.titleIndex.search(token).forEach(docId => {
            const score = this.titleIndex.getTFIDF(token, docId) * 3;
            scores.set(docId, (scores.get(docId) || 0) + score);
            if (!matchedFields.has(docId)) matchedFields.set(docId, new Set());
            matchedFields.get(docId).add('title');
          });
        });
      }

      // 内容搜索（权重1）
      if (searchContent) {
        queryTokens.forEach(token => {
          this.contentIndex.search(token).forEach(docId => {
            const score = this.contentIndex.getTFIDF(token, docId) * 1;
            scores.set(docId, (scores.get(docId) || 0) + score);
            if (!matchedFields.has(docId)) matchedFields.set(docId, new Set());
            matchedFields.get(docId).add('content');
          });
        });
      }

      // 标签搜索（权重2）
      if (searchTags) {
        queryTokens.forEach(token => {
          this.tagIndex.search(token).forEach(docId => {
            const score = this.tagIndex.getTFIDF(token, docId) * 2;
            scores.set(docId, (scores.get(docId) || 0) + score);
            if (!matchedFields.has(docId)) matchedFields.set(docId, new Set());
            matchedFields.get(docId).add('tags');
          });
        });
      }

      // 模糊匹配（补充）
      if (fuzzy && scores.size === 0) {
        this.documents.forEach((doc, docId) => {
          let maxSim = 0;
          let matchedField = null;
          if (searchTitle) {
            const sim = fuzzyMatch(query, doc.title || '', fuzzyThreshold);
            if (sim > maxSim) { maxSim = sim; matchedField = 'title'; }
          }
          if (searchContent) {
            const sim = fuzzyMatch(query, doc.content || '', fuzzyThreshold);
            if (sim > maxSim) { maxSim = sim; matchedField = 'content'; }
          }
          if (maxSim > 0) {
            scores.set(docId, maxSim * 0.5);
            if (!matchedFields.has(docId)) matchedFields.set(docId, new Set());
            matchedFields.get(docId).add(matchedField);
          }
        });
      }

      // 排序并返回结果
      const results = Array.from(scores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(offset, offset + limit)
        .map(([docId, score]) => {
          const doc = this.documents.get(docId);
          return {
            id: docId,
            document: doc,
            score: Math.round(score * 1000) / 1000,
            matchedFields: Array.from(matchedFields.get(docId) || []),
            titleHighlight: highlightText(doc.title || '', query),
            contentSnippet: highlightText(doc.content || '', query, 150),
          };
        });

      // 记录搜索历史
      this.addToHistory(query);

      return results;
    }

    // 搜索建议（自动补全）
    suggest(query, limit = 5) {
      if (!query || query.length < 1) return [];
      const suggestions = new Set();
      // 从标题中提取建议
      this.documents.forEach(doc => {
        const title = doc.title || '';
        if (title.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(title);
        }
      });
      // 从搜索历史中提取
      this.searchHistory.forEach(h => {
        if (h.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(h);
        }
      });
      return Array.from(suggestions).slice(0, limit);
    }

    // 搜索历史
    addToHistory(query) {
      if (!query || !query.trim()) return;
      this.searchHistory = this.searchHistory.filter(h => h !== query);
      this.searchHistory.unshift(query);
      if (this.searchHistory.length > this.maxHistory) {
        this.searchHistory = this.searchHistory.slice(0, this.maxHistory);
      }
      // 持久化
      try {
        localStorage.setItem('oneos_search_history', JSON.stringify(this.searchHistory));
      } catch (e) {}
    }

    loadHistory() {
      try {
        const saved = localStorage.getItem('oneos_search_history');
        if (saved) this.searchHistory = JSON.parse(saved);
      } catch (e) {}
    }

    clearHistory() {
      this.searchHistory = [];
      try {
        localStorage.removeItem('oneos_search_history');
      } catch (e) {}
    }

    // 获取统计
    getStats() {
      return {
        documentCount: this.documents.size,
        titleTokens: this.titleIndex.size(),
        contentTokens: this.contentIndex.size(),
        tagTokens: this.tagIndex.size(),
        totalTokens: this.titleIndex.size() + this.contentIndex.size() + this.tagIndex.size(),
        isIndexed: this.isIndexed,
      };
    }

    destroy() {
      this.titleIndex.clear();
      this.contentIndex.clear();
      this.tagIndex.clear();
      this.documents.clear();
      this.searchHistory = [];
    }
  }

  // ============================================
  // 暴露 API
  // ============================================
  const Search = {
    SearchService,
    InvertedIndex,
    tokenize,
    levenshteinDistance,
    fuzzyMatch,
    highlightText,
  };

  if (typeof window !== 'undefined') {
    window.Search = Search;
    window.SearchService = new SearchService();
    window.SearchService.loadHistory();
  }

  console.log('[Search] 全局搜索服务已加载');

})();
