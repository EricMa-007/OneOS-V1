/**
 * OneOS RAG（检索增强生成）服务
 * 主服务类，整合文档分块、向量化、语义检索、重排序、查询扩展、上下文组装
 * 
 * 由 A11 梅罗文加（首席算法科学家）设计实现
 * 
 * 核心算法：
 * - 文档分块（Chunking）
 * - 向量化（简化版TF-IDF向量）
 * - 语义检索（余弦相似度）
 * - 上下文组装（Context Assembly）
 * - 重排序（Re-ranking）
 * - 查询扩展（Query Expansion）
 */

import {
  RAGDocument,
  RAGChunk,
  RAGSearchResult,
  RAGContext,
  RAGConfig,
  RAGStats,
  DEFAULT_RAG_CONFIG,
} from './rag/rag-types';
import {
  DocumentChunker,
  Vectorizer,
  Retriever,
  QueryExpander,
  ContextAssembler,
} from './rag/rag-core';

// 重新导出类型，保持向后兼容
export type {
  RAGDocument,
  RAGChunk,
  RAGSearchResult,
  RAGContext,
  RAGConfig,
  RAGStats,
  RAGSource,
} from './rag/rag-types';

// 重新导出配置
export { DEFAULT_RAG_CONFIG } from './rag/rag-types';

// 重新导出核心类
export {
  DocumentChunker,
  Vectorizer,
  Retriever,
  QueryExpander,
  ContextAssembler,
  cosineSimilarity,
} from './rag/rag-core';

/**
 * RAG服务
 */
export class RAGService {
  private documents: Map<string, RAGDocument> = new Map();
  private chunks: RAGChunk[] = [];
  private chunker: DocumentChunker;
  private vectorizer: Vectorizer;
  private retriever: Retriever;
  private queryExpander: QueryExpander;
  private contextAssembler: ContextAssembler;
  private config: RAGConfig;
  private queryCount: number = 0;
  private totalQueryTime: number = 0;

  constructor(config?: Partial<RAGConfig>) {
    this.config = { ...DEFAULT_RAG_CONFIG, ...config };
    this.chunker = new DocumentChunker(this.config);
    this.vectorizer = new Vectorizer();
    this.retriever = new Retriever(this.config);
    this.queryExpander = new QueryExpander();
    this.contextAssembler = new ContextAssembler(this.config);
  }

  /**
   * 添加文档
   */
  addDocument(document: RAGDocument): void {
    this.documents.set(document.id, document);
    this.rebuildIndex();
  }

  /**
   * 批量添加文档
   */
  addDocuments(documents: RAGDocument[]): void {
    for (const doc of documents) {
      this.documents.set(doc.id, doc);
    }
    this.rebuildIndex();
  }

  /**
   * 删除文档
   */
  removeDocument(documentId: string): boolean {
    const deleted = this.documents.delete(documentId);
    if (deleted) {
      this.rebuildIndex();
    }
    return deleted;
  }

  /**
   * 获取所有文档
   */
  getDocuments(): RAGDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * 重建索引
   */
  private rebuildIndex(): void {
    const docs = Array.from(this.documents.values());

    // 训练向量化器
    this.vectorizer.fit(docs);

    // 分块并向量化
    this.chunks = [];
    for (const doc of docs) {
      const docChunks = this.chunker.chunkDocument(doc);
      for (const chunk of docChunks) {
        chunk.vector = this.vectorizer.transform(chunk.content);
        this.chunks.push(chunk);
      }
    }

    // 设置检索器索引
    this.retriever.setIndex(this.chunks, docs);
  }

  /**
   * 搜索
   */
  search(query: string): RAGSearchResult[] {
    const startTime = Date.now();

    // 查询扩展
    const expandedQuery = this.config.enableQueryExpansion
      ? this.queryExpander.expand(query)
      : query;

    // 向量化查询
    const queryVector = this.vectorizer.transform(expandedQuery);

    // 检索
    const results = this.retriever.search(queryVector, expandedQuery);

    // 记录统计
    this.queryCount++;
    this.totalQueryTime += Date.now() - startTime;

    return results;
  }

  /**
   * 获取上下文（完整RAG流程）
   */
  getContext(query: string): RAGContext {
    const startTime = Date.now();

    // 查询扩展
    const expandedQuery = this.config.enableQueryExpansion
      ? this.queryExpander.expand(query)
      : query;

    // 搜索
    const results = this.search(query);

    // 组装上下文
    const { contextText, tokenCount, sources } = this.contextAssembler.assemble(
      query,
      expandedQuery,
      results
    );

    // 记录统计
    this.queryCount++;
    this.totalQueryTime += Date.now() - startTime;

    return {
      query,
      expandedQuery,
      results,
      contextText,
      tokenCount,
      sources,
    };
  }

  /**
   * 获取统计信息
   */
  getStats(): RAGStats {
    const totalChunkTokens = this.chunks.reduce((sum, c) => sum + c.tokenCount, 0);
    return {
      totalDocuments: this.documents.size,
      totalChunks: this.chunks.length,
      avgChunkSize: this.chunks.length > 0 ? Math.round(totalChunkTokens / this.chunks.length) : 0,
      totalVectors: this.chunks.filter((c) => c.vector.length > 0).length,
      queryCount: this.queryCount,
      avgQueryTime: this.queryCount > 0 ? this.totalQueryTime / this.queryCount : 0,
      avgResultsPerQuery: 0, // 可以进一步统计
    };
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<RAGConfig>): void {
    this.config = { ...this.config, ...config };
    this.chunker = new DocumentChunker(this.config);
    this.retriever = new Retriever(this.config);
    this.contextAssembler = new ContextAssembler(this.config);
    this.rebuildIndex();
  }

  /**
   * 获取配置
   */
  getConfig(): RAGConfig {
    return { ...this.config };
  }

  /**
   * 清空索引
   */
  clear(): void {
    this.documents.clear();
    this.chunks = [];
    this.queryCount = 0;
    this.totalQueryTime = 0;
  }

  /**
   * 导出索引
   */
  exportIndex(): {
    documents: RAGDocument[];
    chunks: RAGChunk[];
    config: RAGConfig;
  } {
    return {
      documents: Array.from(this.documents.values()),
      chunks: this.chunks,
      config: this.config,
    };
  }

  /**
   * 导入索引
   */
  importIndex(data: {
    documents: RAGDocument[];
    chunks: RAGChunk[];
    config?: RAGConfig;
  }): void {
    if (data.config) {
      this.config = { ...this.config, ...data.config };
    }
    this.documents = new Map(data.documents.map((d) => [d.id, d]));
    this.chunks = data.chunks;
    this.retriever.setIndex(this.chunks, Array.from(this.documents.values()));
  }
}

// 单例实例
export const ragService = new RAGService();

export default RAGService;
