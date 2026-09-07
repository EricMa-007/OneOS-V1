/**
 * Note 领域模型测试
 */

import { describe, it, expect } from 'vitest';
import type { Note, NoteCreateInput, NoteUpdateInput } from '../../src/domain/models/note';

describe('Note 领域模型', () => {
  describe('NoteCreateInput', () => {
    it('应该可以创建只包含标题的笔记', () => {
      const input: NoteCreateInput = { title: '测试笔记' };
      expect(input.title).toBe('测试笔记');
      expect(input.content).toBeUndefined();
    });

    it('应该可以创建包含完整内容的笔记', () => {
      const input: NoteCreateInput = {
        title: '完整笔记',
        content: '# 标题\n\n这是内容',
        folderId: 'folder-1',
        tagIds: ['tag-1', 'tag-2'],
      };
      expect(input.title).toBe('完整笔记');
      expect(input.content).toContain('标题');
      expect(input.tagIds).toHaveLength(2);
    });
  });

  describe('Note 实体', () => {
    it('应该包含所有必要字段', () => {
      const note: Note = {
        id: 'note-1',
        title: '测试笔记',
        content: '内容',
        folderId: null,
        tagIds: [],
        favorite: false,
        deleted: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        meta: { wordCount: 2, readingTime: 1 },
      };

      expect(note.id).toBe('note-1');
      expect(note.title).toBe('测试笔记');
      expect(note.favorite).toBe(false);
      expect(note.deleted).toBe(false);
      expect(note.meta.wordCount).toBe(2);
    });

    it('应该支持收藏状态', () => {
      const note: Note = {
        id: 'note-2',
        title: '收藏笔记',
        content: '',
        folderId: null,
        tagIds: [],
        favorite: true,
        deleted: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        meta: { wordCount: 0, readingTime: 0 },
      };

      expect(note.favorite).toBe(true);
    });
  });

  describe('NoteUpdateInput', () => {
    it('应该支持部分更新', () => {
      const update: NoteUpdateInput = { title: '新标题' };
      expect(update.title).toBe('新标题');
      expect(update.content).toBeUndefined();
    });

    it('应该支持软删除', () => {
      const update: NoteUpdateInput = { deleted: true };
      expect(update.deleted).toBe(true);
    });
  });
});
