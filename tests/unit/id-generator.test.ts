/**
 * ID生成器 单元测试
 */

import { describe, it, expect } from 'vitest';
import { uuid, shortId, prefixedId, noteId } from '../../src/shared/utils/id';

describe('ID生成器', () => {
  describe('uuid', () => {
    it('应该生成非空字符串', () => {
      const id = uuid();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('应该生成唯一ID', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        ids.add(uuid());
      }
      expect(ids.size).toBe(1000);
    });

    it('应该符合UUID格式', () => {
      const id = uuid();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe('shortId', () => {
    it('应该生成8位短ID', () => {
      const id = shortId();
      expect(id.length).toBe(8);
    });

    it('应该只包含小写字母和数字', () => {
      const id = shortId();
      expect(id).toMatch(/^[a-z0-9]{8}$/);
    });

    it('应该生成唯一ID', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) {
        ids.add(shortId());
      }
      expect(ids.size).toBe(1000);
    });
  });

  describe('prefixedId', () => {
    it('应该生成带前缀的ID', () => {
      const id = prefixedId('test');
      expect(id.startsWith('test_')).toBe(true);
    });

    it('应该生成唯一ID', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(prefixedId('test'));
      }
      expect(ids.size).toBe(100);
    });

    it('应该支持不同前缀', () => {
      const id1 = prefixedId('note');
      const id2 = prefixedId('conv');
      expect(id1.startsWith('note_')).toBe(true);
      expect(id2.startsWith('conv_')).toBe(true);
    });
  });

  describe('noteId', () => {
    it('应该生成n_前缀的笔记ID', () => {
      const id = noteId();
      expect(id.startsWith('n_')).toBe(true);
    });

    it('应该生成唯一的笔记ID', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(noteId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('ID格式验证', () => {
    it('prefixedId应该只包含字母数字和下划线', () => {
      const id = prefixedId('test_prefix');
      expect(id).toMatch(/^[a-zA-Z0-9_]+$/);
    });

    it('shortId不应该包含特殊字符', () => {
      const id = shortId();
      expect(id).not.toContain(' ');
      expect(id).not.toContain('-');
      expect(id).not.toContain('.');
      expect(id).not.toContain('@');
    });
  });
});
