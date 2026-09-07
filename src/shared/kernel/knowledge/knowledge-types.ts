/**
 * OneOS 知识库类型定义
 * 从knowledge-base-service提取
 * 
 * 作者：A09 珀耳塞福涅（文档主管）
 */

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  icon: string;
  color: string;
  noteCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface KnowledgeTag {
  id: string;
  name: string;
  color: string;
  description: string;
  noteCount: number;
  relatedTags: string[];
  createdAt: number;
  usageCount: number;
}

export interface KnowledgeLink {
  id: string;
  sourceNoteId: string;
  targetNoteId: string;
  linkType: 'manual' | 'automatic' | 'tag' | 'reference';
  strength: number; // 0-1
  createdAt: number;
  context?: string;
}

export interface KnowledgeNote {
  id: string;
  title: string;
  content: string;
  categoryId: string | null;
  tagIds: string[];
  linkedNoteIds: string[];
  backlinkNoteIds: string[];
  createdAt: number;
  updatedAt: number;
  metadata: {
    wordCount: number;
    readingTime: number;
    lastAccessed: number;
    accessCount: number;
    isFavorite: boolean;
    isArchived: boolean;
    version: number;
  };
}

export interface KnowledgeStats {
  totalNotes: number;
  totalCategories: number;
  totalTags: number;
  totalLinks: number;
  totalWords: number;
  avgWordsPerNote: number;
  notesThisWeek: number;
  notesThisMonth: number;
  mostUsedTags: Array<{ tag: KnowledgeTag; count: number }>;
  largestCategories: Array<{ category: KnowledgeCategory; count: number }>;
  recentlyModified: KnowledgeNote[];
  wordCountTrend: Array<{ date: string; count: number }>;
}

export interface KnowledgeGraphData {
  nodes: Array<{
    id: string;
    label: string;
    size: number;
    color: string;
    category?: string;
    type: 'note' | 'tag' | 'category';
  }>;
  edges: Array<{
    source: string;
    target: string;
    weight: number;
    type: string;
  }>;
  stats: {
    nodeCount: number;
    edgeCount: number;
    density: number;
    connectedComponents: number;
    avgDegree: number;
  };
}

export interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: Array<{ file: string; error: string }>;
  importedNotes: KnowledgeNote[];
}

export interface ExportOptions {
  format: 'markdown' | 'json' | 'html';
  includeMetadata: boolean;
  includeTags: boolean;
  includeLinks: boolean;
  categories?: string[];
  tags?: string[];
  dateFrom?: number;
  dateTo?: number;
}

// 预设分类颜色
export const CATEGORY_COLORS = [
  '#8B5CF6', '#00CEC9', '#FD79A8', '#FDCB6E',
  '#0984E3', '#00B894', '#E17055', '#6C5CE7',
  '#A29BFE', '#74B9FF', '#55EFC4', '#FFEAA7',
];

// 预设标签颜色
export const TAG_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
];

// 生成唯一ID
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

// 计算阅读时间（分钟）
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200; // 平均阅读速度
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// 计算字数
export function calculateWordCount(content: string): number {
  // 中文字符 + 英文单词
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  return chineseChars + englishWords;
}
