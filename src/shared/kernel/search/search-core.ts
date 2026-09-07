/**
 * OneOS 搜索算法核心
 * 从search-algorithm-engine提取
 * 包含倒排索引、模糊匹配、搜索建议、结果排序
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

import {
  SearchableItem,
  SearchResult,
  SearchQuery,
  SearchSuggestion,
  SearchStats,
  InvertedIndexEntry,
  DocumentVector,
} from './search-types';
import {
  tokenize,
  calculateTermFrequency,
  calculateTFIDF,
  calculateBM25,
  stringSimilarity,
  ngramSimilarity,
  cosineSimilarity,
  highlightMatches,
  extractMatchSnippet,
} from './search-utils';

/**
 * 倒排索引
 */
export class InvertedIndex {
  private index: Map<string, InvertedIndexEntry> = new Map();
  private documents: Map<string, SearchableItem> = new Map();
  private documentVectors: Map<string, DocumentVector> = new Map();
  private totalDocuments: number = 0;
  private averageDocumentLength: number = 0;

  /**
   * 构建索引
   */
  build(items: SearchableItem[]): void {
    this.index.clear();
    this.documents.clear();
    this.documentVectors.clear();
    this.totalDocuments = items.length;

    let totalLength = 0;

    for (const item of items) {
      this.documents.set(item.id, item);

      // 合并标题和内容进行分词
      const fullText = `${item.title} ${item.content} ${item.tags.join(' ')}`;
      const tokens = tokenize(fullText);
      const tf = calculateTermFrequency(tokens);

      totalLength += tokens.length;

      // 构建文档向量
      const vector = new Map<string, number>();
      for (const [term, freq] of tf) {
        vector.set(term, freq);
      }
      this.documentVectors.set(item.id, {
        docId: item.id,
        vector,
        length: tokens.length,
      });

      // 更新倒排索引
      let position = 0;
      for (const token of tokens) {
        if (!this.index.has(token)) {
          this.index.set(token, {
            term: token,
            documentFrequency: 0,
            postings: [],
          });
        }

        const entry = this.index.get(token)!;
        const existingPosting = entry.postings.find((p) => p.docId === item.id);

        if (existingPosting) {
          existingPosting.termFrequency++;
          existingPosting.positions.push(position);
        } else {
          entry.postings.push({
            docId: item.id,
            termFrequency: 1,
            positions: [position],
            field: this.getField(token, item),
          });
          entry.documentFrequency++;
        }

        position++;
      }
    }

    this.averageDocumentLength = this.totalDocuments > 0 ? totalLength / this.totalDocuments : 0;
  }

  /**
   * 获取token所在字段
   */
  private getField(token: string, item: SearchableItem): string {
    if (item.title.toLowerCase().includes(token)) return 'title';
    if (item.tags.some((tag) => tag.toLowerCase().includes(token))) return 'tags';
    return 'content';
  }

  /**
   * 搜索
   */
  search(query: SearchQuery): SearchResult[] {
    const queryTokens = tokenize(query.text);
    if (queryTokens.length === 0) return [];

    const results: Map<string, SearchResult> = new Map();
    const fuzzyEnabled = query.options?.fuzzy ?? true;
    const fuzzyThreshold = query.options?.fuzzyThreshold ?? 0.6;

    for (const queryToken of queryTokens) {
      // 精确匹配
      const exactEntry = this.index.get(queryToken);
      if (exactEntry) {
        this.addResultsFromEntry(exactEntry, queryToken, results, 1.0);
      }

      // 模糊匹配
      if (fuzzyEnabled) {
        for (const [term, entry] of this.index) {
          if (term === queryToken) continue;
          const similarity = Math.max(
            stringSimilarity(queryToken, term),
            ngramSimilarity(queryToken, term)
          );
          if (similarity >= fuzzyThreshold) {
            this.addResultsFromEntry(entry, queryToken, results, similarity * 0.5);
          }
        }
      }
    }

    // 应用过滤器
    let filteredResults = Array.from(results.values());
    if (query.filters) {
      filteredResults = filteredResults.filter((result) => {
        if (query.filters?.types && !query.filters.types.includes(result.item.type)) return false;
        if (query.filters?.tags && !result.item.tags.some((tag) => query.filters!.tags!.includes(tag))) return false;
        if (query.filters?.dateFrom && result.item.createdAt < query.filters.dateFrom) return false;
        if (query.filters?.dateTo && result.item.createdAt > query.filters.dateTo) return false;
        return true;
      });
    }

    // 排序
    const sortBy = query.options?.sortBy || 'relevance';
    const sortOrder = query.options?.sortOrder || 'desc';

    filteredResults.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'relevance':
          comparison = a.score - b.score;
          break;
        case 'date':
          comparison = a.item.updatedAt - b.item.updatedAt;
          break;
        case 'title':
          comparison = a.item.title.localeCompare(b.item.title);
          break;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // 分页
    const limit = query.options?.limit || 20;
    const offset = query.options?.offset || 0;
    return filteredResults.slice(offset, offset + limit);
  }

  /**
   * 从索引条目添加结果
   */
  private addResultsFromEntry(
    entry: InvertedIndexEntry,
    queryToken: string,
    results: Map<string, SearchResult>,
    weight: number
  ): void {
    for (const posting of entry.postings) {
      const item = this.documents.get(posting.docId);
      if (!item) continue;

      const docVector = this.documentVectors.get(posting.docId);
      const docLength = docVector?.length || 1;

      // 计算BM25分数
      const bm25Score = calculateBM25(
        posting.termFrequency,
        entry.documentFrequency,
        this.totalDocuments,
        docLength,
        this.averageDocumentLength
      );

      const totalScore = bm25Score * weight;

      if (results.has(posting.docId)) {
        const existing = results.get(posting.docId)!;
        existing.score += totalScore;
        if (!existing.matchedFields.includes(posting.field)) {
          existing.matchedFields.push(posting.field);
        }
      } else {
        results.set(posting.docId, {
          item,
          score: totalScore,
          matchedFields: [posting.field],
          highlightedTitle: highlightMatches(item.title, queryToken),
          highlightedContent: highlightMatches(extractMatchSnippet(item.content, queryToken), queryToken),
          matchPositions: posting.positions.map((pos) => ({
            field: posting.field,
            start: pos,
            end: pos + queryToken.length,
          })),
          explanation: `匹配"${queryToken}"，BM25分数: ${bm25Score.toFixed(4)}`,
        });
      }
    }
  }

  /**
   * 搜索建议
   */
  getSuggestions(
    query: string,
    history: string[] = [],
    popularQueries: string[] = [],
    limit: number = 10
  ): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) return [];

    // 1. 历史查询匹配
    for (const hist of history) {
      if (hist.toLowerCase().startsWith(lowerQuery)) {
        suggestions.push({
          text: hist,
          type: 'history',
          score: 0.9,
        });
      }
    }

    // 2. 热门查询匹配
    for (const popular of popularQueries) {
      if (popular.toLowerCase().startsWith(lowerQuery)) {
        suggestions.push({
          text: popular,
          type: 'popular',
          score: 0.8,
        });
      }
    }

    // 3. 索引词补全
    for (const [term] of this.index) {
      if (term.startsWith(lowerQuery) && term.length > lowerQuery.length) {
        suggestions.push({
          text: term,
          type: 'completion',
          score: 0.7,
        });
      }
    }

    // 4. 拼写纠正（模糊匹配）
    for (const [term] of this.index) {
      const similarity = stringSimilarity(lowerQuery, term);
      if (similarity >= 0.7 && similarity < 1.0) {
        suggestions.push({
          text: term,
          type: 'correction',
          score: similarity * 0.5,
        });
      }
    }

    // 去重并排序
    const uniqueSuggestions = new Map<string, SearchSuggestion>();
    for (const suggestion of suggestions) {
      if (!uniqueSuggestions.has(suggestion.text)) {
        uniqueSuggestions.set(suggestion.text, suggestion);
      }
    }

    return Array.from(uniqueSuggestions.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 获取统计信息
   */
  getStats(): SearchStats {
    return {
      totalItems: this.documents.size,
      indexedItems: this.documentVectors.size,
      totalTerms: this.index.size,
      averageDocLength: this.averageDocumentLength,
      queryCount: 0,
      avgQueryTime: 0,
    };
  }

  /**
   * 语义搜索（基于向量相似度的简化版）
   */
  semanticSearch(query: string, limit: number = 10): SearchResult[] {
    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const queryVector = calculateTermFrequency(queryTokens);
    const results: Array<{ item: SearchableItem; similarity: number }> = [];

    for (const [docId, docVector] of this.documentVectors) {
      const item = this.documents.get(docId);
      if (!item) continue;

      const similarity = cosineSimilarity(queryVector, docVector.vector);
      if (similarity > 0) {
        results.push({ item, similarity });
      }
    }

    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map((r) => ({
        item: r.item,
        score: r.similarity,
        matchedFields: ['content'],
        highlightedTitle: highlightMatches(r.item.title, query),
        highlightedContent: highlightMatches(extractMatchSnippet(r.item.content, query), query),
        matchPositions: [],
        explanation: `语义相似度: ${(r.similarity * 100).toFixed(2)}%`,
      }));
  }
}
