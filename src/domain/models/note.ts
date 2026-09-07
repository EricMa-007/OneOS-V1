/**
 * 笔记领域模型
 */

import { BaseEntity } from './base-entity';

/** 笔记类型 */
export type NoteType = 'markdown' | 'text' | 'code' | 'canvas';

/** 笔记状态 */
export type NoteStatus = 'draft' | 'published' | 'archived';

/** 笔记元数据 */
export interface NoteMeta {
  /** 字数 */
  wordCount: number;
  /** 阅读时间（分钟） */
  readingTime: number;
  /** 字符数 */
  charCount: number;
  /** 行数 */
  lineCount: number;
}

/** 笔记实体 */
export interface Note extends BaseEntity {
  /** 标题 */
  title: string;
  /** 内容（Markdown） */
  content: string;
  /** 笔记类型 */
  type: NoteType;
  /** 笔记状态 */
  status: NoteStatus;
  /** 所属文件夹ID（根目录为null） */
  folderId: string | null;
  /** 标签ID列表 */
  tagIds: string[];
  /** 反向链接（引用此笔记的笔记ID列表） */
  backlinks: string[];
  /** 正向链接（此笔记引用的笔记ID列表） */
  forwardlinks: string[];
  /** 笔记元数据 */
  meta: NoteMeta;
  /** 是否收藏 */
  favorite: boolean;
  /** 排序权重 */
  order: number;
  /** 封面图URL */
  cover?: string;
  /** 摘要（自动生成或手动） */
  excerpt?: string;
  /** 自定义属性（YAML frontmatter解析） */
  properties?: Record<string, string | string[] | number | boolean>;
}

/** 创建笔记的输入 */
export interface CreateNoteInput {
  title: string;
  content?: string;
  type?: NoteType;
  folderId?: string | null;
  tagIds?: string[];
  favorite?: boolean;
  properties?: Record<string, unknown>;
}

/** 更新笔记的输入 */
export interface UpdateNoteInput {
  title?: string;
  content?: string;
  type?: NoteType;
  status?: NoteStatus;
  folderId?: string | null;
  tagIds?: string[];
  favorite?: boolean;
  order?: number;
  cover?: string;
  excerpt?: string;
  properties?: Record<string, unknown>;
}

/** 笔记查询条件 */
export interface NoteQuery {
  folderId?: string | null;
  tagId?: string;
  status?: NoteStatus;
  favorite?: boolean;
  keyword?: string;
  type?: NoteType;
  deleted?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'updatedAt' | 'createdAt' | 'title' | 'order';
  sortOrder?: 'asc' | 'desc';
}

/** 笔记统计 */
export interface NoteStats {
  total: number;
  totalWords: number;
  todayCreated: number;
  todayUpdated: number;
  favorites: number;
  archived: number;
  byType: Record<NoteType, number>;
  byFolder: Record<string, number>;
  byTag: Record<string, number>;
}

/**
 * 创建笔记工厂函数
 */
export function createNote(input: CreateNoteInput): Note {
  const now = new Date().toISOString();
  const content = input.content || '';
  return {
    id: `n_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    title: input.title || '无标题',
    content,
    type: input.type || 'markdown',
    status: 'draft',
    folderId: input.folderId ?? null,
    tagIds: input.tagIds || [],
    backlinks: [],
    forwardlinks: [],
    meta: calculateNoteMeta(content),
    favorite: input.favorite || false,
    order: Date.now(),
    properties: input.properties as Note['properties'],
    createdAt: now,
    updatedAt: now,
    version: 1,
    deviceId: 'web',
    syncState: 'local',
    deleted: false,
  };
}

/**
 * 计算笔记元数据
 */
export function calculateNoteMeta(content: string): NoteMeta {
  const charCount = content.length;
  const wordCount = content
    .replace(/[#*`>\-\[\]()!]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const lineCount = content.split('\n').length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 300));
  return { wordCount, readingTime, charCount, lineCount };
}
