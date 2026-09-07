/**
 * OneOS RAG（检索增强生成）类型定义
 * 从rag-service提取
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

export type RAGSource = 'note' | 'file' | 'web' | 'message';

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  source: RAGSource;
  sourceId: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

export interface RAGChunk {
  id: string;
  documentId: string;
  content: string;
  startIndex: number;
  endIndex: number;
  tokenCount: number;
  vector: number[];
  keywords: string[];
}

export interface RAGSearchResult {
  chunk: RAGChunk;
  document: RAGDocument;
  score: number;
  similarity: number;
  rank: number;
  highlight: string;
  explanation: string;
}

export interface RAGContext {
  query: string;
  expandedQuery: string;
  results: RAGSearchResult[];
  contextText: string;
  tokenCount: number;
  sources: Array<{
    documentId: string;
    title: string;
    source: RAGSource;
    relevance: number;
  }>;
}

export interface RAGConfig {
  chunkSize: number;
  chunkOverlap: number;
  maxResults: number;
  minSimilarity: number;
  contextTokenLimit: number;
  enableQueryExpansion: boolean;
  enableReranking: boolean;
  rerankingTopK: number;
}

export interface RAGStats {
  totalDocuments: number;
  totalChunks: number;
  avgChunkSize: number;
  totalVectors: number;
  queryCount: number;
  avgQueryTime: number;
  avgResultsPerQuery: number;
}

export const DEFAULT_RAG_CONFIG: RAGConfig = {
  chunkSize: 500,
  chunkOverlap: 50,
  maxResults: 10,
  minSimilarity: 0.1,
  contextTokenLimit: 2000,
  enableQueryExpansion: true,
  enableReranking: true,
  rerankingTopK: 20,
};

// 生成唯一ID
export function generateRAGId(): string {
  return `rag-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

// 简单的token计数
export function countTokens(text: string): number {
  // 简化版：中文字符算1个token，英文单词算1个token
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const numbers = (text.match(/\d+/g) || []).length;
  return chineseChars + englishWords + numbers;
}
