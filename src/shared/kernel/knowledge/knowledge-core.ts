/**
 * OneOS 知识库核心
 * 从knowledge-base-service提取
 * 包含分类管理、标签管理、知识关联、统计分析
 * 
 * 作者：A09 珀耳塞福涅（文档主管）
 */

import {
  KnowledgeCategory,
  KnowledgeTag,
  KnowledgeLink,
  KnowledgeNote,
  KnowledgeStats,
  KnowledgeGraphData,
  CATEGORY_COLORS,
  TAG_COLORS,
  generateId,
  calculateReadingTime,
  calculateWordCount,
} from './knowledge-types';

/**
 * 分类管理器
 */
export class CategoryManager {
  private categories: Map<string, KnowledgeCategory> = new Map();

  constructor(categories: KnowledgeCategory[] = []) {
    this.setCategories(categories);
  }

  setCategories(categories: KnowledgeCategory[]): void {
    this.categories = new Map(categories.map((c) => [c.id, c]));
  }

  getAll(): KnowledgeCategory[] {
    return Array.from(this.categories.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getById(id: string): KnowledgeCategory | undefined {
    return this.categories.get(id);
  }

  getByParent(parentId: string | null): KnowledgeCategory[] {
    return this.getAll().filter((c) => c.parentId === parentId);
  }

  create(name: string, parentId: string | null = null): KnowledgeCategory {
    const category: KnowledgeCategory = {
      id: generateId(),
      name,
      description: '',
      parentId,
      icon: '📁',
      color: CATEGORY_COLORS[this.categories.size % CATEGORY_COLORS.length],
      noteCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  update(id: string, updates: Partial<KnowledgeCategory>): KnowledgeCategory | undefined {
    const category = this.categories.get(id);
    if (!category) return undefined;
    const updated = { ...category, ...updates, updatedAt: Date.now() };
    this.categories.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    // 检查是否有子分类
    const hasChildren = this.getByParent(id).length > 0;
    if (hasChildren) return false;
    return this.categories.delete(id);
  }

  getCategoryTree(): Array<KnowledgeCategory & { children: KnowledgeCategory[] }> {
    const roots = this.getByParent(null);
    return roots.map((root) => ({
      ...root,
      children: this.getByParent(root.id),
    }));
  }

  updateNoteCount(categoryId: string, delta: number): void {
    const category = this.categories.get(categoryId);
    if (category) {
      category.noteCount = Math.max(0, category.noteCount + delta);
      category.updatedAt = Date.now();
    }
  }
}

/**
 * 标签管理器
 */
export class TagManager {
  private tags: Map<string, KnowledgeTag> = new Map();

  constructor(tags: KnowledgeTag[] = []) {
    this.setTags(tags);
  }

  setTags(tags: KnowledgeTag[]): void {
    this.tags = new Map(tags.map((t) => [t.id, t]));
  }

  getAll(): KnowledgeTag[] {
    return Array.from(this.tags.values()).sort((a, b) => b.usageCount - a.usageCount);
  }

  getById(id: string): KnowledgeTag | undefined {
    return this.tags.get(id);
  }

  getByName(name: string): KnowledgeTag | undefined {
    return this.getAll().find((t) => t.name.toLowerCase() === name.toLowerCase());
  }

  getOrCreate(name: string): KnowledgeTag {
    const existing = this.getByName(name);
    if (existing) return existing;

    const tag: KnowledgeTag = {
      id: generateId(),
      name,
      color: TAG_COLORS[this.tags.size % TAG_COLORS.length],
      description: '',
      noteCount: 0,
      relatedTags: [],
      createdAt: Date.now(),
      usageCount: 0,
    };
    this.tags.set(tag.id, tag);
    return tag;
  }

  update(id: string, updates: Partial<KnowledgeTag>): KnowledgeTag | undefined {
    const tag = this.tags.get(id);
    if (!tag) return undefined;
    const updated = { ...tag, ...updates };
    this.tags.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.tags.delete(id);
  }

  mergeTags(sourceId: string, targetId: string): boolean {
    const source = this.tags.get(sourceId);
    const target = this.tags.get(targetId);
    if (!source || !target) return false;

    target.noteCount += source.noteCount;
    target.usageCount += source.usageCount;
    target.relatedTags = [...new Set([...target.relatedTags, ...source.relatedTags])];

    this.tags.delete(sourceId);
    return true;
  }

  getTopTags(limit: number = 10): Array<{ tag: KnowledgeTag; count: number }> {
    return this.getAll()
      .slice(0, limit)
      .map((tag) => ({ tag, count: tag.usageCount }));
  }

  incrementUsage(tagId: string): void {
    const tag = this.tags.get(tagId);
    if (tag) {
      tag.usageCount++;
    }
  }

  updateRelatedTags(tagId: string, relatedTagIds: string[]): void {
    const tag = this.tags.get(tagId);
    if (tag) {
      tag.relatedTags = [...new Set([...tag.relatedTags, ...relatedTagIds])];
    }
  }
}

/**
 * 知识关联管理器
 */
export class KnowledgeLinkManager {
  private links: Map<string, KnowledgeLink> = new Map();

  constructor(links: KnowledgeLink[] = []) {
    this.setLinks(links);
  }

  setLinks(links: KnowledgeLink[]): void {
    this.links = new Map(links.map((l) => [l.id, l]));
  }

  getAll(): KnowledgeLink[] {
    return Array.from(this.links.values());
  }

  getByNote(noteId: string): KnowledgeLink[] {
    return this.getAll().filter(
      (l) => l.sourceNoteId === noteId || l.targetNoteId === noteId
    );
  }

  getOutgoingLinks(noteId: string): KnowledgeLink[] {
    return this.getAll().filter((l) => l.sourceNoteId === noteId);
  }

  getIncomingLinks(noteId: string): KnowledgeLink[] {
    return this.getAll().filter((l) => l.targetNoteId === noteId);
  }

  create(
    sourceNoteId: string,
    targetNoteId: string,
    linkType: KnowledgeLink['linkType'] = 'manual',
    strength: number = 0.5,
    context?: string
  ): KnowledgeLink {
    // 检查是否已存在
    const existing = this.getAll().find(
      (l) =>
        (l.sourceNoteId === sourceNoteId && l.targetNoteId === targetNoteId) ||
        (l.sourceNoteId === targetNoteId && l.targetNoteId === sourceNoteId)
    );
    if (existing) return existing;

    const link: KnowledgeLink = {
      id: generateId(),
      sourceNoteId,
      targetNoteId,
      linkType,
      strength,
      createdAt: Date.now(),
      context,
    };
    this.links.set(link.id, link);
    return link;
  }

  delete(linkId: string): boolean {
    return this.links.delete(linkId);
  }

  deleteByNote(noteId: string): number {
    const linksToDelete = this.getByNote(noteId);
    for (const link of linksToDelete) {
      this.links.delete(link.id);
    }
    return linksToDelete.length;
  }

  getBacklinks(noteId: string): string[] {
    return this.getIncomingLinks(noteId).map((l) => l.sourceNoteId);
  }

  getRelatedNotes(noteId: string, limit: number = 10): Array<{ noteId: string; strength: number; reason: string }> {
    const directLinks = this.getByNote(noteId);
    const related = new Map<string, { strength: number; reason: string }>();

    for (const link of directLinks) {
      const otherNoteId = link.sourceNoteId === noteId ? link.targetNoteId : link.sourceNoteId;
      related.set(otherNoteId, {
        strength: link.strength,
        reason: link.linkType === 'manual' ? '手动关联' : '自动关联',
      });
    }

    // 二级关联（朋友的朋友）
    for (const [relatedId] of related) {
      const secondLevelLinks = this.getByNote(relatedId);
      for (const link of secondLevelLinks) {
        const otherId = link.sourceNoteId === relatedId ? link.targetNoteId : link.sourceNoteId;
        if (otherId === noteId || related.has(otherId)) continue;
        if (!related.has(otherId)) {
          related.set(otherId, {
            strength: link.strength * 0.5,
            reason: '二级关联',
          });
        }
      }
    }

    return Array.from(related.entries())
      .map(([noteId, data]) => ({ noteId, ...data }))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, limit);
  }
}

/**
 * 知识库统计分析器
 */
export class KnowledgeAnalytics {
  static calculateStats(
    notes: KnowledgeNote[],
    categories: KnowledgeCategory[],
    tags: KnowledgeTag[],
    links: KnowledgeLink[]
  ): KnowledgeStats {
    const totalWords = notes.reduce((sum, note) => sum + note.metadata.wordCount, 0);
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    const notesThisWeek = notes.filter((n) => n.createdAt >= oneWeekAgo).length;
    const notesThisMonth = notes.filter((n) => n.createdAt >= oneMonthAgo).length;

    const mostUsedTags = tags
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map((tag) => ({ tag, count: tag.usageCount }));

    const largestCategories = categories
      .sort((a, b) => b.noteCount - a.noteCount)
      .slice(0, 10)
      .map((category) => ({ category, count: category.noteCount }));

    const recentlyModified = [...notes]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 10);

    // 字数趋势（最近30天）
    const wordCountTrend: Array<{ date: string; count: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().slice(0, 10);
      const dayStart = new Date(dateStr).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayWords = notes
        .filter((n) => n.updatedAt >= dayStart && n.updatedAt < dayEnd)
        .reduce((sum, n) => sum + n.metadata.wordCount, 0);
      wordCountTrend.push({ date: dateStr, count: dayWords });
    }

    return {
      totalNotes: notes.length,
      totalCategories: categories.length,
      totalTags: tags.length,
      totalLinks: links.length,
      totalWords,
      avgWordsPerNote: notes.length > 0 ? Math.round(totalWords / notes.length) : 0,
      notesThisWeek,
      notesThisMonth,
      mostUsedTags,
      largestCategories,
      recentlyModified,
      wordCountTrend,
    };
  }

  static buildKnowledgeGraph(
    notes: KnowledgeNote[],
    tags: KnowledgeTag[],
    categories: KnowledgeCategory[],
    links: KnowledgeLink[]
  ): KnowledgeGraphData {
    const nodes: KnowledgeGraphData['nodes'] = [];
    const edges: KnowledgeGraphData['edges'] = [];

    // 笔记节点
    for (const note of notes) {
      const category = categories.find((c) => c.id === note.categoryId);
      nodes.push({
        id: note.id,
        label: note.title,
        size: Math.min(30, 10 + note.metadata.wordCount / 100),
        color: category?.color || '#8B5CF6',
        category: category?.name,
        type: 'note',
      });
    }

    // 标签节点
    for (const tag of tags) {
      nodes.push({
        id: `tag-${tag.id}`,
        label: tag.name,
        size: Math.min(25, 8 + tag.usageCount / 2),
        color: tag.color,
        type: 'tag',
      });
    }

    // 笔记-笔记边
    for (const link of links) {
      edges.push({
        source: link.sourceNoteId,
        target: link.targetNoteId,
        weight: link.strength,
        type: link.linkType,
      });
    }

    // 笔记-标签边
    for (const note of notes) {
      for (const tagId of note.tagIds) {
        edges.push({
          source: note.id,
          target: `tag-${tagId}`,
          weight: 0.8,
          type: 'tag',
        });
      }
    }

    // 计算统计
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
    const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

    // 计算度
    const degrees = new Map<string, number>();
    for (const edge of edges) {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    }
    const avgDegree = nodeCount > 0 ? Array.from(degrees.values()).reduce((a, b) => a + b, 0) / nodeCount : 0;

    return {
      nodes,
      edges,
      stats: {
        nodeCount,
        edgeCount,
        density,
        connectedComponents: 1, // 简化计算
        avgDegree,
      },
    };
  }
}

/**
 * 笔记工具函数
 */
export class NoteUtils {
  static createNote(title: string, content: string = ''): KnowledgeNote {
    const wordCount = calculateWordCount(content);
    return {
      id: generateId(),
      title,
      content,
      categoryId: null,
      tagIds: [],
      linkedNoteIds: [],
      backlinkNoteIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata: {
        wordCount,
        readingTime: calculateReadingTime(wordCount),
        lastAccessed: Date.now(),
        accessCount: 0,
        isFavorite: false,
        isArchived: false,
        version: 1,
      },
    };
  }

  static updateNoteContent(note: KnowledgeNote, content: string): KnowledgeNote {
    const wordCount = calculateWordCount(content);
    return {
      ...note,
      content,
      updatedAt: Date.now(),
      metadata: {
        ...note.metadata,
        wordCount,
        readingTime: calculateReadingTime(wordCount),
        version: note.metadata.version + 1,
      },
    };
  }

  static addTag(note: KnowledgeNote, tagId: string): KnowledgeNote {
    if (note.tagIds.includes(tagId)) return note;
    return {
      ...note,
      tagIds: [...note.tagIds, tagId],
      updatedAt: Date.now(),
    };
  }

  static removeTag(note: KnowledgeNote, tagId: string): KnowledgeNote {
    return {
      ...note,
      tagIds: note.tagIds.filter((id) => id !== tagId),
      updatedAt: Date.now(),
    };
  }

  static setCategory(note: KnowledgeNote, categoryId: string | null): KnowledgeNote {
    return {
      ...note,
      categoryId,
      updatedAt: Date.now(),
    };
  }

  static toggleFavorite(note: KnowledgeNote): KnowledgeNote {
    return {
      ...note,
      metadata: {
        ...note.metadata,
        isFavorite: !note.metadata.isFavorite,
      },
    };
  }

  static toggleArchive(note: KnowledgeNote): KnowledgeNote {
    return {
      ...note,
      metadata: {
        ...note.metadata,
        isArchived: !note.metadata.isArchived,
      },
    };
  }

  static incrementAccess(note: KnowledgeNote): KnowledgeNote {
    return {
      ...note,
      metadata: {
        ...note.metadata,
        lastAccessed: Date.now(),
        accessCount: note.metadata.accessCount + 1,
      },
    };
  }
}
