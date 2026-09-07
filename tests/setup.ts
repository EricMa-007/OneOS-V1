/**
 * Vitest 测试环境配置
 */

import { afterEach, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';

// 全局测试配置
beforeEach(() => {
  // 清除所有mock
  vi.clearAllMocks();
});

afterEach(() => {
  // 恢复所有mock
  vi.restoreAllMocks();
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock IndexedDB
const mockIDBDatabase = {
  transaction: vi.fn(),
  objectStore: vi.fn(),
  close: vi.fn(),
};

const mockIDBTransaction = {
  objectStore: vi.fn(),
  complete: Promise.resolve(),
  abort: vi.fn(),
};

const mockIDBObjectStore = {
  add: vi.fn(),
  put: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  delete: vi.fn(),
  count: vi.fn(),
  openCursor: vi.fn(),
  index: vi.fn(),
};

Object.defineProperty(window, 'indexedDB', {
  value: {
    open: vi.fn(() => ({
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
      result: mockIDBDatabase,
    })),
    deleteDatabase: vi.fn(),
    cmp: vi.fn(),
  },
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getTracks: () => [{ stop: vi.fn() }],
    })),
  },
});
