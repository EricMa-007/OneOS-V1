/**
 * OneOS 知识库管理服务
 * 主服务类，整合分类管理、标签管理、知识关联、统计分析、导入导出
 * 
 * 由 A10 珀耳塞福涅（文档主管）设计实现
 * 
 * 核心功能：
 * - 笔记分类系统（文件夹/分类/标签）
 * - 标签管理（创建/合并/删除/统计）
 * - 知识关联（双向链接/反向链接/相关推荐）
 * - 知识网络分析（知识图谱/社区发现/核心知识识别）
 * - 知识库统计（字数/标签/分类/时间分布）
 * - 知识导入导出（Markdown/JSON/批量操作）
 */

import {
  KnowledgeCategory,
  KnowledgeTag,
  KnowledgeLink,
  KnowledgeNote,
  KnowledgeStats,
  KnowledgeGraphData,
  ImportResult,
  ExportOptions,
} from './knowledge/knowledge-types';
import {
  CategoryManager,
  TagManager,
  KnowledgeLinkManager,
  KnowledgeAnalytics,
  NoteUtils,
} from './knowledge/knowledge-core';
import { graphAlgorithmEngine } from './graph-algorithm-engine';

// 重新导出类型，保持向后兼容
export type {
  KnowledgeCategory,
  KnowledgeTag,
  KnowledgeLink,
  KnowledgeNote,
  KnowledgeStats,
  KnowledgeGraphData,
  ImportResult,
  ExportOptions,
} from './knowledge/knowledge-types';

// 重新导出工具函数
export {
  generateId,
  calculateReadingTime,
  calculateWordCount,
  CATEGORY_COLORS,
  TAG_COLORS,
} from './knowledge/knowledge-types';

// 重新导出核心类
export {
  CategoryManager,
  TagManager,
  KnowledgeLinkManager,
  KnowledgeAnalytics,
  NoteUtils,
} from './knowledge/knowledge-core';

/**
 * 知识库管理服务
 */
export class KnowledgeBaseService {
  private notes: Map<string, KnowledgeNote> = new Map();
  private categoryManager: CategoryManager;
  private tagManager: TagManager;
  private linkManager: KnowledgeLinkManager;

  constructor() {
    this.categoryManager = new CategoryManager();
    this.tagManager = new TagManager();
    this.linkManager = new KnowledgeLinkManager();
  }

  // ==================== 笔记管理 ====================

  getAllNotes(): KnowledgeNote[] {
    return Array.from(this.notes.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  getNoteById(id: string): KnowledgeNote | undefined {
    return this.notes.get(id);
  }

  createNote(title: string, content: string = ''): KnowledgeNote {
    const note = NoteUtils.createNote(title, content);
    this.notes.set(note.id, note);
    return note;
  }

  updateNoteContent(id: string, content: string): KnowledgeNote | undefined {
    const note = this.notes.get(id);
    if (!note) return undefined;
    const updated = NoteUtils.updateNoteContent(note, content);
    this.notes.set(id, updated);
    return updated;
  }

  deleteNote(id: string): boolean {
    const note = this.notes.get(id);
    if (!note) return false;

    // 更新分类计数
    if (note.categoryId) {
      this.categoryManager.updateNoteCount(note.categoryId, -1);
    }

    // 删除关联
    this.linkManager.deleteByNote(id);

    return this.notes.delete(id);
  }

  // ==================== 分类管理 ====================

  getAllCategories(): KnowledgeCategory[] {
    return this.categoryManager.getAll();
  }

  createCategory(name: string, parentId: string | null = null): KnowledgeCategory {
    return this.categoryManager.create(name, parentId);
  }

  updateCategory(id: string, updates: Partial<KnowledgeCategory>): KnowledgeCategory | undefined {
    return this.categoryManager.update(id, updates);
  }

  deleteCategory(id: string): boolean {
    return this.categoryManager.delete(id);
  }

  setNoteCategory(noteId: string, categoryId: string | null): KnowledgeNote | undefined {
    const note = this.notes.get(noteId);
    if (!note) return undefined;

    // 更新旧分类计数
    if (note.categoryId) {
      this.categoryManager.updateNoteCount(note.categoryId, -1);
    }

    // 更新新分类计数
    if (categoryId) {
      this.categoryManager.updateNoteCount(categoryId, 1);
    }

    const updated = NoteUtils.setCategory(note, categoryId);
    this.notes.set(noteId, updated);
    return updated;
  }

  // ==================== 标签管理 ====================

  getAllTags(): KnowledgeTag[] {
    return this.tagManager.getAll();
  }

  getOrCreateTag(name: string): KnowledgeTag {
    return this.tagManager.getOrCreate(name);
  }

  updateTag(id: string, updates: Partial<KnowledgeTag>): KnowledgeTag | undefined {
    return this.tagManager.update(id, updates);
  }

  deleteTag(id: string): boolean {
    return this.tagManager.delete(id);
  }

  addTagToNote(noteId: string, tagName: string): KnowledgeNote | undefined {
    const note = this.notes.get(noteId);
    if (!note) return undefined;

    const tag = this.tagManager.getOrCreate(tagName);
    this.tagManager.incrementUsage(tag.id);

    const updated = NoteUtils.addTag(note, tag.id);
    this.notes.set(noteId, updated);
    return updated;
  }

  removeTagFromNote(noteId: string, tagId: string): KnowledgeNote | undefined {
    const note = this.notes.get(noteId);
    if (!note) return undefined;
    const updated = NoteUtils.removeTag(note, tagId);
    this.notes.set(noteId, updated);
    return updated;
  }

  // ==================== 知识关联 ====================

  createLink(
    sourceNoteId: string,
    targetNoteId: string,
    linkType: KnowledgeLink['linkType'] = 'manual',
    strength: number = 0.5
  ): KnowledgeLink {
    const link = this.linkManager.create(sourceNoteId, targetNoteId, linkType, strength);

    // 更新笔记的关联列表
    const source = this.notes.get(sourceNoteId);
    const target = this.notes.get(targetNoteId);
    if (source && !source.linkedNoteIds.includes(targetNoteId)) {
      source.linkedNoteIds.push(targetNoteId);
    }
    if (target && !target.backlinkNoteIds.includes(sourceNoteId)) {
      target.backlinkNoteIds.push(sourceNoteId);
    }

    return link;
  }

  getBacklinks(noteId: string): string[] {
    return this.linkManager.getBacklinks(noteId);
  }

  getRelatedNotes(noteId: string, limit: number = 10): Array<{ noteId: string; strength: number; reason: string }> {
    return this.linkManager.getRelatedNotes(noteId, limit);
  }

  // ==================== 统计分析 ====================

  getStats(): KnowledgeStats {
    return KnowledgeAnalytics.calculateStats(
      this.getAllNotes(),
      this.getAllCategories(),
      this.getAllTags(),
      this.linkManager.getAll()
    );
  }

  getKnowledgeGraph(): KnowledgeGraphData {
    return KnowledgeAnalytics.buildKnowledgeGraph(
      this.getAllNotes(),
      this.getAllTags(),
      this.getAllCategories(),
      this.linkManager.getAll()
    );
  }

  async analyzeKnowledgeCommunities(): Promise<{
    communities: Array<{ id: number; name: string; nodeIds: string[]; size: number }>;
    centralities: Record<string, { degree: number; betweenness: number; closeness: number; pagerank: number }>;
  }> {
    const graph = this.getKnowledgeGraph();
    const nodes = graph.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      x: 0,
      y: 0,
      size: n.size,
      color: n.color,
      degree: 0,
    }));
    const edges = graph.edges.map((e, i) => ({
      id: `edge-${i}`,
      source: e.source,
      target: e.target,
      weight: e.weight,
    }));

    graphAlgorithmEngine.setGraph(nodes, edges);
    const [communityResult, centralityResult] = await Promise.all([
      graphAlgorithmEngine.detectCommunities(),
      graphAlgorithmEngine.calculateCentrality(),
    ]);

    return {
      communities: communityResult.communities,
      centralities: centralityResult.centralities,
    };
  }

  // ==================== 导入导出 ====================

  exportToMarkdown(options?: Partial<ExportOptions>): string {
    const notes = this.getAllNotes();
    let markdown = '';

    for (const note of notes) {
      markdown += `# ${note.title}\n\n`;
      if (options?.includeMetadata) {
        markdown += `> 创建时间: ${new Date(note.createdAt).toLocaleString()}\n`;
        markdown += `> 更新时间: ${new Date(note.updatedAt).toLocaleString()}\n`;
        markdown += `> 字数: ${note.metadata.wordCount}\n\n`;
      }
      if (options?.includeTags && note.tagIds.length > 0) {
        const tags = note.tagIds
          .map((id) => this.tagManager.getById(id)?.name)
          .filter(Boolean)
          .join(', ');
        markdown += `**标签**: ${tags}\n\n`;
      }
      markdown += `${note.content}\n\n---\n\n`;
    }

    return markdown;
  }

  exportToJSON(): string {
    return JSON.stringify(
      {
        notes: this.getAllNotes(),
        categories: this.getAllCategories(),
        tags: this.getAllTags(),
        links: this.linkManager.getAll(),
        exportedAt: Date.now(),
        version: '1.0',
      },
      null,
      2
    );
  }

  importFromJSON(json: string): ImportResult {
    try {
      const data = JSON.parse(json);
      const result: ImportResult = {
        success: 0,
        failed: 0,
        skipped: 0,
        errors: [],
        importedNotes: [],
      };

      if (data.notes && Array.isArray(data.notes)) {
        for (const note of data.notes) {
          try {
            this.notes.set(note.id, note);
            result.success++;
            result.importedNotes.push(note);
          } catch (error) {
            result.failed++;
            result.errors.push({ file: note.title, error: String(error) });
          }
        }
      }

      if (data.categories) {
        this.categoryManager.setCategories(data.categories);
      }
      if (data.tags) {
        this.tagManager.setTags(data.tags);
      }
      if (data.links) {
        this.linkManager.setLinks(data.links);
      }

      return result;
    } catch (error) {
      return {
        success: 0,
        failed: 1,
        skipped: 0,
        errors: [{ file: 'JSON', error: String(error) }],
        importedNotes: [],
      };
    }
  }

  // ==================== 批量操作 ====================

  batchDelete(noteIds: string[]): { success: number; failed: number } {
    let success = 0;
    let failed = 0;
    for (const id of noteIds) {
      if (this.deleteNote(id)) success++;
      else failed++;
    }
    return { success, failed };
  }

  batchAddTag(noteIds: string[], tagName: string): { success: number; failed: number } {
    let success = 0;
    let failed = 0;
    for (const id of noteIds) {
      if (this.addTagToNote(id, tagName)) success++;
      else failed++;
    }
    return { success, failed };
  }

  // ==================== 搜索 ====================

  searchNotes(query: string): KnowledgeNote[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllNotes().filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
    );
  }

  getNotesByCategory(categoryId: string): KnowledgeNote[] {
    return this.getAllNotes().filter((n) => n.categoryId === categoryId);
  }

  getNotesByTag(tagId: string): KnowledgeNote[] {
    return this.getAllNotes().filter((n) => n.tagIds.includes(tagId));
  }

  getFavorites(): KnowledgeNote[] {
    return this.getAllNotes().filter((n) => n.metadata.isFavorite);
  }

  getRecentlyAccessed(limit: number = 10): KnowledgeNote[] {
    return this.getAllNotes()
      .sort((a, b) => b.metadata.lastAccessed - a.metadata.lastAccessed)
      .slice(0, limit);
  }
}

// 单例实例
export const knowledgeBaseService = new KnowledgeBaseService();

export default KnowledgeBaseService;
