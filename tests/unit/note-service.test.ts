/**
 * NoteService 单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NoteService } from '../../src/modules/note/services/note-service';
import type { Note, NoteCreateInput } from '../../src/domain/models/note';
import type { NoteRepository } from '../../src/domain/repositories/note-repository';

// Mock Repository
const mockRepository = {
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  getStats: vi.fn(),
} as unknown as NoteRepository;

describe('NoteService', () => {
  let service: NoteService;

  beforeEach(() => {
    service = new NoteService(mockRepository);
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('应该创建笔记并触发事件', async () => {
      const input: NoteCreateInput = { title: '测试笔记', content: '内容' };
      const expectedNote: Note = {
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

      (mockRepository.create as any).mockResolvedValue(expectedNote);

      const result = await service.create(input);

      expect(result).toEqual(expectedNote);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
    });
  });

  describe('update', () => {
    it('应该更新笔记', async () => {
      const updatedNote: Note = {
        id: 'note-1',
        title: '更新后的标题',
        content: '更新后的内容',
        folderId: null,
        tagIds: [],
        favorite: false,
        deleted: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
        meta: { wordCount: 6, readingTime: 1 },
      };

      (mockRepository.update as any).mockResolvedValue(updatedNote);

      const result = await service.update('note-1', { title: '更新后的标题' });

      expect(result.title).toBe('更新后的标题');
      expect(mockRepository.update).toHaveBeenCalledWith('note-1', { title: '更新后的标题' });
    });
  });

  describe('delete', () => {
    it('应该软删除笔记', async () => {
      (mockRepository.softDelete as any).mockResolvedValue(undefined);

      await service.delete('note-1');

      expect(mockRepository.softDelete).toHaveBeenCalledWith('note-1');
    });
  });

  describe('getById', () => {
    it('应该根据ID获取笔记', async () => {
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

      (mockRepository.findById as any).mockResolvedValue(note);

      const result = await service.getById('note-1');

      expect(result).toEqual(note);
      expect(mockRepository.findById).toHaveBeenCalledWith('note-1');
    });

    it('应该在笔记不存在时返回null', async () => {
      (mockRepository.findById as any).mockResolvedValue(null);

      const result = await service.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('toggleFavorite', () => {
    it('应该切换收藏状态', async () => {
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

      (mockRepository.findById as any).mockResolvedValue(note);
      (mockRepository.update as any).mockResolvedValue({ ...note, favorite: true });

      const result = await service.toggleFavorite('note-1');

      expect(result.favorite).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith('note-1', { favorite: true });
    });

    it('应该在笔记不存在时抛出错误', async () => {
      (mockRepository.findById as any).mockResolvedValue(null);

      await expect(service.toggleFavorite('non-existent')).rejects.toThrow('笔记不存在');
    });
  });

  describe('duplicate', () => {
    it('应该复制笔记', async () => {
      const source: Note = {
        id: 'note-1',
        title: '原始笔记',
        content: '原始内容',
        folderId: 'folder-1',
        tagIds: ['tag-1'],
        favorite: true,
        deleted: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        meta: { wordCount: 4, readingTime: 1 },
      };

      const copy: Note = {
        ...source,
        id: 'note-2',
        title: '原始笔记 (副本)',
        favorite: false,
      };

      (mockRepository.findById as any).mockResolvedValue(source);
      (mockRepository.create as any).mockResolvedValue(copy);

      const result = await service.duplicate('note-1');

      expect(result.title).toContain('副本');
      expect(result.id).not.toBe(source.id);
      expect(mockRepository.create).toHaveBeenCalledWith({
        title: '原始笔记 (副本)',
        content: '原始内容',
        folderId: 'folder-1',
        tagIds: ['tag-1'],
      });
    });
  });
});
