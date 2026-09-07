/**
 * 工具函数测试
 */

import { describe, it, expect } from 'vitest';
import { formatDate, formatRelativeTime, debounce, throttle, generateId, classNames } from '../../src/shared/utils/helpers';

describe('工具函数', () => {
  describe('formatDate', () => {
    it('应该格式化日期为YYYY-MM-DD', () => {
      const date = new Date('2026-01-15T10:30:00');
      expect(formatDate(date)).toBe('2026-01-15');
    });

    it('应该支持自定义格式', () => {
      const date = new Date('2026-01-15T10:30:00');
      expect(formatDate(date, 'YYYY年MM月DD日')).toBe('2026年01月15日');
    });
  });

  describe('formatRelativeTime', () => {
    it('应该显示"刚刚"', () => {
      const now = new Date();
      expect(formatRelativeTime(now.toISOString())).toBe('刚刚');
    });

    it('应该显示"X分钟前"', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(date.toISOString())).toBe('5分钟前');
    });

    it('应该显示"X小时前"', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000);
      expect(formatRelativeTime(date.toISOString())).toBe('3小时前');
    });
  });

  describe('generateId', () => {
    it('应该生成唯一ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
    });

    it('应该支持前缀', () => {
      const id = generateId('note');
      expect(id.startsWith('note_')).toBe(true);
    });
  });

  describe('classNames', () => {
    it('应该合并类名', () => {
      expect(classNames('foo', 'bar')).toBe('foo bar');
    });

    it('应该过滤假值', () => {
      expect(classNames('foo', false, null, undefined, '', 'bar')).toBe('foo bar');
    });

    it('应该支持条件类名', () => {
      const isActive = true;
      expect(classNames('base', isActive && 'active')).toBe('base active');
    });
  });

  describe('debounce', () => {
    it('应该延迟执行函数', () => {
      let count = 0;
      const fn = debounce(() => count++, 100);
      fn();
      fn();
      fn();
      expect(count).toBe(0);
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(count).toBe(1);
          resolve(true);
        }, 150);
      });
    });
  });

  describe('throttle', () => {
    it('应该限制函数执行频率', () => {
      let count = 0;
      const fn = throttle(() => count++, 100);
      fn();
      fn();
      fn();
      expect(count).toBe(1);
      return new Promise((resolve) => {
        setTimeout(() => {
          fn();
          expect(count).toBe(2);
          resolve(true);
        }, 150);
      });
    });
  });
});
