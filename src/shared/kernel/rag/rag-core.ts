/**
 * OneOS RAG核心算法
 * 从rag-service提取
 * 包含文档分块、向量化、语义检索、重排序、查询扩展
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

import {
  RAGDocument,
  RAGChunk,
  RAGSearchResult,
  RAGConfig,
  DEFAULT_RAG_CONFIG,
  generateRAGId,
  countTokens,
} from './rag-types';

/**
 * 文档分块器
 */
export class DocumentChunker {
  private config: RAGConfig;

  constructor(config?: Partial<RAGConfig>) {
    this.config = { ...DEFAULT_RAG_CONFIG, ...config };
  }

  /**
   * 将文档分块
   */
  chunkDocument(document: RAGDocument): RAGChunk[] {
    const chunks: RAGChunk[] = [];
    const content = document.content;
    const chunkSize = this.config.chunkSize;
    const overlap = this.config.chunkOverlap;

    if (content.length <= chunkSize) {
      chunks.push(this.createChunk(document, content, 0, content.length));
      return chunks;
    }

    let startIndex = 0;
    while (startIndex < content.length) {
      const endIndex = Math.min(startIndex + chunkSize, content.length);
      const chunkContent = content.substring(startIndex, endIndex);

      // 尝试在句子边界处分割
      const adjustedEnd = this.findSentenceBoundary(chunkContent, endIndex - startIndex);
      const finalEnd = startIndex + adjustedEnd;

      chunks.push(this.createChunk(document, content.substring(startIndex, finalEnd), startIndex, finalEnd));

      startIndex = finalEnd - overlap;
      if (startIndex >= content.length) break;
    }

    return chunks;
  }

  /**
   * 查找句子边界
   */
  private findSentenceBoundary(text: string, maxLength: number): number {
    const sentenceEndings = ['。', '！', '？', '.', '!', '?', '\n', '；', ';'];
    let bestEnd = maxLength;

    for (let i = maxLength - 1; i >= Math.max(0, maxLength - 100); i--) {
      if (sentenceEndings.includes(text[i])) {
        bestEnd = i + 1;
        break;
      }
    }

    return bestEnd;
  }

  /**
   * 创建分块
   */
  private createChunk(
    document: RAGDocument,
    content: string,
    startIndex: number,
    endIndex: number
  ): RAGChunk {
    const keywords = this.extractKeywords(content);
    return {
      id: generateRAGId(),
      documentId: document.id,
      content,
      startIndex,
      endIndex,
      tokenCount: countTokens(content),
      vector: [], // 稍后由向量化器填充
      keywords,
    };
  }

  /**
   * 提取关键词
   */
  private extractKeywords(text: string): string[] {
    // 简化版关键词提取：按词频排序
    const words = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || [];
    const wordFreq = new Map<string, number>();

    for (const word of words) {
      const lower = word.toLowerCase();
      wordFreq.set(lower, (wordFreq.get(lower) || 0) + 1);
    }

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }
}

/**
 * 向量化器（简化版TF-IDF）
 */
export class Vectorizer {
  private vocabulary: Map<string, number> = new Map();
  private documentFrequency: Map<string, number> = new Map();
  private totalDocuments: number = 0;

  /**
   * 构建词汇表
   */
  fit(documents: RAGDocument[]): void {
    this.vocabulary.clear();
    this.documentFrequency.clear();
    this.totalDocuments = documents.length;

    let vocabIndex = 0;
    for (const doc of documents) {
      const words = this.tokenize(doc.content);
      const uniqueWords = new Set(words);

      for (const word of uniqueWords) {
        if (!this.vocabulary.has(word)) {
          this.vocabulary.set(word, vocabIndex++);
        }
        this.documentFrequency.set(word, (this.documentFrequency.get(word) || 0) + 1);
      }
    }
  }

  /**
   * 将文本转换为向量
   */
  transform(text: string): number[] {
    if (this.vocabulary.size === 0) return [];

    const vector = new Array(this.vocabulary.size).fill(0);
    const words = this.tokenize(text);
    const termFrequency = new Map<string, number>();

    for (const word of words) {
      termFrequency.set(word, (termFrequency.get(word) || 0) + 1);
    }

    for (const [word, tf] of termFrequency) {
      const index = this.vocabulary.get(word);
      if (index !== undefined) {
        const df = this.documentFrequency.get(word) || 1;
        const idf = Math.log((this.totalDocuments + 1) / (df + 1)) + 1;
        vector[index] = tf * idf;
      }
    }

    // L2归一化
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      return vector.map((v) => v / norm);
    }

    return vector;
  }

  /**
   * 分词
   */
  private tokenize(text: string): string[] {
    const tokens: string[] = [];
    const matches = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z0-9]{3,}/g) || [];
    for (const token of matches) {
      tokens.push(token.toLowerCase());
    }
    return tokens;
  }

  /**
   * 获取词汇表大小
   */
  getVocabularySize(): number {
    return this.vocabulary.size;
  }
}

/**
 * 余弦相似度计算
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length || vec1.length === 0) return 0;

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * 检索器
 */
export class Retriever {
  private chunks: RAGChunk[] = [];
  private documents: Map<string, RAGDocument> = new Map();
  private config: RAGConfig;

  constructor(config?: Partial<RAGConfig>) {
    this.config = { ...DEFAULT_RAG_CONFIG, ...config };
  }

  /**
   * 设置索引
   */
  setIndex(chunks: RAGChunk[], documents: RAGDocument[]): void {
    this.chunks = chunks;
    this.documents = new Map(documents.map((d) => [d.id, d]));
  }

  /**
   * 搜索
   */
  search(queryVector: number[], query: string): RAGSearchResult[] {
    const results: RAGSearchResult[] = [];

    for (const chunk of this.chunks) {
      if (chunk.vector.length === 0) continue;

      const similarity = cosineSimilarity(queryVector, chunk.vector);
      if (similarity < this.config.minSimilarity) continue;

      const document = this.documents.get(chunk.documentId);
      if (!document) continue;

      // 关键词匹配加分
      let keywordBoost = 0;
      const queryWords = query.toLowerCase().split(/\s+/);
      for (const word of queryWords) {
        if (chunk.keywords.includes(word)) {
          keywordBoost += 0.1;
        }
      }

      const score = similarity + keywordBoost;

      results.push({
        chunk,
        document,
        score,
        similarity,
        rank: 0,
        highlight: this.highlightText(chunk.content, query),
        explanation: `相似度: ${(similarity * 100).toFixed(2)}%, 关键词加分: ${keywordBoost.toFixed(2)}`,
      });
    }

    // 排序
    results.sort((a, b) => b.score - a.score);

    // 重排序
    if (this.config.enableReranking) {
      this.rerank(results, query);
    }

    // 设置排名
    results.forEach((r, i) => (r.rank = i + 1));

    return results.slice(0, this.config.maxResults);
  }

  /**
   * 重排序（简化版）
   */
  private rerank(results: RAGSearchResult[], query: string): void {
    // 简化版重排序：考虑查询词在标题中的匹配
    for (const result of results) {
      const titleMatch = result.document.title.toLowerCase().includes(query.toLowerCase());
      if (titleMatch) {
        result.score += 0.2;
        result.explanation += ', 标题匹配加分: 0.2';
      }

      // 时效性加分
      const ageInDays = (Date.now() - result.document.updatedAt) / (1000 * 60 * 60 * 24);
      if (ageInDays < 7) {
        result.score += 0.1;
        result.explanation += ', 时效性加分: 0.1';
      }
    }

    results.sort((a, b) => b.score - a.score);
  }

  /**
   * 高亮文本
   */
  private highlightText(text: string, query: string): string {
    if (!query) return text;
    const words = query.split(/\s+/).filter((w) => w.length > 1);
    let result = text;
    for (const word of words) {
      const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      result = result.replace(regex, '**$1**');
    }
    return result;
  }
}

/**
 * 查询扩展器
 */
export class QueryExpander {
  /**
   * 扩展查询
   */
  expand(query: string): string {
    // 简化版查询扩展：添加同义词和相关词
    const expansions: Record<string, string[]> = {
      '如何': ['怎么', '怎样', '如何做'],
      '什么是': ['是什么', '定义', '概念'],
      '为什么': ['原因', '为何', '为啥'],
      'AI': ['人工智能', '机器学习', '深度学习'],
      '代码': ['程序', '编程', '源码'],
      '错误': ['bug', '异常', '问题'],
    };

    let expanded = query;
    for (const [key, synonyms] of Object.entries(expansions)) {
      if (query.includes(key)) {
        expanded += ' ' + synonyms.join(' ');
        break;
      }
    }

    return expanded;
  }
}

/**
 * 上下文组装器
 */
export class ContextAssembler {
  private config: RAGConfig;

  constructor(config?: Partial<RAGConfig>) {
    this.config = { ...DEFAULT_RAG_CONFIG, ...config };
  }

  /**
   * 组装上下文
   */
  assemble(
    query: string,
    expandedQuery: string,
    results: RAGSearchResult[]
  ): {
    contextText: string;
    tokenCount: number;
    sources: Array<{ documentId: string; title: string; source: string; relevance: number }>;
  } {
    let contextText = '';
    let tokenCount = 0;
    const sources: Array<{ documentId: string; title: string; source: string; relevance: number }> = [];

    for (const result of results) {
      const chunkText = `\n\n--- 来源: ${result.document.title} ---\n${result.chunk.content}`;
      const chunkTokens = countTokens(chunkText);

      if (tokenCount + chunkTokens > this.config.contextTokenLimit) break;

      contextText += chunkText;
      tokenCount += chunkTokens;

      sources.push({
        documentId: result.document.id,
        title: result.document.title,
        source: result.document.source,
        relevance: result.similarity,
      });
    }

    return { contextText, tokenCount, sources };
  }
}
