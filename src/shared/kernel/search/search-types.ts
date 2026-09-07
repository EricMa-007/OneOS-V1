/**
 * OneOS 搜索算法类型定义
 * 从search-algorithm-engine提取
 * 
 * 作者：A07 梅罗文加（算法工程师）
 */

export type SearchableType = 'note' | 'task' | 'event' | 'contact' | 'message' | 'file';

export interface SearchableItem {
  id: string;
  type: SearchableType;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

export interface SearchResult {
  item: SearchableItem;
  score: number;
  matchedFields: string[];
  highlightedTitle: string;
  highlightedContent: string;
  matchPositions: Array<{ field: string; start: number; end: number }>;
  explanation: string;
}

export interface SearchQuery {
  text: string;
  filters?: {
    types?: SearchableType[];
    tags?: string[];
    dateFrom?: number;
    dateTo?: number;
  };
  options?: {
    fuzzy?: boolean;
    fuzzyThreshold?: number;
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'date' | 'title';
    sortOrder?: 'asc' | 'desc';
  };
}

export interface SearchSuggestion {
  text: string;
  type: 'history' | 'popular' | 'completion' | 'correction';
  score: number;
  count?: number;
}

export interface SearchStats {
  totalItems: number;
  indexedItems: number;
  totalTerms: number;
  averageDocLength: number;
  queryCount: number;
  avgQueryTime: number;
}

// 搜索结果分组
export interface SearchResultGroup {
  type: SearchableType;
  label: string;
  results: SearchResult[];
  count: number;
}

// 搜索历史记录
export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  count: number;
}

// 倒排索引项
export interface InvertedIndexEntry {
  term: string;
  documentFrequency: number;
  postings: Array<{
    docId: string;
    termFrequency: number;
    positions: number[];
    field: string;
  }>;
}

// 文档向量
export interface DocumentVector {
  docId: string;
  vector: Map<string, number>;
  length: number;
}
