/**
 * 设置Repository IndexedDB实现
 * 设置使用单例模式，只有一条记录
 */

import { AppSettings, DEFAULT_SETTINGS, mergeSettings } from '../../domain/models/setting';
import { ISettingsRepository } from '../../domain/repositories/settings-repository';

const SETTINGS_KEY = 'app_settings';

export class IndexedDBSettingsRepository implements ISettingsRepository {
  private db: IDBDatabase | null = null;
  private storeName = 'settings';

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('OneOS', 2);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async get(): Promise<AppSettings> {
    // 优先从localStorage读取（更快）
    const saved = localStorage.getItem('oneos-settings');
    if (saved) {
      try {
        return mergeSettings(DEFAULT_SETTINGS, JSON.parse(saved));
      } catch {
        // 解析失败，使用默认
      }
    }

    // 从IndexedDB读取
    try {
      const db = await this.getDB();
      const result = await new Promise<IDBValidKey>((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const req = tx.objectStore(this.storeName).get(SETTINGS_KEY);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      if (result?.value) {
        const settings = mergeSettings(DEFAULT_SETTINGS, result.value);
        localStorage.setItem('oneos-settings', JSON.stringify(settings));
        return settings;
      }
    } catch {
      // IndexedDB不可用，使用localStorage
    }

    return { ...DEFAULT_SETTINGS };
  }

  async update(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.get();
    const updated = mergeSettings(current, updates);

    // 写入localStorage
    localStorage.setItem('oneos-settings', JSON.stringify(updated));

    // 写入IndexedDB
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        tx.objectStore(this.storeName).put({ key: SETTINGS_KEY, value: updated, updatedAt: new Date().toISOString() });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // localStorage已经写入，IndexedDB失败不影响
    }

    return updated;
  }

  async reset(): Promise<AppSettings> {
    localStorage.removeItem('oneos-settings');
    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        tx.objectStore(this.storeName).delete(SETTINGS_KEY);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // ignore
    }
    return { ...DEFAULT_SETTINGS };
  }

  async getVersion(): Promise<string> {
    const settings = await this.get();
    return settings.version;
  }

  async exportSettings(): Promise<string> {
    const settings = await this.get();
    return JSON.stringify(settings, null, 2);
  }

  async importSettings(json: string): Promise<AppSettings> {
    const parsed = JSON.parse(json);
    const settings = mergeSettings(DEFAULT_SETTINGS, parsed);
    localStorage.setItem('oneos-settings', JSON.stringify(settings));
    return settings;
  }
}
